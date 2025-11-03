import { formatLinkedInPost, validatePostLength, addSmartHashtags } from '../utils/postFormatting';
import enhancedGenerator from '../utils/enhancedGenerator';
import { ragService } from './RAGService';
import { retrieveSimilar } from './vectorStore';
import engagementPredictor from './engagementPredictor';
import { generateDraft } from './localGenerator';
import { generateWithModel } from './generator';

export type Tone = 'casual' | 'professional' | 'technical';

interface GenerateOptions {
  tone: Tone;
  showEmojis?: boolean;
  showHashtags?: boolean;
  model?: string;
}

interface PostGenerationResult {
  content: string;
  metrics: {
    engagement: number;
    impact: number;
    relevance: number;
  };
}

class PostGenerationService {
  private async analyzeContent(content: string): Promise<{
    engagement: number;
    impact: number;
    relevance: number;
  }> {
    try {
      const engagement = await engagementPredictor.scoreEngagement(content)
      const impact = Math.max(0, Math.min(1, engagement * 0.9 + (content.length > 200 ? 0.05 : 0)))
      const relevance = Math.max(0, Math.min(1, engagement * 0.8 + 0.1))
      return { engagement, impact, relevance }
    } catch (e) {
      return {
    //   engagement: 0.85,
    //   impact: 0.90,
    //   relevance: 0.75,
    // };

        engagement: 0.5,
        impact: 0.5,
        relevance: 0.5,
      }
    }
  }

  private async suggestHashtags(content: string): Promise<string[]> {
    // This will be replaced with ML-based hashtag suggestions
    const commonProfessionalHashtags = [
      'Innovation',
      'Leadership',
      'ProfessionalDevelopment',
      'CareerGrowth',
      'Success'
    ];
    return commonProfessionalHashtags.slice(0, 3);
  }

  public async generateFinalPost(content: string, opts: GenerateOptions): Promise<PostGenerationResult> {
    let finalContent = content;
    try {
      // Get similar examples for style matching. Prefer embeddings-based retrieval (async)
      let examples: string[] = [];
      try {
        const sim = await retrieveSimilar(content, 3);
        if (sim && sim.length) {
          examples = sim.map(s => s.text)
        }
      } catch (e) {
        // ignore and fall back
      }

      if (!examples.length) {
        // fallback to token-based RAG service (synchronous)
        try {
          examples = ragService.getSimilarExamples(content, 3);
        } catch (e) {
          examples = []
        }
      }

      // If no content provided, seed from local generator draft
      if (!finalContent || !finalContent.trim()) {
        try {
          finalContent = await generateDraft({ goal: 'Share a professional update', tone: opts.tone });
        } catch (e) {
          // fallback to empty string and continue
          finalContent = '';
        }
      }

      // If a generator model is selected and isn't the heuristic fallback, try it first
      try {
        const prompt = [finalContent, ...(examples || [])].filter(Boolean).join('\n\n---\n\n')
        if (opts.model && opts.model !== 'heuristic') {
          // pass model selection through to generator wrapper if supported
          const modelOut = await (generateWithModel as any)(prompt, { maxTokens: 256, timeoutMs: 8000, model: opts.model })
          if (modelOut && modelOut.trim()) {
            finalContent = modelOut
          }
        } else {
          // no model selected or heuristic requested — skip on-device generator
        }
      } catch (e) {
        // ignore generator model failures and continue with heuristics
      }

      // Enhance the content based on tone (formatting, hooks, CTAs, hashtags)
      finalContent = enhancedGenerator.enhancePost(finalContent, {
        tone: opts.tone,
        examples,
      });
    } catch (e) {
      // fallback if RAG fails for any reason
      try {
        finalContent = enhancedGenerator.enhancePost(content || '', opts);
      } catch (err) {
        // keep finalContent as-is and continue to formatting fallback below
      }
    }

    // As a safety-net, fall back to formatting and hashtag helpers if enhancer returns empty
    if (!finalContent || !finalContent.trim()) {
      // As last resort, use the input content or a freshly generated draft
      const seed = content && content.trim() ? content : (await generateDraft({ goal: 'Share a professional update' })) || '';
      finalContent = formatLinkedInPost(seed);
      const hashtags = await this.suggestHashtags(finalContent);
      finalContent = addSmartHashtags(finalContent, hashtags);
    }

    // Validate length
    if (!validatePostLength(finalContent)) {
      // enforceLength in generator should usually handle this, but double-check
      throw new Error('Post exceeds LinkedIn\'s 3000 character limit');
    }

    // Analyze the final content to provide metrics to the UI
    const metrics = await this.analyzeContent(finalContent);

    return {
      content: finalContent,
      metrics
    };
  }
}

export const postGenerationService = new PostGenerationService();
import { formatLinkedInPost, validatePostLength, addSmartHashtags } from '../utils/postFormatting';
import enhancedGenerator from '../utils/enhancedGenerator';
import { ragService } from './RAGService';

export type Tone = 'casual' | 'professional' | 'technical';

interface GenerateOptions {
  tone: Tone;
  showEmojis?: boolean;
  showHashtags?: boolean;
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
    // This will be replaced with actual ML model predictions
    return {
      engagement: 0.85,
      impact: 0.90,
      relevance: 0.75,
    };
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
      // Get similar examples for style matching
      const examples = ragService.getSimilarExamples(content, 3);
      
      // Enhance the content based on tone
      finalContent = enhancedGenerator.enhancePost(content, {
        tone: opts.tone,
        examples,
      });
    } catch (e) {
      // fallback if RAG fails for any reason
      finalContent = enhancedGenerator.enhancePost(content, opts);
    }

    // As a safety-net, fall back to formatting and hashtag helpers if enhancer returns empty
    if (!finalContent || !finalContent.trim()) {
      finalContent = formatLinkedInPost(content);
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
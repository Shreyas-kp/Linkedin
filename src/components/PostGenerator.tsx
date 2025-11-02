import React, { useState } from 'react';
import { postGenerationService } from '../services/PostGenerationService';
import { MetricsPanel } from './MetricsPanel';
import { useTheme } from '../context/ThemeContext';
import { PaperAirplaneIcon, ClipboardDocumentIcon, ShareIcon } from '@heroicons/react/24/outline';
import type { Tone } from '../utils/enhancedGenerator';

interface PostGeneratorProps {
  initialContent?: string;
}

interface Metrics {
  engagement: number;
  impact: number;
  relevance: number;
}

export const PostGenerator: React.FC<PostGeneratorProps> = ({ initialContent = '' }) => {
  const { toneStyle } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    engagement: 75,
    impact: 85,
    relevance: 65
  });

  const generatePost = async () => {
    try {
      setIsGenerating(true);
      const result = await postGenerationService.generateFinalPost(content, {
        tone: toneStyle as Tone,
      });
      setContent(result.content);
      setMetrics({
        engagement: result.metrics.engagement || 75,
        impact: result.metrics.impact || 85,
        relevance: result.metrics.relevance || 65
      });
    } catch (error) {
      console.error('Error generating post:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // TODO: Add toast notification
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareToLinkedIn = () => {
    const encodedText = encodeURIComponent(content);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Post Editor */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Compose Your Post</h2>
        <textarea
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder="Share your professional insights..."
          className="textarea mb-4"
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button 
            className="btn-primary"
            onClick={generatePost}
            disabled={isGenerating}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button 
            className="btn-secondary"
            onClick={copyToClipboard}
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
            Copy
          </button>
          <button 
            className="btn-secondary"
            onClick={shareToLinkedIn}
          >
            <ShareIcon className="w-5 h-5" />
            Share to LinkedIn
          </button>
        </div>
      </div>

      {/* Metrics Panel */}
      <MetricsPanel
        engagement={metrics.engagement}
        impact={metrics.impact}
        relevance={metrics.relevance}
      />
    </div>
  );
};
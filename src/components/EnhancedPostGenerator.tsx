import React, { useState } from 'react';
import { Card } from './Card';
import { TextArea } from './TextArea';
import { Button } from './Button';

interface PostTemplateProps {
  template: string;
  onSelect: (template: string) => void;
}

const PostTemplate: React.FC<PostTemplateProps> = ({ template, onSelect }) => (
  <div 
    onClick={() => onSelect(template)}
    className="p-4 border border-linkedin-border rounded-lg hover:bg-linkedin-lighter cursor-pointer transition-colors"
  >
    <p className="text-sm text-linkedin-text whitespace-pre-wrap">{template}</p>
  </div>
);

const LINKEDIN_TEMPLATES = {
  achievement: "🎉 Excited to share that [achievement]\n\n🔑 Key highlights:\n• [point 1]\n• [point 2]\n• [point 3]\n\nGrateful for [mention key people/support]\n\n#Celebration #Professional #Growth",
  announcement: "📢 Big news! [announcement]\n\n💡 What this means:\n• [impact]\n• [benefit]\n• [future implications]\n\nLooking forward to [next steps]\n\n#Announcement #Innovation #Future",
  learning: "📚 Just completed [course/certification]\n\nKey learnings:\n1. [learning 1]\n2. [learning 2]\n3. [learning 3]\n\nExcited to apply these skills in [context]\n\n#Learning #Professional #Growth",
  insight: "💡 Professional Insight:\n\n[Main observation]\n\nWhy this matters:\n• [reason 1]\n• [reason 2]\n• [reason 3]\n\nWhat are your thoughts?\n\n#Insight #Industry #Discussion"
};

interface Metrics {
  engagement: number;
  readability: number;
  professionalism: number;
  impact: number;
}

export const EnhancedPostGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'enhance' | 'templates'>('write');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateEnhancedPost = async () => {
    setIsGenerating(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const enhancedContent = improveContent(content);
    setContent(enhancedContent);
    
    // Simulate metrics calculation
    setMetrics({
      engagement: 0.85,
      readability: 0.92,
      professionalism: 0.88,
      impact: 0.90
    });

    // Generate improvement suggestions
    setSuggestions([
      "Add a call-to-action at the end",
      "Include specific numbers or statistics",
      "Mention your role or company context",
      "Add relevant industry hashtags"
    ]);

    setIsGenerating(false);
  };

  const improveContent = (input: string): string => {
    // This will be replaced with actual ML model processing
    const improved = input.trim();
    const hashtags = getRelevantHashtags(improved);
    const callToAction = "\\n\\nThoughts? Let me know in the comments! 💭";
    return `${improved}${callToAction}\\n\\n${hashtags}`;
  };

  const getRelevantHashtags = (text: string): string => {
    // This will be enhanced with ML-based tag generation
    return "#Innovation #Professional #Growth #Leadership";
  };

  const MetricBar = ({ value, label }: { value: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-linkedin-blue rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card>
        <div className="border-b border-linkedin-border mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('write')}
              className={\`px-4 py-2 font-medium \${
                activeTab === 'write'
                  ? 'text-linkedin-blue border-b-2 border-linkedin-blue'
                  : 'text-linkedin-text hover:text-linkedin-blue'
              }\`}
            >
              Write
            </button>
            <button
              onClick={() => setActiveTab('enhance')}
              className={\`px-4 py-2 font-medium \${
                activeTab === 'enhance'
                  ? 'text-linkedin-blue border-b-2 border-linkedin-blue'
                  : 'text-linkedin-text hover:text-linkedin-blue'
              }\`}
            >
              Enhance
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={\`px-4 py-2 font-medium \${
                activeTab === 'templates'
                  ? 'text-linkedin-blue border-b-2 border-linkedin-blue'
                  : 'text-linkedin-text hover:text-linkedin-blue'
              }\`}
            >
              Templates
            </button>
          </div>
        </div>

        {activeTab === 'write' && (
          <div className="space-y-4">
            <TextArea
              label="Write your post"
              placeholder="Share your professional story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[200px]"
            />
            <Button 
              variant="primary"
              onClick={generateEnhancedPost}
              disabled={isGenerating || !content.trim()}
            >
              {isGenerating ? 'Enhancing...' : 'Enhance Post'}
            </Button>
          </div>
        )}

        {activeTab === 'enhance' && metrics && (
          <div className="space-y-6">
            <div className="space-y-4">
              <MetricBar value={metrics.engagement} label="Engagement Potential" />
              <MetricBar value={metrics.readability} label="Readability" />
              <MetricBar value={metrics.professionalism} label="Professional Tone" />
              <MetricBar value={metrics.impact} label="Impact Score" />
            </div>
            
            <div className="border-t border-linkedin-border pt-4">
              <h3 className="font-medium text-linkedin-text mb-2">Suggestions for Improvement</h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-linkedin-blue">•</span>
                    <span className="text-sm text-linkedin-text">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h3 className="font-medium text-linkedin-text mb-2">Choose a Template</h3>
            <div className="grid gap-4">
              {Object.entries(LINKEDIN_TEMPLATES).map(([key, template]) => (
                <PostTemplate
                  key={key}
                  template={template}
                  onSelect={(template) => {
                    setContent(template);
                    setActiveTab('write');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {content && (
        <Card>
          <h3 className="text-lg font-semibold text-linkedin-text mb-4">Preview</h3>
          <div className="bg-white p-6 rounded-lg border border-linkedin-border whitespace-pre-wrap">
            {content}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-linkedin-text">
              {content.length}/3000 characters
            </span>
            <Button 
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(content)}
            >
              Copy to Clipboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
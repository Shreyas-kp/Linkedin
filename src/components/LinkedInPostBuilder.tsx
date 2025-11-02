import React, { useState } from 'react';
import { Card } from './Card';
import { TextArea } from './TextArea';
import { Button } from './Button';

// LinkedIn post templates with proven formats
const LINKEDIN_TEMPLATES = {
  achievement: `🎉 Excited to share that [achievement]

🔑 Key highlights:
• [point 1]
• [point 2]
• [point 3]

Grateful for [mention key people/support]

#Celebration #Professional #Growth`,
  
  announcement: `📢 Big news! [announcement]

💡 What this means:
• [impact]
• [benefit]
• [future implications]

Looking forward to [next steps]

#Announcement #Innovation #Future`,
  
  insight: `💡 Professional Insight:

[Main observation]

Why this matters:
• [reason 1]
• [reason 2]
• [reason 3]

What are your thoughts?

#Insight #Industry #Discussion`,

  milestone: `🌟 Milestone Achieved: [milestone]

The journey:
1. [challenge overcome]
2. [key learning]
3. [growth moment]

Thank you [mentions] for your support!

#Success #Growth #Journey`,

  reflection: `🤔 Industry Reflection:

After [experience/observation], I've realized:

1. [insight 1]
2. [insight 2]
3. [insight 3]

Question for my network: [thought-provoking question]

#ThoughtLeadership #Industry #Growth`
};

interface PostTemplateProps {
  template: string;
  title: string;
  onSelect: (template: string) => void;
}

const PostTemplate: React.FC<PostTemplateProps> = ({ template, title, onSelect }) => (
  <div 
    onClick={() => onSelect(template)}
    className="p-4 border border-linkedin-border rounded-lg hover:bg-linkedin-lighter cursor-pointer transition-colors"
  >
    <h4 className="font-medium text-linkedin-blue mb-2">{title}</h4>
    <p className="text-sm text-linkedin-text whitespace-pre-wrap">{template}</p>
  </div>
);

interface Metrics {
  engagement: number;
  readability: number;
  professionalism: number;
  impact: number;
}

interface ContentSuggestion {
  type: 'improvement' | 'warning' | 'tip';
  message: string;
}

export const LinkedInPostBuilder: React.FC = () => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [activeView, setActiveView] = useState<'write' | 'templates' | 'enhance'>('write');
  const [showEmojis, setShowEmojis] = useState(false);

  const EMOJIS = {
    positive: ['🎉', '🌟', '💡', '🚀', '💪', '🎯', '🌱', '✨', '🏆', '📈'],
    business: ['💼', '📊', '🤝', '📱', '💻', '📈', '🎯', '🔑', '💡', '📝'],
    tech: ['💻', '🔧', '⚙️', '📱', '🚀', '🔌', '💾', '🌐', '📊', '💡']
  };

  const generateEnhancedPost = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate AI processing
    const enhancedContent = improveContent(content);
    setContent(enhancedContent);
    
    setMetrics({
      engagement: 0.85 + Math.random() * 0.1,
      readability: 0.88 + Math.random() * 0.1,
      professionalism: 0.90 + Math.random() * 0.08,
      impact: 0.87 + Math.random() * 0.1
    });

    setSuggestions([
      {
        type: 'improvement',
        message: 'Add specific numbers or metrics to strengthen your points'
      },
      {
        type: 'tip',
        message: 'Consider mentioning industry trends or market context'
      },
      {
        type: 'warning',
        message: 'Your post could benefit from a stronger call-to-action'
      }
    ]);

    setIsGenerating(false);
    setActiveView('enhance');
  };

  const improveContent = (input: string): string => {
    // Will be replaced with actual ML model processing
    const improved = input.trim();
    const hashtags = getRelevantHashtags(improved);
    const callToAction = "\n\n👉 What's your take on this? Share your thoughts below!\n\n";
    return `${improved}${callToAction}${hashtags}`;
  };

  const getRelevantHashtags = (text: string): string => {
    // Will be enhanced with ML-based tag generation
    const hashtags = [
      "#Innovation",
      "#Professional",
      "#Leadership",
      "#Growth",
      "#Success",
      "#Business",
      "#CareerGrowth"
    ];
    return hashtags.slice(0, 4).join(" ");
  };

  const MetricBar = ({ value, label }: { value: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={
          value >= 0.9 ? 'text-green-600' :
          value >= 0.8 ? 'text-blue-600' :
          'text-yellow-600'
        }>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 0.9 ? 'bg-green-500' :
            value >= 0.8 ? 'bg-linkedin-blue' :
            'bg-yellow-500'
          }`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );

  const renderSuggestion = (suggestion: ContentSuggestion) => {
    const iconMap = {
      improvement: '💡',
      warning: '⚠️',
      tip: '💫'
    };

    return (
      <div className="flex items-start space-x-2 p-2 rounded bg-linkedin-lighter">
        <span>{iconMap[suggestion.type]}</span>
        <span className="text-sm text-linkedin-text">{suggestion.message}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="bg-gradient-to-r from-linkedin-blue to-blue-700 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold">LinkedIn Post Builder</h2>
        <p className="text-blue-100">Create engaging, professional posts with AI-powered enhancements</p>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border border-linkedin-border">
        <div className="flex border-b border-linkedin-border">
          {['write', 'templates', 'enhance'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={`px-6 py-3 font-medium ${
                activeView === view 
                  ? 'text-linkedin-blue border-b-2 border-linkedin-blue bg-linkedin-lighter'
                  : 'text-linkedin-text hover:bg-gray-50'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeView === 'write' && (
            <div className="space-y-6">
              <TextArea
                label="Write your LinkedIn post"
                placeholder="Share your professional story, achievement, or insight..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px]"
              />
              
              {showEmojis && (
                <div className="border rounded p-4 bg-linkedin-lighter">
                  <h4 className="font-medium mb-2">Quick Emojis</h4>
                  <div className="grid grid-cols-10 gap-2">
                    {Object.entries(EMOJIS).map(([category, emojiList]) => (
                      <div key={category} className="col-span-10">
                        <h5 className="text-xs text-linkedin-text mb-1 capitalize">{category}</h5>
                        <div className="flex space-x-2">
                          {emojiList.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => setContent(c => c + emoji)}
                              className="hover:bg-white rounded p-1 transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="space-x-4">
                  <Button 
                    variant="primary"
                    onClick={generateEnhancedPost}
                    disabled={isGenerating || !content.trim()}
                  >
                    {isGenerating ? 'Enhancing...' : 'Enhance Post'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowEmojis(!showEmojis)}
                  >
                    {showEmojis ? 'Hide Emojis' : 'Show Emojis'}
                  </Button>
                </div>
                <span className="text-sm text-linkedin-text">
                  {content.length}/3000 characters
                </span>
              </div>
            </div>
          )}

          {activeView === 'templates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-linkedin-text">Professional Templates</h3>
              <div className="grid gap-4">
                {Object.entries(LINKEDIN_TEMPLATES).map(([key, template]) => (
                  <PostTemplate
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    template={template}
                    onSelect={(template) => {
                      setContent(template);
                      setActiveView('write');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeView === 'enhance' && metrics && (
            <div className="space-y-8">
              <div className="grid gap-4">
                <MetricBar value={metrics.engagement} label="Engagement Score" />
                <MetricBar value={metrics.readability} label="Readability" />
                <MetricBar value={metrics.professionalism} label="Professional Tone" />
                <MetricBar value={metrics.impact} label="Overall Impact" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-linkedin-text">Improvement Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index}>{renderSuggestion(suggestion)}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {content && (
        <Card className="bg-white shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-linkedin-text">Ready to Post</h3>
              <Button 
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(content)}
              >
                Copy to Clipboard
              </Button>
            </div>
            <div className="bg-linkedin-lighter p-6 rounded-lg border border-linkedin-border whitespace-pre-wrap">
              {content}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
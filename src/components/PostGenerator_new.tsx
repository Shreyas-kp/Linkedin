import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { TextArea } from './TextArea';
import { Button } from './Button';
import { postGenerationService } from '../services/PostGenerationService';
import { MetricIndicator } from './MetricIndicator';
import { HashtagDisplay } from './HashtagDisplay';
import StyleLibrary from './StyleLibrary';
// Note: You can remove the ragService if it's not needed

interface PostGeneratorProps {
  initialContent?: string;
}

interface Metrics {
  engagement: number;
  readability: number;
  professionalism: number;
}

export const PostGenerator: React.FC<PostGeneratorProps> = ({ initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional');
  const [audience, setAudience] = useState<'student' | 'professional' | 'recruiter'>('professional');
  const [toneIntensity, setToneIntensity] = useState<number>(60);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('postgen_prefs');
      if (!raw) return;
      const prefs = JSON.parse(raw);
      if (prefs.tone) setTone(prefs.tone);
      if (prefs.audience) setAudience(prefs.audience);
      if (typeof prefs.toneIntensity === 'number') setToneIntensity(prefs.toneIntensity);
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const savePrefs = () => {
    try {
      const prefs = { tone, audience, toneIntensity };
      localStorage.setItem('postgen_prefs', JSON.stringify(prefs));
    } catch (e) {}
  };

  const generatePost = async () => {
    try {
      setIsGenerating(true);
      const result = await postGenerationService.generateFinalPost(content, { tone, audience, toneIntensity });
      setContent(result.content);
      setMetrics(result.metrics);
    } catch (error) {
      console.error('Error generating post:', error);
      // Handle error appropriately
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-linkedin-blue mb-2">
          LinkedIn Post Optimizer
        </h1>
        <p className="text-linkedin-text">
          Privacy-first post enhancement powered by local AI
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            AI-Powered
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="mb-6">
            <TextArea
              label="Write your post"
              placeholder="Share your professional insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[200px] mb-4"
            />
            
            {/* Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-linkedin-text mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => { setTone(e.target.value as any); setTimeout(savePrefs, 0); }}
                    className="linkedin-input w-full"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-linkedin-text mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => { setAudience(e.target.value as any); setTimeout(savePrefs, 0); }}
                    className="linkedin-input w-full"
                  >
                    <option value="professional">Professional</option>
                    <option value="student">Student</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
              </div>

              {/* Tone Intensity & Presets */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-linkedin-text mb-1">
                    Tone intensity: {toneIntensity}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={toneIntensity}
                    onChange={(e) => { setToneIntensity(Number(e.target.value)); savePrefs(); }}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-linkedin-text">Presets:</span>
                  <button
                    className="linkedin-btn-secondary text-sm"
                    onClick={() => { setTone('casual'); setToneIntensity(35); savePrefs(); }}
                    type="button"
                  >
                    Casual
                  </button>
                  <button
                    className="linkedin-btn-secondary text-sm"
                    onClick={() => { setTone('professional'); setToneIntensity(60); savePrefs(); }}
                    type="button"
                  >
                    Professional
                  </button>
                  <button
                    className="linkedin-btn-secondary text-sm"
                    onClick={() => { setTone('technical'); setToneIntensity(80); savePrefs(); }}
                    type="button"
                  >
                    Technical
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <Button 
                variant="primary"
                onClick={generatePost}
                disabled={isGenerating || !content.trim()}
                className="w-48"
              >
                {isGenerating ? 'Optimizing...' : 'Generate Final Post'}
              </Button>
              <Button 
                variant="secondary"
                onClick={copyToClipboard}
                disabled={!content.trim()}
              >
                Copy to Clipboard
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {content && (
            <Card className="space-y-6">
              <h3 className="text-xl font-semibold text-linkedin-text">
                Ready to Post
              </h3>

              {/* Metrics Grid */}
              {metrics && (
                <div className="grid grid-cols-3 gap-6">
                  <MetricIndicator
                    label="Engagement"
                    value={metrics.engagement * 100}
                  />
                  <MetricIndicator
                    label="Readability"
                    value={metrics.readability * 100}
                  />
                  <MetricIndicator
                    label="Professionalism"
                    value={metrics.professionalism * 100}
                  />
                </div>
              )}

              {/* Post Preview */}
              <div className="bg-white p-6 rounded-lg border border-linkedin-border">
                <div className="whitespace-pre-wrap">{content}</div>
              </div>

              {/* Character Count */}
              <div className="flex justify-between items-center text-sm text-linkedin-text">
                <span>Character count: {content.length}/3000</span>
                {content.length > 2700 && (
                  <span className="text-yellow-600">
                    Approaching character limit
                  </span>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Style Library Sidebar */}
        <div className="lg:col-span-4">
          <Card className="sticky top-4">
            <StyleLibrary
              onSelectExample={(text) => setContent(text)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { postGenerationService } from '../services/PostGenerationService';
import { MetricsPanel } from './MetricsPanel';
import { useTheme } from '../context/ThemeContext';
import { PaperAirplaneIcon, ClipboardDocumentIcon, ShareIcon } from '@heroicons/react/24/outline';
import type { Tone } from '../utils/enhancedGenerator';
import Toast from './Toast';
import { saveDraft, openDBAndGetAll, deleteDraft, saveOrUpdateAutosave, getAutosave } from '../services/drafts';

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
  const [drafts, setDrafts] = useState<Array<{ id: string; title?: string; content: string; created: number }>>([])
  const [showDrafts, setShowDrafts] = useState(false)
  const autosaveRef = useRef<string | null>(null)
  const [lastAutosave, setLastAutosave] = useState<number | null>(null)
  const lastSavedContentRef = useRef<string>('')
  const [now, setNow] = useState<number>(Date.now())

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
      setToast('Copied to clipboard')
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setToast('Copy failed')
    }
  };

  const [toast, setToast] = useState<string | null>(null)

  const shareToLinkedIn = () => {
    const encodedText = encodeURIComponent(content);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedText}`, '_blank');
  };

  // Drafts: load list and autosave every 5s
  useEffect(() => {
    // load drafts and autosave id
    async function initDrafts() {
      try {
        const d = await openDBAndGetAll()
        setDrafts(d)
      } catch (e) {
        console.error('Failed to load drafts', e)
      }
    }
    initDrafts()

    async function initAutosave() {
      try {
        const autos = await getAutosave()
        if (autos) {
          autosaveRef.current = autos.id
          // reflect persisted autosave timestamp and content so the UI shows correct relative time
          setLastAutosave(autos.created)
          lastSavedContentRef.current = autos.content || ''
        }
      } catch (e) {
        // ignore
      }
    }
    initAutosave()

    const id = setInterval(() => {
      // only autosave if content changed since last autosave to avoid creating many writes
      if (content === lastSavedContentRef.current) return
      // silently autosave current content
      saveOrUpdateAutosave(content).then((savedId) => {
        if (!autosaveRef.current) autosaveRef.current = savedId
        lastSavedContentRef.current = content
        setLastAutosave(Date.now())
      }).catch(err => {
        // ignore autosave failures
        console.debug('autosave failed', err)
      })
    }, 5000)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update `now` every second while we have a lastAutosave so the relative time label stays fresh
  useEffect(() => {
    if (!lastAutosave) return;
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [lastAutosave])

  function formatRelativeTime(ts: number | null) {
    if (!ts) return 'never'
    const diff = Math.max(0, Math.floor((now - ts) / 1000))
    if (diff < 60) return `saved ${diff}s ago`
    const mins = Math.floor(diff / 60)
    if (mins < 60) return `saved ${mins}m ago`
    const hours = Math.floor(mins / 60)
    return `saved ${hours}h ago`
  }

  const handleSaveDraft = async () => {
    try {
      const id = await saveDraft(content)
      setToast('Draft saved')
      const d = await openDBAndGetAll()
      setDrafts(d)
    } catch (e) {
      console.error('Failed to save draft', e)
      setToast('Save failed')
    }
  }

  const handleRestoreDraft = async (id: string) => {
    const d = drafts.find(x => x.id === id)
    if (!d) return
    setContent(d.content)
    setToast('Draft restored')
  }

  const handleDeleteDraft = async (id: string) => {
    try {
      await deleteDraft(id)
      const d = await openDBAndGetAll()
      setDrafts(d)
      setToast('Draft deleted')
    } catch (e) {
      console.error('Failed to delete draft', e)
      setToast('Delete failed')
    }
  }

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

        <div className="text-xs text-gray-500 mb-3">
          Last autosave: {formatRelativeTime(lastAutosave)}
        </div>

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
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowDrafts(s => !s)}
          >
            Drafts {drafts.length ? `(${drafts.length})` : ''}
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

      {/* Drafts list */}
      {showDrafts && (
        <div className="card">
          <h3 className="font-semibold mb-2">Drafts</h3>
          {drafts.length === 0 && <div className="text-sm text-muted-foreground">No drafts yet.</div>}
          <ul className="space-y-2">
            {drafts.map(d => (
              <li key={d.id} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium">{d.title || d.content.slice(0, 60)}</div>
                  <div className="text-xs text-gray-500">{new Date(d.created).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => handleRestoreDraft(d.id)}>Restore</button>
                  <button className="btn-secondary" onClick={() => handleDeleteDraft(d.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Panel */}
      <MetricsPanel
        engagement={metrics.engagement}
        impact={metrics.impact}
        relevance={metrics.relevance}
      />
      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
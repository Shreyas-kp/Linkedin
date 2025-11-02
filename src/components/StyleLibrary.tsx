import React, { useEffect, useState } from 'react';
import { openDBAndGetAll, savePost, deletePost } from '../services/vectorStore';
import { Button } from './Button';

interface Example {
  id: number;
  text: string;
}

interface StyleLibraryProps {
  onSelectExample?: (text: string) => void;
}

export default function StyleLibrary({ onSelectExample }: StyleLibraryProps) {
  const [items, setItems] = useState<Example[]>([]);

  useEffect(() => {
    let mounted = true;
    openDBAndGetAll().then(list => { if (mounted) setItems(list); });
    return () => { mounted = false; };
  }, []);

  const addExample = async () => {
    const text = prompt('Paste a successful post (will stay local)');
    if (!text) return;
    await savePost({ text });
    const list = await openDBAndGetAll();
    setItems(list);
  };

  const remove = async (id: number) => {
    await deletePost(id);
    const list = await openDBAndGetAll();
    setItems(list);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-linkedin-text">
            Style Library
          </h3>
          <p className="text-sm text-linkedin-text">
            Your saved post examples
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={addExample}
          className="whitespace-nowrap"
        >
          Add Example
        </Button>
      </div>
      
      <div className="space-y-4">
        {items.map((example) => (
          <div
            key={example.id}
            className="p-4 bg-white rounded-lg border border-linkedin-border hover:border-linkedin-blue transition-colors"
          >
            <p className="text-sm line-clamp-3 mb-2">
              {example.text}
            </p>
            
            <div className="flex justify-between items-center mt-3">
              {onSelectExample && (
                <Button
                  variant="secondary"
                  onClick={() => onSelectExample(example.text)}
                  className="text-sm"
                >
                  Use This
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => remove(example.id)}
                className="text-sm"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-6 text-linkedin-text">
            No examples yet. Add your first successful post to get started!
          </div>
        )}
      </div>
    </div>
  )
}

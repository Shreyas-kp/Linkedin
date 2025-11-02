import React from 'react';

interface HashtagDisplayProps {
  tags: string[];
  className?: string;
}

export const HashtagDisplay: React.FC<HashtagDisplayProps> = ({ tags, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-linkedin-lighter text-linkedin-blue"
        >
          {tag.startsWith('#') ? tag : `#${tag}`}
        </span>
      ))}
    </div>
  );
};
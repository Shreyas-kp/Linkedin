export const formatLinkedInPost = (content: string): string => {
  // Remove any "draft" or similar words
  let finalContent = content
    .replace(/\b(draft|rough|template)\b/gi, '')
    .trim();

  // Ensure proper spacing after punctuation
  finalContent = finalContent
    .replace(/([.!?])\s*(?=\S)/g, '$1 ')
    .replace(/,\s*(?=\S)/g, ', ');

  // Ensure paragraphs are properly separated
  finalContent = finalContent
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Add line breaks before hashtags if they exist
  if (finalContent.includes('#')) {
    finalContent = finalContent.replace(/\s*(#[^\s#]+)/g, '\n\n$1');
  }

  return finalContent;
};

export const validatePostLength = (content: string): boolean => {
  const MAX_LENGTH = 3000;
  return content.length <= MAX_LENGTH;
};

export const addSmartHashtags = (content: string, hashtags: string[]): string => {
  const relevantHashtags = hashtags
    .slice(0, 3) // LinkedIn best practice: use 3-5 hashtags
    .map(tag => `#${tag.replace(/\s+/g, '')}`);

  return `${content.trim()}\n\n${relevantHashtags.join(' ')}`;
};
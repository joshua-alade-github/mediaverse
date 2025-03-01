export const getImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
} = {}) => {
  if (!url) return '';

  const { width, height, quality = 75 } = options;
  const params = new URLSearchParams();

  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('fit', 'cover');

  return `/api/image?url=${encodeURIComponent(url)}&${params.toString()}`;
};
'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import { MediaReference, Post } from '@/types';
import { Image, Loader2, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CreatePostProps {
  communityId?: string;
  mediaId?: string;
  mediaType?: string;
  onPostCreated?: (post: Post) => void;
}

export function CreatePost({ 
  communityId, 
  mediaId, 
  mediaType,
  onPostCreated 
}: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MediaReference[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaReference | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // If mediaId is provided, try to load it
  useEffect(() => {
    if (mediaId) {
      // For external API media, we don't need to fetch details
      // as they should be available in the parent component
      console.log("Using external media ID:", mediaId, "of type:", mediaType);
    }
  }, [mediaId, mediaType]);

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500 text-center">
          Please sign in to create a post.
        </p>
      </div>
    );
  }

  const handleMediaSearch = async () => {
    if (!mediaSearch.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // This would need to search external APIs instead of the database
      // For now, just log that it would search
      console.log("Would search external APIs for:", mediaSearch);
      setSearchResults([]);
    } catch (err) {
      console.error('Error searching for media:', err);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!content.trim()) {
      setError('Content is required');
      setIsSubmitting(false);
      return;
    }
    
    try {
      let imagePath;
      
      // Upload image if provided
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${filePath}`;
      }
      
      // Prepare post data
      const postData: any = {
        user_id: user.id,
        title: title || undefined,
        content,
        community_id: communityId,
        image_url: imagePath,
        created_at: new Date().toISOString()
      };
      
      // Add media information if provided
      if (mediaId) {
        postData.media_id = mediaId;
        
        if (mediaType) {
          postData.media_type = mediaType;
        } else if (selectedMedia?.mediaType) {
          postData.media_type = selectedMedia.mediaType;
        }
      } else if (selectedMedia) {
        postData.media_id = selectedMedia.externalId;
        postData.media_type = selectedMedia.mediaType;
      }
      
      console.log("Creating post with data:", postData);

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select('*, user:user_profiles(*)')
        .single();
        
      if (postError) {
        console.error("Post creation error:", postError);
        throw postError;
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setSelectedMedia(null);
      setImage(null);
      setImagePreview(null);
      
      console.log("Post created successfully:", post);
      
      // Call the callback or redirect
      if (onPostCreated && post) {
        onPostCreated(post);
      } else if (mediaId) {
        router.refresh();
      } else if (communityId) {
        router.push(`/communities/${communityId}`);
        router.refresh();
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Error creating post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Create a Post
      </h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        {!mediaId && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Add Media (Optional)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search for movies, books, games..."
                className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleMediaSearch}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <ul className="mt-2 border border-gray-300 rounded-md overflow-hidden">
                {searchResults.map((result) => (
                  <li 
                    key={result.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedMedia(result);
                      setSearchResults([]);
                      setMediaSearch('');
                    }}
                  >
                    <div className="flex items-center">
                      {result.coverImage && (
                        <img
                          src={result.coverImage}
                          alt={result.title}
                          className="h-8 w-8 object-cover rounded-sm mr-2"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.mediaType}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {selectedMedia && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  {selectedMedia.coverImage && (
                    <img
                      src={selectedMedia.coverImage}
                      alt={selectedMedia.title}
                      className="h-10 w-10 object-cover rounded-sm mr-2"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{selectedMedia.title}</p>
                    <p className="text-xs text-gray-500">{selectedMedia.mediaType}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Add Image (Optional)
          </label>
          <div className="mt-1 flex items-center">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Image className="mr-2 h-4 w-4" />
              Upload Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          {imagePreview && (
            <div className="mt-2 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Posting...
              </>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
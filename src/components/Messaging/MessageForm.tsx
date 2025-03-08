'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Send, PaperclipIcon, X, Image, Loader2 } from 'lucide-react';

interface MessageFormProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export function MessageForm({ conversationId, onMessageSent }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

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
    
    if ((!message.trim() && !image) || !user || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imagePath;
      
      // Upload image if provided
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `message-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message-images/${filePath}`;
      }
      
      // Send message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message.trim() || null,
          image_url: imagePath,
          created_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      // Reset form
      setMessage('');
      setImage(null);
      setImagePreview(null);
      
      // Call callback
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-24 w-auto object-cover rounded-md"
          />
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setImagePreview(null);
            }}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={1}
          />
          <label className="absolute right-3 bottom-3 cursor-pointer text-gray-500 hover:text-gray-700">
            <Image className="h-5 w-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || (!message.trim() && !image)}
          className="p-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
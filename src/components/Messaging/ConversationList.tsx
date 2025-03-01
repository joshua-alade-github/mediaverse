'use client';

import { useState, useEffect } from 'react';
import { User, Conversation } from '@/types';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { timeAgo } from '@/utils/date';

interface ConversationWithParticipants extends Conversation {
  participants: User[];
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
}

export function ConversationList() {
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user:user_profiles(*)
          ),
          messages:messages(
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const formattedConversations = data.map(conv => ({
          ...conv,
          participants: conv.participants
            .map(p => p.user)
            .filter(p => p.id !== user.id),
          lastMessage: conv.messages[0],
        }));
        setConversations(formattedConversations);
      }
    };

    fetchConversations();

    // Subscribe to new messages
    const subscription = supabase
      .channel('new_message')
      .on('INSERT', { event: '*', schema: 'public', table: 'messages' }, 
        payload => {
          setConversations(prev => {
            const conversationIndex = prev.findIndex(
              c => c.id === payload.new.conversation_id
            );
            if (conversationIndex === -1) return prev;

            const newConversations = [...prev];
            newConversations[conversationIndex] = {
              ...newConversations[conversationIndex],
              lastMessage: {
                content: payload.new.content,
                createdAt: new Date(payload.new.created_at),
              },
            };
            return newConversations;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => setSelectedId(conversation.id)}
          className={`w-full p-4 hover:bg-gray-50 flex items-start space-x-3 ${
            selectedId === conversation.id ? 'bg-gray-50' : ''
          }`}
        >
          <Avatar user={conversation.participants[0]} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {conversation.participants.map(p => p.username).join(', ')}
              </p>
              {conversation.lastMessage && (
                <p className="text-xs text-gray-500">
                  {timeAgo(conversation.lastMessage.createdAt)}
                </p>
              )}
            </div>
            {conversation.lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {conversation.lastMessage.content}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
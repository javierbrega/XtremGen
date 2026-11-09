"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Send, Trash2, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../ui/Base';

interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    role_badge?: string;
  };
}

interface CommentsSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, onCommentAdded }) => {
  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('social_comments')
      .select('*,profiles(username,avatar_url,role_badge)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (Array.isArray(data)) {
      setComments(data);
    }
    setIsLoading(false);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const text = newComment.trim();

    // Optimistic item
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: CommentItem = {
      id: tempId,
      post_id: postId,
      user_id: user.id,
      content: text,
      created_at: new Date().toISOString(),
      profiles: {
        username: profile?.username || 'Gamer',
        avatar_url: profile?.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`,
        role_badge: profile?.role_badge || 'REBEL',
      },
    };

    setComments((prev) => [...prev, optimisticItem]);
    setNewComment('');

    const { data: inserted, error } = await supabase.from('social_comments').insert({
      post_id: postId,
      user_id: user.id,
      content: text,
    });

    setIsSubmitting(false);

    if (error) {
      // Revert on error
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      showNotification({
        title: 'Error al comentar',
        message: error.message || 'No se pudo guardar tu comentario.',
        type: 'error',
      });
    } else {
      if (onCommentAdded) onCommentAdded();
      loadComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await supabase.from('social_comments').delete().eq('id', commentId);
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-150">
      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-2">
          Sé el primero en dejar un comentario o jugada destacada.
        </p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
          {comments.map((c) => {
            const author = c.profiles?.username || 'Usuario XG';
            const avatar =
              c.profiles?.avatar_url ||
              `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${c.user_id}`;
            const isMine = user && user.id === c.user_id;

            return (
              <div key={c.id} className="flex gap-2.5 items-start group">
                <img
                  src={avatar}
                  alt={author}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{author}</span>
                      {c.profiles?.role_badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-primary/20 text-primary font-mono font-bold">
                          {c.profiles.role_badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar comentario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-zinc-300 leading-relaxed break-words">{c.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Comment Box */}
      <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-1">
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              profile ? `Comentar como @${profile.username}...` : 'Inicia sesión para comentar...'
            }
            className="w-full bg-black/60 border border-white/10 rounded-full pl-4 pr-10 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-30 disabled:hover:bg-primary text-white transition-all shadow-md"
            title="Publicar comentario"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

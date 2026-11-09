"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../../lib/motion';
import { ThumbsUp, Trophy, Flame, MessageCircle, Share2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface ReactionButtonsProps {
  postId: string;
  initialGg: number;
  initialMvp: number;
  initialFire: number;
  commentsCount?: number;
  onToggleComments?: () => void;
  isCommentsOpen?: boolean;
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  postId,
  initialGg,
  initialMvp,
  initialFire,
  commentsCount = 0,
  onToggleComments,
  isCommentsOpen = false,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [gg, setGg] = useState(initialGg);
  const [mvp, setMvp] = useState(initialMvp);
  const [fire, setFire] = useState(initialFire);

  const [hasGg, setHasGg] = useState(false);
  const [hasMvp, setHasMvp] = useState(false);
  const [hasFire, setHasFire] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load user's reactions for this post
  useEffect(() => {
    if (!user || !postId) return;
    supabase
      .from('social_reactions')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (Array.isArray(data)) {
          const types = new Set(data.map((r: any) => r.reaction_type));
          setHasGg(types.has('gg'));
          setHasMvp(types.has('mvp'));
          setHasFire(types.has('fire'));
        }
      });
  }, [user, postId]);

  const handleToggleReaction = async (type: 'gg' | 'mvp' | 'fire') => {
    if (!user) {
      openAuthModal();
      return;
    }

    let currentlyActive = false;
    if (type === 'gg') {
      currentlyActive = hasGg;
      setHasGg(!currentlyActive);
      setGg((prev) => (currentlyActive ? Math.max(prev - 1, 0) : prev + 1));
    } else if (type === 'mvp') {
      currentlyActive = hasMvp;
      setHasMvp(!currentlyActive);
      setMvp((prev) => (currentlyActive ? Math.max(prev - 1, 0) : prev + 1));
    } else if (type === 'fire') {
      currentlyActive = hasFire;
      setHasFire(!currentlyActive);
      setFire((prev) => (currentlyActive ? Math.max(prev - 1, 0) : prev + 1));
    }

    if (currentlyActive) {
      // Remove reaction
      await supabase
        .from('social_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', type);
    } else {
      // Add reaction
      await supabase.from('social_reactions').insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: type,
      });
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/social#post-${postId}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showNotification({
          title: 'Enlace copiado',
          message: 'Enlace a la publicación copiado al portapapeles.',
          type: 'success',
        });
      } catch {
        // clipboard fallback
      }
    }
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-white/5">
      {/* Reactions Group */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* GG Reaction */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggleReaction('gg')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
            hasGg
              ? 'bg-primary/20 text-primary border border-primary/40 font-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="GG (Bien jugado)"
        >
          <ThumbsUp className={`w-4 h-4 ${hasGg ? 'text-primary fill-primary/30' : ''}`} />
          <span className="text-xs font-bold">{gg}</span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">GG</span>
        </motion.button>

        {/* MVP Reaction */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggleReaction('mvp')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
            hasMvp
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="MVP (Jugador más valioso)"
        >
          <Trophy className={`w-4 h-4 ${hasMvp ? 'text-yellow-400 fill-yellow-400/30' : ''}`} />
          <span className="text-xs font-bold">{mvp}</span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">MVP</span>
        </motion.button>

        {/* Fire Reaction */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggleReaction('fire')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
            hasFire
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Fuego (Jugada insana)"
        >
          <Flame className={`w-4 h-4 ${hasFire ? 'text-orange-400 fill-orange-400/30' : ''}`} />
          <span className="text-xs font-bold">{fire}</span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">Fuego</span>
        </motion.button>
      </div>

      {/* Comments & Share Action */}
      <div className="flex items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleComments}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
            isCommentsOpen
              ? 'bg-white/15 text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Ver y agregar comentarios"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-bold">{commentsCount}</span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">Comentar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          title="Compartir publicación"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
};

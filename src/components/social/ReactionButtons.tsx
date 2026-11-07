"use client";

import React, { useState } from 'react';
import { motion } from '../../lib/motion';
import { ThumbsUp, Trophy, Flame, MessageCircle, Share2 } from 'lucide-react';

interface ReactionButtonsProps {
  initialGg: number;
  initialMvp: number;
  initialFire: number;
  comments?: string | number;
}

export const ReactionButtons = ({ initialGg, initialMvp, initialFire }: ReactionButtonsProps) => {
  const [gg, setGg] = useState(initialGg);
  const [mvp, setMvp] = useState(initialMvp);
  const [fire, setFire] = useState(initialFire);

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2 md:gap-4">
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => setGg(prev => prev + 1)}
          className="flex items-center gap-2 group"
        >
          <div className="p-2 rounded-full group-hover:bg-primary/20 transition-colors">
            <ThumbsUp className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-primary transition-colors">{gg}</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => setMvp(prev => prev + 1)}
          className="flex items-center gap-2 group"
        >
          <div className="p-2 rounded-full group-hover:bg-yellow-500/20 transition-colors">
            <Trophy className="w-5 h-5 text-zinc-400 group-hover:text-yellow-500 transition-colors" />
          </div>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-yellow-500 transition-colors">{mvp}</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => setFire(prev => prev + 1)}
          className="flex items-center gap-2 group"
        >
          <div className="p-2 rounded-full group-hover:bg-orange-500/20 transition-colors">
            <Flame className="w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-orange-500 transition-colors">{fire}</span>
        </motion.button>
      </div>

      <div className="flex items-center gap-2">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full hover:bg-white/10 transition-colors group">
          <MessageCircle className="w-5 h-5 text-zinc-400 group-hover:text-white" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full hover:bg-white/10 transition-colors group">
          <Share2 className="w-5 h-5 text-zinc-400 group-hover:text-white" />
        </motion.button>
      </div>
    </div>
  );
};

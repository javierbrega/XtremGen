"use client";

import React, { useState } from 'react';
import { X, Plus, Send } from 'lucide-react';
import { Button } from './ui/Base';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';

interface NewPostDialogProps {
  onPostCreated?: () => void;
}

export const NewPostDialog: React.FC<NewPostDialogProps> = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [platform, setPlatform] = useState('pc');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const { user, openAuthModal } = useAuth();

  const handleOpen = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!title.trim() || !content.trim()) {
      showNotification({
        title: 'Campos incompletos',
        message: 'Por favor completa el título y el contenido del tópico.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('forum_posts').insert({
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      platform,
      is_hot: true,
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error al publicar',
        message: error.message || 'No se pudo guardar el post en Supabase.',
        type: 'error',
      });
      return;
    }

    setIsOpen(false);
    setTitle('');
    setContent('');
    onPostCreated?.();
    showNotification({
      title: '¡Tópico Publicado!',
      message: 'Tu discusión ya está en vivo en la comunidad de XtremGen.',
      type: 'success',
    });
  };

  return (
    <>
      <Button variant="primary" onClick={handleOpen} className="shadow-[0_0_20px_rgba(239,68,68,0.35)]">
        <Plus className="w-4 h-4" />
        Nuevo Post
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/75 backdrop-blur-md" />
          <div className="relative w-full max-w-xl z-[151] outline-none">
            <div className="bg-[#0e0e14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Crear Nuevo Tópico</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Título del Post
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Mi experiencia con la nueva temporada competitiva"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="E-sports">E-sports</option>
                      <option value="Builds">Builds</option>
                      <option value="Off-topic">Off-topic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                      Plataforma
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="pc">PC</option>
                      <option value="ps">PlayStation</option>
                      <option value="xbox">Xbox</option>
                      <option value="nintendo">Nintendo</option>
                      <option value="mobile">Mobile</option>
                      <option value="esports">Esports</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Contenido
                  </label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Comparte tus conocimientos, guías o dudas con la comunidad..."
                    rows={5}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors resize-none custom-scrollbar text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" isLoading={isSubmitting}>
                    <Send className="w-4 h-4" />
                    Publicar en Supabase
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

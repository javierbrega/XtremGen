"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { MessageSquare, ThumbsUp, Share2, TrendingUp, Award, Clock, Users } from 'lucide-react';
import { Card, Badge } from './ui/Base';
import { NewPostDialog } from './NewPostDialog';
import { useFilter } from '../context/FilterContext';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['Todos', 'Hardware', 'Software', 'E-sports', 'Builds', 'Off-topic'];

export const ForumFeed = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [posts, setPosts] = useState<any[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { activeFilter } = useFilter();
  const { user, openAuthModal } = useAuth();

  const fetchForumData = useCallback(async () => {
    setIsLoading(true);
    const [postsRes, profilesRes] = await Promise.all([
      supabase
        .from('forum_posts')
        .select('*,profiles(username,avatar_url,role_badge)')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('profiles')
        .select('id,username,avatar_url,xp,level,role_badge')
        .order('xp', { ascending: false })
        .limit(5),
    ]);

    setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    setTopContributors(Array.isArray(profilesRes.data) ? profilesRes.data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchForumData();
  }, [fetchForumData]);

  const handleUpvote = async (post: any) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const nextUpvotes = (post.upvotes || 0) + 1;
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, upvotes: nextUpvotes } : p)));
    await supabase.from('forum_posts').update({ upvotes: nextUpvotes }).eq('id', post.id);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'Todos' || post.category === activeCategory;
    const matchesPlatform =
      !activeFilter || post.platform?.toLowerCase() === activeFilter.toLowerCase();
    return matchesCategory && matchesPlatform;
  });

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            <TrendingUp className="text-primary w-8 h-8" />
            FEED DE DISCUSIÓN
            {activeFilter && (
              <Badge variant="primary" className="ml-2 uppercase">
                {activeFilter}
              </Badge>
            )}
          </h2>
          <p className="text-zinc-400 text-sm">
            Explora los debates y estrategias más recientes de la comunidad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NewPostDialog onPostCreated={fetchForumData} />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-surface text-zinc-400 border-border hover:border-zinc-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {isLoading ? (
            Array(2)
              .fill(0)
              .map((_, i) => <SkeletonPost key={i} />)
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-[#14141a]/60 rounded-2xl border border-dashed border-white/10 px-6">
              <MessageSquare className="w-14 h-14 text-primary/60 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white">Foro en 0 · Sin discusiones activas</h3>
              <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                Sé el primero en publicar un tópico en esta categoría usando el botón &quot;Nuevo Post&quot;.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const authorName = post.profiles?.username || 'Jugador XG';
              const authorAvatar =
                post.profiles?.avatar_url ||
                `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${post.author_id}`;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="group border-white/5 hover:border-primary/30 transition-all">
                    <div className="flex gap-4">
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-11 h-11 rounded-full border border-white/10 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-white hover:text-primary cursor-pointer transition-colors">
                            {authorName}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            • {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          {post.is_hot && (
                            <Badge variant="primary" className="ml-auto">
                              Hot
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleUpvote(post)}
                            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-primary transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {post.upvotes || 0}
                          </button>
                          <span className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments_count || 0}
                          </span>
                          <Badge variant="primary" className="ml-auto">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <aside className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <h4 className="font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="text-primary w-4 h-4" />
              Jugadores Registrados ({topContributors.length})
            </h4>
            {topContributors.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                Aún no hay jugadores registrados. ¡Inicia sesión para ser el #1!
              </div>
            ) : (
              <div className="space-y-3">
                {topContributors.map((u, i) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs text-primary">
                      #{i + 1}
                    </div>
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${u.id}`}
                      alt={u.username}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 truncate">
                      <div className="text-sm font-bold text-white truncate">{u.username}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">
                        Nivel {u.level || 1} · {u.role_badge || 'GAMER'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h4 className="font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="text-accent w-4 h-4" />
              Actividad Reciente
            </h4>
            {posts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">Sin tópicos recientes.</p>
            ) : (
              <div className="space-y-4">
                {posts.slice(0, 3).map((p) => (
                  <div key={p.id} className="border-l-2 border-primary/50 pl-3 py-1">
                    <div className="text-xs font-bold text-white line-clamp-1">{p.title}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </section>
  );
};

const SkeletonPost = () => (
  <Card className="animate-pulse">
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-zinc-800" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-32 bg-zinc-800 rounded" />
        <div className="h-6 w-3/4 bg-zinc-800 rounded" />
        <div className="h-4 w-full bg-zinc-800 rounded" />
      </div>
    </div>
  </Card>
);

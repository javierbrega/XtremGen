"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  Newspaper,
  Star,
  Calendar,
  ShieldAlert,
  Gamepad2,
  Search,
  RefreshCw,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  CheckCircle2,
  Ban,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Bot,
  Cpu,
  KeyRound,
  Check,
  X,
  Zap,
  Database,
  Radio,
} from "lucide-react";
import { supabase } from "../lib/supabase/client";

type AdminTab = "dashboard" | "agent" | "games" | "news" | "reviews" | "events" | "users";

export default function XGAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [timeframe, setTimeframe] = useState<"1y" | "6m" | "3m" | "1m">("6m");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(false);
  const [queueFilter, setQueueFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Live Supabase Data States
  const [games, setGames] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);

  // Agent & API Connections States
  const [apiConnections, setApiConnections] = useState<any[]>([]);
  const [agentQueue, setAgentQueue] = useState<any[]>([]);
  const [rawgKeyInput, setRawgKeyInput] = useState("");
  const [twitchClientIdInput, setTwitchClientIdInput] = useState("");
  const [twitchSecretInput, setTwitchSecretInput] = useState("");
  const [targetOverrides, setTargetOverrides] = useState<Record<string, string>>({});

  // Form states for manual creation
  const [gameForm, setGameForm] = useState({
    title: "",
    genre: "Shooter / Tactical",
    rating: "9.5",
    players_count: "120K Activos",
    description: "",
    banner_url:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&auto=format&fit=crop&q=80",
    cover_url:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Esports",
    author_name: "GhostShadow (Admin XG)",
    read_time: "4 min",
    image_url:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    is_featured: true,
  });

  const [reviewForm, setReviewForm] = useState({
    title: "",
    game_title: "",
    category: "Acción / RPG",
    rating: "9.4",
    verdict: "",
    pros: "Combate fluido, Apartado artístico brutal, 120 FPS estables",
    cons: "Curva de aprendizaje exigente",
    game_cover:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&auto=format&fit=crop&q=80",
    author_name: "GhostShadow",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    game: "Valorant / XG Pro Circuit",
    date_label: "15 Nov, 2026 - 20:00 HS",
    prize_pool: "$5,000 USD",
    status: "Abierto",
    max_teams: "32",
    banner_url:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&auto=format&fit=crop&q=80",
  });

  const [banReasonInput, setBanReasonInput] = useState<Record<string, string>>({});

  const showNotice = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [gRes, nRes, rRes, eRes, pRes, fRes, sRes, connRes, qRes] = await Promise.all([
      supabase.from("games").select("*").order("created_at", { ascending: false }),
      supabase.from("news_articles").select("*").order("created_at", { ascending: false }),
      supabase.from("game_reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("forum_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("social_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("api_connections").select("*"),
      supabase.from("agent_content_queue").select("*").order("created_at", { ascending: false }),
    ]);

    if (gRes.data) setGames(gRes.data);
    if (nRes.data) setNews(nRes.data);
    if (rRes.data) setReviews(rRes.data);
    if (eRes.data) setEvents(eRes.data);
    if (pRes.data) setProfiles(pRes.data);
    if (fRes.data) setForumPosts(fRes.data);
    if (sRes.data) setSocialPosts(sRes.data);
    if (connRes.data) {
      setApiConnections(connRes.data);
      const rawg = connRes.data.find((c: any) => c.id === "rawg");
      const igdb = connRes.data.find((c: any) => c.id === "igdb_twitch");
      if (rawg?.api_key) setRawgKeyInput(rawg.api_key);
      if (igdb?.client_id) setTwitchClientIdInput(igdb.client_id);
      if (igdb?.client_secret) setTwitchSecretInput(igdb.client_secret);
    }
    if (qRes.data) setAgentQueue(qRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- AI Agent Ingestion & Authorization Handlers ---
  const handleSaveApiCredentials = async (providerId: "rawg" | "igdb_twitch") => {
    if (providerId === "rawg") {
      await supabase
        .from("api_connections")
        .update({ api_key: rawgKeyInput.trim(), updated_at: new Date().toISOString() })
        .eq("id", "rawg");
      showNotice("API Key de RAWG guardada en Supabase (`api_connections`).");
    } else {
      await supabase
        .from("api_connections")
        .update({
          client_id: twitchClientIdInput.trim(),
          client_secret: twitchSecretInput.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", "igdb_twitch");
      showNotice("Credenciales OAuth de Twitch / IGDB guardadas en Supabase.");
    }
    fetchAllData();
  };

  const handleRunAgentIngestion = async (provider: "all" | "freetogame" | "rawg" | "igdb_twitch" = "all") => {
    setAgentRunning(true);
    try {
      const res = await fetch("/api/agent/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key":
            process.env.NEXT_PUBLIC_ADMIN_INGEST_SECRET ||
            "xg_sec_agent_ingest_2026!",
        },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.ok) {
        showNotice(
          `⚡ Agente XG: ${data.fetched} ítems procesados (${data.insertedPending} nuevos en cola esperando tu autorización).`
        );
        setQueueFilter("pending");
        await fetchAllData();
      } else {
        showNotice(`Error en el agente: ${data.error || "Revisa conexión"}`, "err");
      }
    } catch (err: any) {
      showNotice(`Error de red al ejecutar agente: ${err?.message || ""}`, "err");
    } finally {
      setAgentRunning(false);
    }
  };

  const handleApproveQueueItem = async (item: any) => {
    const targetSection = targetOverrides[item.id] || item.target_section || "news";
    let insertError: any = null;
    let createdId: string | null = null;

    if (targetSection === "news") {
      const { data, error } = await supabase
        .from("news_articles")
        .insert({
          title: item.title,
          excerpt: item.excerpt || item.title,
          content: item.content || item.excerpt,
          category: item.category || "Lanzamientos",
          author_name: `Agente XG (${item.source_api.toUpperCase()})`,
          read_time: "3 min",
          image_url: item.image_url,
          is_featured: true,
          views_count: 1,
        })
        .single();
      insertError = error;
      createdId = data?.id || null;
    } else if (targetSection === "games") {
      const slug =
        (item.game_title || item.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString().slice(-4);

      const { data, error } = await supabase
        .from("games")
        .insert({
          title: item.game_title || item.title,
          slug,
          genre: item.category || "Acción",
          rating: Number(item.rating) || 9.0,
          players_count: item.metadata?.players_count || "En Tendencia",
          description: item.excerpt || item.content,
          banner_url: item.banner_url || item.image_url,
          cover_url: item.image_url,
          is_featured: true,
        })
        .single();
      insertError = error;
      createdId = data?.id || null;
    } else if (targetSection === "reviews") {
      const { data, error } = await supabase
        .from("game_reviews")
        .insert({
          title: item.title,
          game_title: item.game_title || item.title,
          category: item.category || "Acción / RPG",
          rating: Number(item.rating) || 9.2,
          verdict: item.content || item.excerpt,
          pros: item.metadata?.pros || ["Gran apartado técnico", "Tendencia en " + item.source_api.toUpperCase()],
          cons: item.metadata?.cons || ["Curva de aprendizaje exigente"],
          game_cover: item.image_url,
          author_name: "GhostShadow & Agente XG",
          likes_count: 1,
        })
        .single();
      insertError = error;
      createdId = data?.id || null;
    }

    if (insertError) {
      showNotice(`Error al publicar en el Front: ${insertError.message || ""}`, "err");
      return;
    }

    await supabase
      .from("agent_content_queue")
      .update({
        status: "approved",
        target_section: targetSection,
        published_record_id: createdId,
        reviewed_by: "GhostShadow",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    showNotice(
      `✅ ¡Autorizado! Publicado en vivo en la sección "${targetSection.toUpperCase()}" del Front (localhost:3000).`
    );
    fetchAllData();
  };

  const handleRejectQueueItem = async (item: any) => {
    await supabase
      .from("agent_content_queue")
      .update({
        status: "rejected",
        reviewed_by: "GhostShadow",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    showNotice("Ítem rechazado. No se publicará en el Front.", "err");
    fetchAllData();
  };

  const handleDeleteQueueItem = async (id: string) => {
    await supabase.from("agent_content_queue").delete().eq("id", id);
    fetchAllData();
  };

  // --- Manual CRUD Handlers ---
  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameForm.title.trim()) return;
    const slug =
      gameForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    const { error } = await supabase.from("games").insert({
      title: gameForm.title.trim(),
      slug,
      genre: gameForm.genre,
      rating: parseFloat(gameForm.rating) || 9.0,
      players_count: gameForm.players_count,
      description: gameForm.description,
      banner_url: gameForm.banner_url,
      cover_url: gameForm.cover_url,
      is_featured: gameForm.is_featured,
    });

    if (error) {
      showNotice(`Error al crear juego: ${error.message || "Verifica datos"}`, "err");
    } else {
      showNotice("¡Juego publicado en XtremGen (Hero / Tendencias)!");
      setGameForm({ ...gameForm, title: "", description: "" });
      fetchAllData();
    }
  };

  const handleDeleteGame = async (id: string) => {
    await supabase.from("games").delete().eq("id", id);
    showNotice("Juego eliminado de la base de datos.");
    fetchAllData();
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) return;
    const { error } = await supabase.from("news_articles").insert({
      title: newsForm.title.trim(),
      excerpt: newsForm.excerpt.trim() || newsForm.title.trim(),
      content: newsForm.content.trim() || newsForm.excerpt.trim(),
      category: newsForm.category,
      author_name: newsForm.author_name,
      read_time: newsForm.read_time,
      image_url: newsForm.image_url,
      is_featured: newsForm.is_featured,
      views_count: 0,
    });

    if (error) {
      showNotice(`Error al publicar noticia: ${error.message || ""}`, "err");
    } else {
      showNotice("¡Noticia publicada en vivo en XtremGen!");
      setNewsForm({ ...newsForm, title: "", excerpt: "", content: "" });
      fetchAllData();
    }
  };

  const handleDeleteNews = async (id: string) => {
    await supabase.from("news_articles").delete().eq("id", id);
    showNotice("Noticia eliminada.");
    fetchAllData();
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.game_title.trim()) return;
    const prosArr = reviewForm.pros
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const consArr = reviewForm.cons
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from("game_reviews").insert({
      title: reviewForm.title.trim(),
      game_title: reviewForm.game_title.trim(),
      category: reviewForm.category,
      rating: parseFloat(reviewForm.rating) || 9.0,
      verdict: reviewForm.verdict.trim(),
      pros: prosArr,
      cons: consArr,
      game_cover: reviewForm.game_cover,
      author_name: reviewForm.author_name,
      likes_count: 0,
    });

    if (error) {
      showNotice(`Error al publicar reseña: ${error.message || ""}`, "err");
    } else {
      showNotice("¡Reseña oficial publicada en XtremGen!");
      setReviewForm({ ...reviewForm, title: "", game_title: "", verdict: "" });
      fetchAllData();
    }
  };

  const handleDeleteReview = async (id: string) => {
    await supabase.from("game_reviews").delete().eq("id", id);
    showNotice("Reseña eliminada.");
    fetchAllData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    const { error } = await supabase.from("events").insert({
      title: eventForm.title.trim(),
      game: eventForm.game,
      date_label: eventForm.date_label,
      prize_pool: eventForm.prize_pool,
      status: eventForm.status,
      max_teams: parseInt(eventForm.max_teams, 10) || 32,
      registered_teams: 0,
      banner_url: eventForm.banner_url,
    });

    if (error) {
      showNotice(`Error al crear evento: ${error.message || ""}`, "err");
    } else {
      showNotice("¡Torneo / Evento publicado en XtremGen!");
      setEventForm({ ...eventForm, title: "" });
      fetchAllData();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    showNotice("Evento eliminado.");
    fetchAllData();
  };

  // --- User Permissions & Ban Handlers ---
  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (!error) {
      showNotice(`Rol actualizado a "${newRole.toUpperCase()}"`);
      fetchAllData();
    }
  };

  const handleToggleVerify = async (user: any) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: !user.is_verified })
      .eq("id", user.id);
    if (!error) {
      showNotice(user.is_verified ? "Verificación removida" : "Usuario verificado oficialmente");
      fetchAllData();
    }
  };

  const handleToggleBan = async (user: any) => {
    const nextBanned = !user.is_banned;
    const reason = banReasonInput[user.id] || "Incumplimiento de normas de la comunidad XG";
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: nextBanned,
        ban_reason: nextBanned ? reason : "",
      })
      .eq("id", user.id);

    if (!error) {
      showNotice(
        nextBanned
          ? `Usuario ${user.username} BANEADO de XtremGen.`
          : `Baneo levantado para ${user.username}.`,
        nextBanned ? "err" : "ok"
      );
      fetchAllData();
    }
  };

  const handleDeleteForumPost = async (id: string) => {
    await supabase.from("forum_posts").delete().eq("id", id);
    showNotice("Post del foro eliminado por moderación.");
    fetchAllData();
  };

  const handleDeleteSocialPost = async (id: string) => {
    await supabase.from("social_posts").delete().eq("id", id);
    showNotice("Publicación social eliminada por moderación.");
    fetchAllData();
  };

  // --- Computed Metrics for the Bento Dashboard ---
  const pendingQueueCount = agentQueue.filter((q) => q.status === "pending").length;
  const approvedQueueCount = agentQueue.filter((q) => q.status === "approved").length;
  const totalContentRecords =
    games.length + news.length + reviews.length + events.length + forumPosts.length + socialPosts.length;
  const bannedUsersCount = profiles.filter((p) => p.is_banned).length;
  const adminsCount = profiles.filter((p) => p.role === "admin" || p.role === "moderator").length;

  const barStats = [
    { label: "Cola IA", count: pendingQueueCount, highlight: pendingQueueCount > 0 },
    { label: "Juegos", count: games.length },
    { label: "Noticias", count: news.length, highlight: pendingQueueCount === 0 },
    { label: "Reseñas", count: reviews.length },
    { label: "Eventos", count: events.length },
    { label: "Usuarios", count: profiles.length },
  ];
  const maxBar = Math.max(...barStats.map((b) => b.count), 5);

  const recentFeed = [
    ...agentQueue
      .filter((q) => q.status === "pending")
      .map((q) => ({
        id: `q-${q.id}`,
        title: `[Pendiente] ${q.game_title}`,
        type: `Agente IA • ${q.source_api.toUpperCase()}`,
        date: q.created_at,
        badge: "POR AUTORIZAR",
        positive: true,
      })),
    ...news.map((n) => ({
      id: `n-${n.id}`,
      title: n.title,
      type: "Noticia en Front",
      date: n.created_at,
      badge: "+EN VIVO",
      positive: true,
    })),
    ...reviews.map((r) => ({
      id: `r-${r.id}`,
      title: `${r.game_title}: ${r.title}`,
      type: "Reseña",
      date: r.created_at,
      badge: `${r.rating}/10`,
      positive: true,
    })),
    ...events.map((ev) => ({
      id: `e-${ev.id}`,
      title: ev.title,
      type: "Torneo",
      date: ev.created_at,
      badge: ev.prize_pool,
      positive: true,
    })),
  ]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#070609] text-zinc-100 p-3 sm:p-6 flex items-center justify-center relative overflow-hidden">
      {/* Ambient Background Glows matching Reference Image + XG Palette */}
      <div className="pointer-events-none fixed -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#E6002B]/15 blur-[150px]" />
      <div className="pointer-events-none fixed -bottom-40 right-10 w-[550px] h-[550px] rounded-full bg-[#FFD200]/12 blur-[150px]" />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold animate-in fade-in duration-200 ${
            toast.type === "ok"
              ? "bg-[#111812]/95 border-[#D4FE00]/40 text-[#D4FE00]"
              : "bg-[#1c0d10]/95 border-[#E6002B]/50 text-[#ff4d6d]"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Main Glassmorphic Dashboard Container */}
      <div className="w-full max-w-[1480px] min-h-[860px] bg-[#0e0c12]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_25px_90px_rgba(0,0,0,0.9)] flex overflow-hidden relative">
        {/* Left Slim Icon Sidebar */}
        <aside className="w-20 bg-[#0a090d] border-r border-white/[0.06] flex flex-col items-center py-7 justify-between flex-shrink-0">
          <div className="flex flex-col items-center gap-7">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6002B] via-[#c70024] to-[#FFD200] p-[1px] shadow-[0_0_25px_rgba(230,0,43,0.5)] group"
              title="XG Command Center"
            >
              <div className="w-full h-full bg-[#0a090d]/80 rounded-[15px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <span className="text-lg font-black tracking-tighter text-white">XG</span>
              </div>
            </button>

            <div className="w-8 h-[1px] bg-white/10" />

            {/* Sidebar Icons */}
            <nav className="flex flex-col items-center gap-3">
              {[
                { id: "dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard & Métricas" },
                {
                  id: "agent",
                  icon: <Bot className="w-5 h-5" />,
                  label: "Agente IA (IGDB, RAWG, FreeToGame) & Autorización",
                  countBadge: pendingQueueCount,
                },
                { id: "games", icon: <Gamepad2 className="w-5 h-5" />, label: "Juegos & Hero" },
                { id: "news", icon: <Newspaper className="w-5 h-5" />, label: "Noticias" },
                { id: "reviews", icon: <Star className="w-5 h-5" />, label: "Reseñas" },
                { id: "events", icon: <Calendar className="w-5 h-5" />, label: "Eventos & Torneos" },
                {
                  id: "users",
                  icon: <ShieldAlert className="w-5 h-5" />,
                  label: "Permisos, Roles y Baneos",
                  dot: true,
                },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    title={item.label}
                    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-[#E6002B] to-[#ff6b00] text-white shadow-[0_0_25px_rgba(230,0,43,0.6)] scale-105"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    {typeof item.countBadge === "number" && item.countBadge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4FE00] text-[#09080c] text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_#D4FE00]">
                        {item.countBadge}
                      </span>
                    )}
                    {item.dot && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FFD200] ring-2 ring-[#0a090d]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Link to Public Site */}
          <div className="flex flex-col items-center gap-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              title="Abrir Web Pública XtremGen (localhost:3000)"
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-[#D4FE00] hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          {/* Top Header Bar */}
          <header className="flex flex-wrap items-center justify-between gap-4 mb-7">
            <div className="flex items-center bg-[#17141d] border border-white/[0.07] rounded-2xl px-4 py-2.5 w-full sm:w-[420px] shadow-inner">
              <Search className="w-4 h-4 text-zinc-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en cola de IA, noticias, usuarios..."
                className="bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none w-full"
              />
              <span className="ml-2 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-zinc-300 whitespace-nowrap">
                ⌘ + Space
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Agent Trigger Pill in Header */}
              <button
                onClick={() => setActiveTab("agent")}
                className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#E6002B]/20 to-[#FFD200]/20 border border-[#FFD200]/40 text-xs font-black text-[#FFD200] hover:brightness-125 flex items-center gap-2 transition-all"
              >
                <Bot className="w-4 h-4 text-[#D4FE00]" />
                <span>Agente IA ({pendingQueueCount} por autorizar)</span>
              </button>

              <button
                onClick={fetchAllData}
                title="Sincronizar con Supabase"
                className="w-10 h-10 rounded-full bg-[#17141d] border border-white/[0.07] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FFD200]" : ""}`} />
              </button>

              <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-[#17141d] border border-white/[0.07]">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E6002B] to-[#FFD200] p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0e0c12] flex items-center justify-center text-xs font-black text-white">
                      GS
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#D4FE00] ring-2 ring-[#17141d]" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    GhostShadow
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E6002B]/20 text-[#E6002B] font-black">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">@xtremgen_hq • Puerto 3001</div>
                </div>
              </div>
            </div>
          </header>

          {/* =========================================================
              TAB 1: OVERVIEW BENTO DASHBOARD (Exact Reference Layout)
             ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-12 gap-6 flex-1">
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                {/* Top-Left Wide Card */}
                <div className="relative rounded-[28px] bg-gradient-to-br from-[#231515] via-[#151219] to-[#121016] border border-white/[0.08] p-6 sm:p-7 shadow-2xl overflow-hidden">
                  <div className="pointer-events-none absolute -top-24 left-1/3 w-72 h-72 bg-[#E6002B]/20 blur-[90px] rounded-full" />

                  <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Volumen Total & Cola de Ingesta IA (IGDB • RAWG • FreeToGame)
                      </span>
                      <div className="flex items-baseline gap-3 mt-1">
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {totalContentRecords + profiles.length} Activos
                        </h2>
                        <span className="text-xs font-bold text-[#D4FE00] flex items-center gap-1">
                          ↑ {pendingQueueCount} en cola de aprobación
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 border border-white/[0.07] rounded-full p-1">
                      {[
                        { id: "1y", label: "1 año" },
                        { id: "6m", label: "6 meses" },
                        { id: "3m", label: "3 meses" },
                        { id: "1m", label: "1 mes" },
                      ].map((tf) => (
                        <button
                          key={tf.id}
                          onClick={() => setTimeframe(tf.id as any)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            timeframe === tf.id
                              ? "bg-[#2a2225] text-white border border-white/15 shadow"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glowing Area Chart + Floating White Callout Pill */}
                  <div className="relative mt-8 h-52 w-full">
                    <div
                      onClick={() => setActiveTab("agent")}
                      className="cursor-pointer absolute left-[46%] top-2 z-20 -translate-x-1/2 bg-white hover:bg-[#FFD200] transition-colors text-[#0a090d] rounded-2xl px-4 py-2.5 shadow-[0_10px_30px_rgba(255,255,255,0.25)]"
                    >
                      <div className="text-[11px] font-semibold text-zinc-600 flex items-center gap-1">
                        Agente Recolector IA <span>↗</span>
                      </div>
                      <div className="text-sm font-black tracking-tight">
                        {pendingQueueCount} Pendientes • {approvedQueueCount} Aprobados
                      </div>
                    </div>

                    <svg viewBox="0 0 700 180" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="xgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E6002B" stopOpacity="0.65" />
                          <stop offset="50%" stopColor="#FFD200" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0e0c12" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="xgStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ff4d00" />
                          <stop offset="50%" stopColor="#FFD200" />
                          <stop offset="100%" stopColor="#E6002B" />
                        </linearGradient>
                      </defs>

                      {[35, 75, 115, 155].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={y}
                          x2="650"
                          y2={y}
                          stroke="rgba(255,255,255,0.05)"
                          strokeDasharray="4 4"
                        />
                      ))}

                      <path
                        d="M 0 120 L 55 95 L 110 110 L 165 65 L 220 88 L 275 72 L 330 98 L 385 52 L 440 82 L 495 60 L 550 90 L 605 70 L 650 45 L 650 170 L 0 170 Z"
                        fill="url(#xgAreaGrad)"
                      />

                      <path
                        d="M 0 120 L 55 95 L 110 110 L 165 65 L 220 88 L 275 72 L 330 98 L 385 52 L 440 82 L 495 60 L 550 90 L 605 70 L 650 45"
                        fill="none"
                        stroke="url(#xgStrokeGrad)"
                        strokeWidth="3"
                      />

                      <circle
                        cx="330"
                        cy="98"
                        r="6"
                        fill="#ffffff"
                        stroke="#E6002B"
                        strokeWidth="3"
                      />
                    </svg>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden relative">
                        <div className="absolute inset-y-0 left-[15%] right-[15%] bg-gradient-to-r from-transparent via-[#D4FE00] to-[#00ff88] rounded-full shadow-[0_0_12px_#D4FE00]" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                      <span>IGDB Twitch API</span>
                      <span>RAWG Database</span>
                      <span>FreeToGame API</span>
                      <span>Cola Admin ({pendingQueueCount})</span>
                      <span>Front Público ({totalContentRecords})</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="text-zinc-400">
                      Fuentes conectadas:{" "}
                      <span className="font-black text-white ml-1">
                        IGDB Twitch • RAWG.io • FreeToGame
                      </span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="flex items-center gap-2 text-zinc-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-white inline-block" />
                        En Cola (Requiere tu OK)
                      </span>
                      <span className="flex items-center gap-2 text-zinc-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#D4FE00] inline-block" />
                        Publicado en Front
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Left Agent Trigger Card + Right Bar Chart Card */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                  <div className="md:col-span-5 rounded-[28px] bg-gradient-to-br from-[#E6002B]/40 via-[#b84a00]/30 to-[#141118] border border-white/15 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                    <div className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#FFD200]/25 blur-2xl" />

                    <div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/40 text-[#D4FE00] border border-[#D4FE00]/40 mb-3">
                        Agente Recolector IA
                      </span>
                      <h3 className="text-2xl font-black text-white leading-tight">
                        Ingesta desde IGDB, RAWG y FreeToGame
                      </h3>
                      <p className="text-xs text-zinc-200/80 mt-2 leading-relaxed">
                        El agente extrae noticias y juegos de las 3 APIs y los deja en espera hasta que vos los autorices.
                      </p>

                      <div className="flex items-center gap-2 mt-5">
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-black text-purple-300">
                          TWITCH IGDB
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-black text-[#FFD200]">
                          RAWG DB
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-black text-[#D4FE00]">
                          FREETOGAME
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <button
                        disabled={agentRunning}
                        onClick={() => handleRunAgentIngestion("all")}
                        className="w-full py-3 rounded-2xl bg-white hover:bg-[#D4FE00] text-[#0a090d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        {agentRunning ? "Recolectando de APIs..." : "Ejecutar Agente Ahora"}
                      </button>
                      <button
                        onClick={() => setActiveTab("agent")}
                        className="w-full py-2.5 rounded-xl bg-black/50 hover:bg-black/70 border border-white/15 text-xs font-bold text-white transition-all"
                      >
                        Revisar Cola ({pendingQueueCount} pendientes) →
                      </button>
                    </div>
                  </div>

                  {/* Bottom-Center Bar Chart Card */}
                  <div className="md:col-span-7 rounded-[28px] bg-[#14121a] border border-white/[0.08] p-6 flex flex-col justify-between shadow-2xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-zinc-400">
                          Distribución de Base de Datos & Cola
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-2xl font-black text-white">
                            {totalContentRecords} en Front • {pendingQueueCount} en Cola
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("agent")}
                        className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-bold text-[#D4FE00]"
                      >
                        Autorizar ⇅
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-3 items-end h-44 pt-8 pb-2">
                      {barStats.map((bar) => {
                        const heightPct = Math.max(22, Math.round((bar.count / maxBar) * 100));
                        return (
                          <div
                            key={bar.label}
                            className="flex flex-col items-center h-full justify-end group"
                          >
                            {bar.highlight ? (
                              <span className="mb-2 px-2.5 py-0.5 rounded-full bg-[#D4FE00] text-[#09080c] text-[10px] font-black shadow-[0_0_15px_#D4FE00]">
                                {bar.count}
                              </span>
                            ) : (
                              <span className="mb-1.5 text-[11px] font-bold text-zinc-400">
                                {bar.count}
                              </span>
                            )}
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t-xl transition-all ${
                                bar.highlight
                                  ? "bg-gradient-to-t from-[#0f291e] via-[#10b981] to-[#D4FE00] shadow-[0_0_25px_rgba(212,254,0,0.35)]"
                                  : "bg-gradient-to-t from-[#1c1822] to-[#3a2620] group-hover:to-[#E6002B]/60"
                              }`}
                            />
                            <span className="mt-2.5 text-[11px] font-semibold text-zinc-400 truncate max-w-full">
                              {bar.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Columns: Stacked XG Cards + Quick Actions + Recent DB Activity */}
              <div className="col-span-12 xl:col-span-4 rounded-[28px] bg-gradient-to-b from-[#2b1810] via-[#17131c] to-[#121017] border border-white/10 p-6 flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black text-white tracking-tight">
                      Fuentes & Control XG
                    </h3>
                    <button
                      onClick={() => setActiveTab("agent")}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-[#FFD200] transition-all"
                    >
                      Configurar APIs
                    </button>
                  </div>

                  {/* Stacked Wallet-Style Cards */}
                  <div className="relative pt-14">
                    <div className="absolute top-0 inset-x-4 h-24 rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#FFD200] p-3.5 flex items-start justify-between text-[#09080c] shadow-lg opacity-90">
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        RAWG + FREETOGAME
                      </span>
                      <span className="text-xs font-black">CONECTADAS</span>
                    </div>

                    <div className="absolute top-6 inset-x-2 h-24 rounded-2xl bg-gradient-to-r from-[#8a001a] to-[#E6002B] p-3.5 flex items-start justify-between text-white shadow-lg">
                      <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#FFD200] inline-block" />
                        IGDB API BY TWITCH
                      </span>
                      <span className="text-xs font-black">ACTIVA</span>
                    </div>

                    <div className="relative z-10 rounded-3xl bg-gradient-to-br from-[#231d24] via-[#151218] to-[#0c0a0e] border border-white/15 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black italic tracking-wider text-white">
                          COLA DE AUTORIZACIÓN
                        </span>
                        <div className="w-9 h-7 rounded-md bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600 border border-white/30" />
                      </div>

                      <div className="mt-7">
                        <span className="text-[11px] text-zinc-400 font-medium">
                          Esperando tu aprobación para salir al Front
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-2xl font-black text-white">
                            {pendingQueueCount} Pendientes
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-[#D4FE00]/15 border border-[#D4FE00]/40 text-[#D4FE00] text-[11px] font-black">
                            {approvedQueueCount} Publicadas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      disabled={agentRunning}
                      onClick={() => handleRunAgentIngestion("all")}
                      className="py-3 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                    >
                      <ArrowDownLeft className="w-4 h-4 text-[#D4FE00]" />
                      Extraer de APIs
                    </button>
                    <button
                      onClick={() => setActiveTab("agent")}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E6002B] to-[#ff5e00] hover:brightness-110 text-xs font-black text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,0,43,0.4)] transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Autorizar Cola
                    </button>
                  </div>
                </div>

                {/* Recent Database Activity List */}
                <div className="mt-7 pt-5 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-white">Actividad Reciente</h4>
                    <button
                      onClick={() => setActiveTab("agent")}
                      className="text-[11px] font-bold text-zinc-400 hover:text-white"
                    >
                      Ver Cola IA
                    </button>
                  </div>

                  {recentFeed.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 bg-black/20 rounded-2xl border border-white/5">
                      Presiona &ldquo;Ejecutar Agente Ahora&rdquo; para traer noticias y juegos desde IGDB, RAWG y FreeToGame.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentFeed.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-[#FFD200] flex-shrink-0">
                              XG
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{item.title}</div>
                              <div className="text-[10px] text-zinc-500">{item.type}</div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-black ml-2 flex-shrink-0 ${
                              item.positive ? "text-[#D4FE00]" : "text-[#E6002B]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: AGENTE IA, CONEXIONES API & COLA DE AUTORIZACIÓN
             ========================================================= */}
          {activeTab === "agent" && (
            <div className="space-y-6">
              {/* Top Banner: Master Agent Controls */}
              <div className="rounded-3xl bg-gradient-to-r from-[#241118] via-[#16131d] to-[#121017] border border-white/10 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#D4FE00]/15 text-[#D4FE00] border border-[#D4FE00]/30 mb-2">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Pipeline de Ingesta & Moderación Previa
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Agente Recolector IA: IGDB (Twitch) • RAWG • FreeToGame
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    El agente consulta las 3 bases de datos, redacta las fichas en español y las deposita en{" "}
                    <code className="text-[#FFD200]">agent_content_queue</code>. Nada se publica en{" "}
                    <code className="text-[#D4FE00]">localhost:3000</code> hasta que vos presiones{" "}
                    <strong>Autorizar y Publicar</strong>.
                  </p>
                </div>

                <button
                  disabled={agentRunning}
                  onClick={() => handleRunAgentIngestion("all")}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E6002B] to-[#ff5e00] hover:brightness-110 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,0,43,0.5)] flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  {agentRunning ? "Consultando las 3 APIs..." : "⚡ Ejecutar Agente en las 3 APIs"}
                </button>
              </div>

              {/* 3 API Connection Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Card 1: FreeToGame API */}
                <div className="bg-[#14121a] border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#D4FE00]">
                        1. Free-To-Play Database
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D4FE00]/15 text-[#D4FE00] text-[10px] font-black">
                        API PÚBLICA ACTIVA
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Endpoint oficial <code className="text-zinc-200">freetogame.com/api/games</code>. No requiere API Key y extrae lanzamientos gratuitos de PC y navegador en tiempo real.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Extraídos:{" "}
                      <strong className="text-white">
                        {apiConnections.find((c) => c.id === "freetogame")?.total_fetched || 0}
                      </strong>
                    </span>
                    <button
                      disabled={agentRunning}
                      onClick={() => handleRunAgentIngestion("freetogame")}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                    >
                      Sincronizar FreeToGame
                    </button>
                  </div>
                </div>

                {/* Card 2: RAWG Video Games Database */}
                <div className="bg-[#14121a] border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#FFD200]">
                        2. RAWG Video Games DB
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFD200]/15 text-[#FFD200] text-[10px] font-black">
                        {rawgKeyInput ? "API KEY CONFIGURADA" : "MODO RADAR ACTIVO"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      Endpoint <code className="text-zinc-200">api.rawg.io/api/games</code>. Puedes ingresar tu API Key de RAWG o usar el radar integrado:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={rawgKeyInput}
                        onChange={(e) => setRawgKeyInput(e.target.value)}
                        placeholder="RAWG API Key (opcional)..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        onClick={() => handleSaveApiCredentials("rawg")}
                        className="px-3 py-2 rounded-xl bg-[#FFD200] text-black text-xs font-black"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Extraídos:{" "}
                      <strong className="text-white">
                        {apiConnections.find((c) => c.id === "rawg")?.total_fetched || 0}
                      </strong>
                    </span>
                    <button
                      disabled={agentRunning}
                      onClick={() => handleRunAgentIngestion("rawg")}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                    >
                      Sincronizar RAWG
                    </button>
                  </div>
                </div>

                {/* Card 3: IGDB API by Twitch */}
                <div className="bg-[#14121a] border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#ff4d6d]">
                        3. IGDB API by Twitch
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6002B]/20 text-[#ff4d6d] text-[10px] font-black">
                        {twitchClientIdInput && twitchSecretInput ? "OAUTH2 LISTO" : "PULSE ACTIVO"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={twitchClientIdInput}
                        onChange={(e) => setTwitchClientIdInput(e.target.value)}
                        placeholder="Twitch Client ID..."
                        className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="password"
                        value={twitchSecretInput}
                        onChange={(e) => setTwitchSecretInput(e.target.value)}
                        placeholder="Twitch Secret..."
                        className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveApiCredentials("igdb_twitch")}
                      className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-zinc-200"
                    >
                      Guardar Credenciales Twitch OAuth
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Extraídos:{" "}
                      <strong className="text-white">
                        {apiConnections.find((c) => c.id === "igdb_twitch")?.total_fetched || 0}
                      </strong>
                    </span>
                    <button
                      disabled={agentRunning}
                      onClick={() => handleRunAgentIngestion("igdb_twitch")}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                    >
                      Sincronizar IGDB
                    </button>
                  </div>
                </div>
              </div>

              {/* Queue Filter Bar */}
              <div className="bg-[#14121a] border border-white/10 rounded-3xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQueueFilter("pending")}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        queueFilter === "pending"
                          ? "bg-[#FFD200] text-[#09080c] shadow-[0_0_20px_rgba(255,210,0,0.4)]"
                          : "bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ⏳ Pendientes de tu Autorización (
                      {agentQueue.filter((q) => q.status === "pending").length})
                    </button>
                    <button
                      onClick={() => setQueueFilter("approved")}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        queueFilter === "approved"
                          ? "bg-[#D4FE00] text-[#09080c]"
                          : "bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ✅ Autorizados en Front (
                      {agentQueue.filter((q) => q.status === "approved").length})
                    </button>
                    <button
                      onClick={() => setQueueFilter("rejected")}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        queueFilter === "rejected"
                          ? "bg-[#E6002B] text-white"
                          : "bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ❌ Rechazados ({agentQueue.filter((q) => q.status === "rejected").length})
                    </button>
                  </div>
                </div>

                {/* Queue Cards List */}
                {agentQueue.filter((q) => q.status === queueFilter).length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-white/10 rounded-2xl">
                    <Bot className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-zinc-300">
                      No hay elementos en estado &ldquo;{queueFilter.toUpperCase()}&rdquo;
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Haz clic en &ldquo;⚡ Ejecutar Agente en las 3 APIs&rdquo; arriba para traer nuevas noticias y juegos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agentQueue
                      .filter((q) => q.status === queueFilter)
                      .filter(
                        (q) =>
                          !searchQuery ||
                          q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.game_title?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => {
                        const selectedTarget =
                          targetOverrides[item.id] || item.target_section || "news";
                        return (
                          <div
                            key={item.id}
                            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                          >
                            <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                              <img
                                src={item.image_url}
                                alt={item.game_title}
                                className="w-full sm:w-36 h-24 rounded-xl object-cover border border-white/10 flex-shrink-0"
                              />
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                      item.source_api === "igdb_twitch"
                                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                        : item.source_api === "rawg"
                                        ? "bg-[#FFD200]/20 text-[#FFD200] border border-[#FFD200]/40"
                                        : "bg-[#D4FE00]/20 text-[#D4FE00] border border-[#D4FE00]/40"
                                    }`}
                                  >
                                    FUENTE: {item.source_api.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                                    Juego: {item.game_title}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                                    Categoría: {item.category} • ⭐ {item.rating}
                                  </span>
                                </div>

                                <h4 className="text-base font-black text-white">{item.title}</h4>
                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                  {item.excerpt || item.content}
                                </p>
                              </div>
                            </div>

                            {/* Right Authorization Controls */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
                              {item.status === "pending" && (
                                <>
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-zinc-400 font-bold mb-1">
                                      Destino al Autorizar:
                                    </label>
                                    <select
                                      value={selectedTarget}
                                      onChange={(e) =>
                                        setTargetOverrides({
                                          ...targetOverrides,
                                          [item.id]: e.target.value,
                                        })
                                      }
                                      className="bg-black/70 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-[#FFD200]"
                                    >
                                      <option value="news">Publicar en: Noticias</option>
                                      <option value="games">Publicar en: Juegos & Hero</option>
                                      <option value="reviews">Publicar en: Reseñas</option>
                                    </select>
                                  </div>

                                  <button
                                    onClick={() => handleApproveQueueItem(item)}
                                    className="px-4 py-2.5 rounded-xl bg-[#D4FE00] hover:brightness-110 text-[#09080c] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,254,0,0.35)] transition-all"
                                  >
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    Autorizar y Publicar
                                  </button>

                                  <button
                                    onClick={() => handleRejectQueueItem(item)}
                                    className="px-3.5 py-2.5 rounded-xl bg-[#E6002B]/20 hover:bg-[#E6002B] text-[#ff4d6d] hover:text-white border border-[#E6002B]/40 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                    Rechazar
                                  </button>
                                </>
                              )}

                              {item.status !== "pending" && (
                                <button
                                  onClick={() => handleDeleteQueueItem(item.id)}
                                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  title="Limpiar registro de la cola"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: JUEGOS & HERO PRINCIPAL (public.games)
             ========================================================= */}
          {activeTab === "games" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleCreateGame}
                className="lg:col-span-5 bg-[#14121a] border border-white/10 rounded-3xl p-6 space-y-4 h-fit"
              >
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-[#E6002B]" />
                  Publicar Juego Manualmente (Hero & Tendencias)
                </h2>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Título del Juego *</label>
                  <input
                    type="text"
                    required
                    value={gameForm.title}
                    onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                    placeholder="Ej: Cyberpunk 2077: Phantom Liberty"
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Género</label>
                    <input
                      type="text"
                      value={gameForm.genre}
                      onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={gameForm.rating}
                      onChange={(e) => setGameForm({ ...gameForm, rating: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Jugadores Activos</label>
                  <input
                    type="text"
                    value={gameForm.players_count}
                    onChange={(e) => setGameForm({ ...gameForm, players_count: e.target.value })}
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Imagen Banner URL</label>
                  <input
                    type="url"
                    value={gameForm.banner_url}
                    onChange={(e) => setGameForm({ ...gameForm, banner_url: e.target.value })}
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Descripción</label>
                  <textarea
                    rows={3}
                    value={gameForm.description}
                    onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                    placeholder="Sinopsis principal para el Hero de XtremGen..."
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E6002B] to-[#ff5e00] text-white font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  + Publicar Juego en XtremGen
                </button>
              </form>

              <div className="lg:col-span-7 bg-[#14121a] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-black text-white mb-4">
                  Juegos Activos en el Front ({games.length})
                </h3>
                {games.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-12 text-center">No hay juegos cargados.</p>
                ) : (
                  <div className="space-y-3">
                    {games.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={g.cover_url || g.banner_url}
                            alt={g.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <div className="text-sm font-black text-white">{g.title}</div>
                            <div className="text-xs text-zinc-400">
                              {g.genre} • ⭐ {g.rating} • {g.players_count}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGame(g.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 4: GENERADOR DE NOTICIAS (public.news_articles)
             ========================================================= */}
          {activeTab === "news" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleCreateNews}
                className="lg:col-span-5 bg-[#14121a] border border-white/10 rounded-3xl p-6 space-y-4 h-fit"
              >
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#FFD200]" />
                  Redactar & Publicar Noticia
                </h2>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Titular de la Noticia *</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="Ej: GTA VI confirma nuevo tráiler oficial y fecha"
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Categoría</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="Esports">Esports</option>
                      <option value="Lanzamientos">Lanzamientos</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Actualizaciones">Actualizaciones</option>
                      <option value="Industria">Industria</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Tiempo de lectura</label>
                    <input
                      type="text"
                      value={newsForm.read_time}
                      onChange={(e) => setNewsForm({ ...newsForm, read_time: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Imagen de Portada URL</label>
                  <input
                    type="url"
                    value={newsForm.image_url}
                    onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Resumen / Bajada</label>
                  <textarea
                    rows={2}
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    placeholder="Breve resumen de impacto..."
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Cuerpo de la Noticia</label>
                  <textarea
                    rows={4}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    placeholder="Desarrollo completo de la noticia..."
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E6002B] to-[#ff5e00] text-white font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  + Publicar Noticia en Vivo
                </button>
              </form>

              <div className="lg:col-span-7 bg-[#14121a] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-black text-white mb-4">
                  Noticias Publicadas en Front ({news.length})
                </h3>
                {news.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-12 text-center">No hay noticias publicadas.</p>
                ) : (
                  <div className="space-y-3">
                    {news.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={n.image_url}
                            alt={n.title}
                            className="w-14 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#E6002B]/20 text-[#E6002B]">
                              {n.category}
                            </span>
                            <div className="text-sm font-black text-white mt-0.5">{n.title}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteNews(n.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 5: GENERADOR DE RESEÑAS (public.game_reviews)
             ========================================================= */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleCreateReview}
                className="lg:col-span-5 bg-[#14121a] border border-white/10 rounded-3xl p-6 space-y-4 h-fit"
              >
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FFD200]" />
                  Publicar Reseña Oficial XG
                </h2>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Juego Analizado *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.game_title}
                    onChange={(e) => setReviewForm({ ...reviewForm, game_title: e.target.value })}
                    placeholder="Ej: Elden Ring: Shadow of the Erdtree"
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Título de la Reseña *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="Ej: Una obra maestra desafiante e inolvidable"
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Puntaje XG (0 - 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      max="10"
                      min="0"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Categoría</label>
                    <input
                      type="text"
                      value={reviewForm.category}
                      onChange={(e) => setReviewForm({ ...reviewForm, category: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">
                    Puntos Positivos (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.pros}
                    onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">
                    Puntos Negativos (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.cons}
                    onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Veredicto Final</label>
                  <textarea
                    rows={3}
                    value={reviewForm.verdict}
                    onChange={(e) => setReviewForm({ ...reviewForm, verdict: e.target.value })}
                    placeholder="Conclusión del análisis..."
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E6002B] to-[#ff5e00] text-white font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  + Publicar Reseña Oficial
                </button>
              </form>

              <div className="lg:col-span-7 bg-[#14121a] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-black text-white mb-4">
                  Reseñas Publicadas ({reviews.length})
                </h3>
                {reviews.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-12 text-center">No hay reseñas publicadas.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#FFD200]/15 border border-[#FFD200]/40 flex items-center justify-center text-sm font-black text-[#FFD200]">
                            {r.rating}
                          </div>
                          <div>
                            <div className="text-sm font-black text-white">{r.game_title}</div>
                            <div className="text-xs text-zinc-400">{r.title}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 6: EVENTOS & TORNEOS (public.events)
             ========================================================= */}
          {activeTab === "events" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleCreateEvent}
                className="lg:col-span-5 bg-[#14121a] border border-white/10 rounded-3xl p-6 space-y-4 h-fit"
              >
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4FE00]" />
                  Crear Torneo / Evento Oficial
                </h2>
                <div>
                  <label className="text-xs text-zinc-400 font-bold">Nombre del Torneo *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="Ej: XG Masters Cup: Valorant Latam"
                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Juego</label>
                    <input
                      type="text"
                      value={eventForm.game}
                      onChange={(e) => setEventForm({ ...eventForm, game: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Pozo de Premios</label>
                    <input
                      type="text"
                      value={eventForm.prize_pool}
                      onChange={(e) => setEventForm({ ...eventForm, prize_pool: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Fecha y Hora</label>
                    <input
                      type="text"
                      value={eventForm.date_label}
                      onChange={(e) => setEventForm({ ...eventForm, date_label: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold">Cupos Máximos</label>
                    <input
                      type="number"
                      value={eventForm.max_teams}
                      onChange={(e) => setEventForm({ ...eventForm, max_teams: e.target.value })}
                      className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E6002B] to-[#ff5e00] text-white font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  + Publicar Torneo en XtremGen
                </button>
              </form>

              <div className="lg:col-span-7 bg-[#14121a] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-black text-white mb-4">
                  Eventos & Torneos ({events.length})
                </h3>
                {events.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-12 text-center">No hay eventos creados.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D4FE00]/15 text-[#D4FE00]">
                            {ev.status} • {ev.prize_pool}
                          </span>
                          <div className="text-sm font-black text-white mt-1">{ev.title}</div>
                          <div className="text-xs text-zinc-400">
                            {ev.game} • {ev.date_label}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 7: PERMISOS, ROLES, BANEOS Y MODERACIÓN (public.profiles)
             ========================================================= */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-[#14121a] border border-white/10 rounded-3xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#E6002B]" />
                      Control de Usuarios, Permisos y Baneos ({profiles.length})
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Administra rangos (Admin, Moderador, Editor, Usuario), verifica cuentas y aplica baneos en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {profiles
                    .filter(
                      (p) =>
                        !searchQuery ||
                        p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.role?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.id}
                        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                          u.is_banned
                            ? "bg-[#220c10]/70 border-[#E6002B]/50"
                            : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={
                              u.avatar_url ||
                              "https://api.dicebear.com/7.x/avataaars/svg?seed=XG"
                            }
                            alt={u.username}
                            className="w-11 h-11 rounded-full object-cover border border-white/20"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{u.username}</span>
                              {u.is_verified && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D4FE00]/15 text-[#D4FE00] text-[10px] font-black">
                                  VERIFICADO
                                </span>
                              )}
                              {u.is_banned && (
                                <span className="px-2 py-0.5 rounded-full bg-[#E6002B] text-white text-[10px] font-black">
                                  BANEADO
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5">
                              ID: {u.id.slice(0, 8)}... • Nivel {u.level || 1} • Rep:{" "}
                              {u.reputation || 0}
                              {u.is_banned && u.ban_reason ? ` • Motivo: ${u.ban_reason}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <select
                            value={u.role || "user"}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white"
                          >
                            <option value="user">Rol: Usuario</option>
                            <option value="editor">Rol: Editor CMS</option>
                            <option value="moderator">Rol: Moderador</option>
                            <option value="admin">Rol: Super Admin</option>
                          </select>

                          <button
                            onClick={() => handleToggleVerify(u)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              u.is_verified
                                ? "bg-[#D4FE00]/15 border-[#D4FE00]/40 text-[#D4FE00]"
                                : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {u.is_verified ? "Verificado" : "Verificar"}
                          </button>

                          {!u.is_banned && (
                            <input
                              type="text"
                              value={banReasonInput[u.id] || ""}
                              onChange={(e) =>
                                setBanReasonInput({ ...banReasonInput, [u.id]: e.target.value })
                              }
                              placeholder="Motivo de baneo..."
                              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-44"
                            />
                          )}

                          <button
                            onClick={() => handleToggleBan(u)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              u.is_banned
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                                : "bg-[#E6002B] hover:bg-[#c40024] text-white shadow-[0_0_15px_rgba(230,0,43,0.4)]"
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {u.is_banned ? "Quitar Baneo" : "Banear"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#14121a] border border-white/10 rounded-3xl p-6">
                  <h3 className="text-sm font-black text-white mb-3">
                    Moderación de Foro ({forumPosts.length} temas)
                  </h3>
                  {forumPosts.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">Sin temas en el foro.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {forumPosts.map((fp) => (
                        <div
                          key={fp.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="text-xs font-bold text-white truncate">{fp.title}</div>
                            <div className="text-[11px] text-zinc-400">
                              Por {fp.author_name} • {fp.category}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteForumPost(fp.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#14121a] border border-white/10 rounded-3xl p-6">
                  <h3 className="text-sm font-black text-white mb-3">
                    Moderación de Muro Social ({socialPosts.length} posts)
                  </h3>
                  {socialPosts.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      Sin publicaciones sociales.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {socialPosts.map((sp) => (
                        <div
                          key={sp.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="text-xs font-bold text-white truncate">
                              {sp.content}
                            </div>
                            <div className="text-[11px] text-zinc-400">Por {sp.author_name}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteSocialPost(sp.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

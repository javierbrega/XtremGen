"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  ShieldAlert,
  Timer,
  CheckCircle2,
  Bookmark,
  ArrowUpRight,
  Radio,
  Trophy,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";
import { CyberSamuraiArt, NeonRoninArt } from "./AnimeCharacterSvg";

export interface BentoDashboardProps {
  activeSection?: string;
}

type SizeOption = "S" | "M" | "L" | "XL";
type DropCategory = "ALL DROPS" | "HEAVY HOODIES" | "TECH CARGO" | "LIMITED ART";

interface SecondaryDrop {
  id: string;
  code: string;
  title: string;
  category: Exclude<DropCategory, "ALL DROPS">;
  price: string;
  stock: number;
  accentColor: string;
  badgeText: string;
  specs: string;
}

const SECONDARY_DROPS: SecondaryDrop[] = [
  {
    id: "drop-002",
    code: "XG-002 // CARGO",
    title: "AKIRA VORTEX TACTICAL CARGO",
    category: "TECH CARGO",
    price: "$130 USD",
    stock: 19,
    accentColor: "#FFD200",
    badgeText: "BALLISTIC NYLON",
    specs: "8 BOLSILLOS MAGNÉTICOS // CORTE REBELDE",
  },
  {
    id: "drop-003",
    code: "XG-003 // HOODIE",
    title: "KUROGANE ACID WASH HOODIE",
    category: "HEAVY HOODIES",
    price: "$155 USD",
    stock: 11,
    accentColor: "#E6002B",
    badgeText: "600 GSM COTTON",
    specs: "BORDADO ESPALDA COMPLETA // COSTURA INVERTIDA",
  },
  {
    id: "drop-004",
    code: "XG-004 // ART DECK",
    title: "SHIBUYA OVERDRIVE SKATE DECK + PRINT",
    category: "LIMITED ART",
    price: "$95 USD",
    stock: 7,
    accentColor: "#D4FE00",
    badgeText: "SERIALIZADO 1/50",
    specs: "MADERA MAPLE CANADIENSE // TINTA UV NEÓN",
  },
];

interface RebelLeader {
  rank: string;
  handle: string;
  role: string;
  rep: string;
  streak: string;
  online: boolean;
}

const REBEL_LEADERBOARD: RebelLeader[] = [
  {
    rank: "#01",
    handle: "javib31 [FOUNDER // XG]",
    role: "SHOGUN ARCHITECT",
    rep: "99,450 XP",
    streak: "DROP MASTER",
    online: true,
  },
  {
    rank: "#02",
    handle: "Kurogane_99",
    role: "NIGHT RUNNER",
    rep: "42,810 XP",
    streak: "14 DROPS CLAIMED",
    online: true,
  },
  {
    rank: "#03",
    handle: "AkiraVortex",
    role: "STREET VANGUARD",
    rep: "38,120 XP",
    streak: "11 DROPS CLAIMED",
    online: true,
  },
  {
    rank: "#04",
    handle: "Argon_XG [BOT]",
    role: "SENTINEL DAEMON",
    rep: "35,000 XP",
    streak: "DISCORD SYNC ACTIVE",
    online: true,
  },
];

export function BentoDashboard({ activeSection = "hub" }: BentoDashboardProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>("L");
  const [heroStock, setHeroStock] = useState<number>(24);
  const [claimedHero, setClaimedHero] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<DropCategory>("ALL DROPS");
  const [savedDrops, setSavedDrops] = useState<Record<string, boolean>>({
    "drop-002": true,
  });

  // Countdown en vivo (04h : 42m : 19s inicial)
  const [secondsLeft, setSecondsLeft] = useState<number>(4 * 3600 + 42 * 60 + 19);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 4 * 3600 + 59 * 60 + 59));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const handleClaimHeroDrop = () => {
    if (!claimedHero && heroStock > 0) {
      setClaimedHero(true);
      setHeroStock((prev) => prev - 1);
    } else {
      setClaimedHero(false);
    }
  };

  const toggleSaveDrop = (id: string) => {
    setSavedDrops((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredDrops =
    activeCategory === "ALL DROPS"
      ? SECONDARY_DROPS
      : SECONDARY_DROPS.filter((drop) => drop.category === activeCategory);

  return (
    <section
      aria-label="XtremGen Bento Dashboard"
      className="w-full pb-12 select-none"
    >
      {/* Cabecera Táctica del Sector Activo */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1F2437] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-[#E6002B] text-white text-xs font-black px-2.5 py-1 rounded-none tracking-widest uppercase shadow-[3px_3px_0px_0px_#000]">
            <Flame className="w-3.5 h-3.5 fill-current" />
            SECTOR // {activeSection.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-2 bg-[#050508] border border-[#D4FE00] text-[#D4FE00] text-xs font-mono px-2.5 py-1 rounded-none">
            <span className="w-2 h-2 bg-[#D4FE00] inline-block animate-pulse" />
            OUT-OF-BOUNDS ENGINE // ONLINE
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Terminal className="w-4 h-4 text-[#FFD200]" />
          <span>XG-OS v4.2 // NEO-TOKYO STREETWEAR PROTOCOL</span>
        </div>
      </div>

      {/* GRID PRINCIPAL BENTO (12 COLUMNAS) */}
      <div className="grid grid-cols-12 gap-6 pt-6">
        {/* =====================================================================
            1. TARJETA HERO PRINCIPAL (col-span-12 xl:col-span-8)
            Con ilustración <CyberSamuraiArt /> Out-of-Bounds (overflow-visible)
           ===================================================================== */}
        <div className="col-span-12 xl:col-span-8 bg-[#0B1020] border-2 border-xg-yellow p-6 md:p-8 rounded-none shadow-[4px_4px_0px_0px_#E6002B] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-shadow duration-200 relative overflow-visible group">
          {/* Cinta Superior Neobrutalista que rompe el borde superior izquierdo */}
          <div className="absolute -top-3.5 left-6 z-30 bg-[#FFD200] text-black font-black text-xs px-3 py-1 tracking-widest uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            LIMITED EDITION // SEASON 01
          </div>

          {/* Ilustración Anime Out-of-Bounds (Sobresale por encima del contenedor) */}
          <div className="hidden sm:block absolute -top-10 -right-4 md:-top-14 md:right-4 z-20 pointer-events-none w-64 md:w-80 lg:w-[340px] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.03]">
            <CyberSamuraiArt className="w-full h-auto drop-shadow-[6px_8px_0px_rgba(0,0,0,0.95)]" />
          </div>

          {/* Contenido Principal de la Tarjeta Hero */}
          <div className="relative z-30 max-w-xl space-y-5">
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="bg-[#E6002B] text-white text-xs font-black px-2.5 py-0.5 uppercase tracking-wider">
                HEAVYWEIGHT 650 GSM
              </span>
              <span className="bg-[#050508] border border-[#D4FE00] text-[#D4FE00] text-xs font-mono px-2.5 py-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#D4FE00] rounded-none animate-ping" />
                {heroStock} UNIDADES RESTANTES
              </span>
            </div>

            <div>
              <p className="text-xs font-mono tracking-[0.25em] text-[#FFD200] uppercase mb-1">
                [ARCHIVE RELEASE // 001-XG]
              </p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-none">
                DROP 001 //{" "}
                <span className="text-[#FFD200] underline decoration-[#E6002B] decoration-4 underline-offset-4">
                  PHANTOM RONIN
                </span>{" "}
                HEAVY HOODIE
              </h1>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed font-medium bg-[#050508]/85 border-l-4 border-[#E6002B] p-3">
              Algodón blindado de alto gramaje con serigrafía reflectante Cyber-Oni,
              correas tácticas desmontables y chip NFC autenticado en la manga
              izquierda con acceso VIP al servidor de XtremGen.
            </p>

            {/* Selector Interactivo de Talles + Precio */}
            <div className="flex flex-wrap items-end justify-between gap-6 pt-1">
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  SELECCIONA TALLE (OVERSIZE FIT):
                </span>
                <div className="flex items-center gap-2">
                  {(["S", "M", "L", "XL"] as SizeOption[]).map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 font-mono font-black text-sm rounded-none border-2 transition-all ${
                          isSelected
                            ? "bg-[#FFD200] text-black border-black shadow-[3px_3px_0px_0px_#E6002B] -translate-y-0.5"
                            : "bg-[#050508] text-white border-zinc-700 hover:border-[#FFD200]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#050508] border-2 border-zinc-800 px-4 py-2 shadow-[4px_4px_0px_0px_#000]">
                <span className="block text-[10px] font-mono text-zinc-400 uppercase">
                  PRECIO DE LANZAMIENTO
                </span>
                <span className="text-2xl font-black text-[#FFD200] tracking-tight">
                  $145 USD
                </span>
              </div>
            </div>

            {/* Botón CTA Interactivo con confirmación visual */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleClaimHeroDrop}
                className={`px-6 py-3.5 font-black text-sm tracking-widest uppercase rounded-none border-2 border-black transition-all flex items-center gap-2.5 ${
                  claimedHero
                    ? "bg-[#D4FE00] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[0_0_20px_rgba(212,254,0,0.6)]"
                    : "bg-[#E6002B] text-white shadow-[4px_4px_0px_0px_#FFD200] hover:bg-[#FFD200] hover:text-black hover:shadow-[0_0_20px_rgba(255,210,0,0.45)]"
                }`}
              >
                {claimedHero ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    RESERVADO EN TU LOCKER (TALLE {selectedSize})
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    CLAIM DROP // AHORA
                  </>
                )}
              </button>

              <span className="text-xs font-mono text-zinc-400">
                {claimedHero
                  ? "✓ TOKEN DE RESERVA SINCRONIZADO"
                  : "ENVÍO GLOBAL EXPRÉS // SIN RE-STOCK"}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            2. TARJETA DE TELEMETRÍA & COUNTDOWN DEL PRÓXIMO DROP (col-span-12 xl:col-span-4)
           ===================================================================== */}
        <div className="col-span-12 xl:col-span-4 bg-[#050508] border-2 border-xg-red p-6 rounded-none shadow-[4px_4px_0px_0px_#000] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-shadow flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#E6002B]" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                  TELEMETRÍA // PRÓXIMO DROP
                </span>
              </div>
              <span className="bg-[#E6002B]/20 border border-[#E6002B] text-[#E6002B] text-[10px] font-mono px-2 py-0.5 font-bold">
                LIVE SYNC
              </span>
            </div>

            {/* Reloj de Cuenta Regresiva */}
            <div className="bg-[#0A0A0E] border-2 border-zinc-800 p-4 mb-5 shadow-[4px_4px_0px_0px_#000]">
              <p className="text-[11px] font-mono text-zinc-400 uppercase mb-2">
                DESBLOQUEO DE BÓVEDA: &quot;NEON ONI BOMBER JACKET&quot;
              </p>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#0B1020] border border-[#FFD200] py-2">
                  <span className="block text-2xl md:text-3xl font-black text-[#FFD200]">
                    {hours}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase">HORAS</span>
                </div>
                <div className="bg-[#0B1020] border border-[#FFD200] py-2">
                  <span className="block text-2xl md:text-3xl font-black text-[#FFD200]">
                    {minutes}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase">MIN</span>
                </div>
                <div className="bg-[#0B1020] border border-[#E6002B] py-2">
                  <span className="block text-2xl md:text-3xl font-black text-[#E6002B]">
                    {seconds}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase">SEG</span>
                </div>
              </div>
            </div>

            {/* Barra de Progreso de Hype de la Comunidad */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD200]" />
                  HYPE COMUNIDAD XG
                </span>
                <span className="text-[#D4FE00] font-black">94% LOCKED</span>
              </div>
              <div className="w-full h-4 bg-[#0A0A0E] border-2 border-zinc-700 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#E6002B] via-[#FFD200] to-[#D4FE00]"
                  style={{ width: "94%" }}
                />
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                1,420 Rebeldes esperando en sala de lanzamiento.
              </p>
            </div>
          </div>

          {/* Estado de Sincronización con Discord XtremeGen HQ */}
          <div className="bg-[#0B1020] border-2 border-[#D4FE00] p-3.5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#D4FE00] animate-pulse" />
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    DISCORD: XtremeGen HQ
                  </p>
                  <p className="text-[11px] font-mono text-[#D4FE00]">
                    BOT ARGON // ALERTAS ACTIVAS
                  </p>
                </div>
              </div>
              <span className="bg-[#D4FE00] text-black font-mono font-black text-[10px] px-2 py-1 uppercase">
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. BARRA DE FILTROS INTERACTIVOS DE CATEGORÍAS (col-span-12)
           ===================================================================== */}
        <div className="col-span-12 flex flex-wrap items-center justify-between gap-4 bg-[#050508] border-2 border-zinc-800 p-4 rounded-none shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FFD200]" />
            <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-white">
              ARSENAL STREETWEAR // DROPS ACTIVOS
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                "ALL DROPS",
                "HEAVY HOODIES",
                "TECH CARGO",
                "LIMITED ART",
              ] as DropCategory[]
            ).map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-black uppercase rounded-none border-2 transition-all ${
                    isActive
                      ? "bg-[#FFD200] text-black border-black shadow-[3px_3px_0px_0px_#E6002B]"
                      : "bg-[#0A0A0E] text-zinc-300 border-zinc-800 hover:border-[#FFD200] hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            4. TARJETAS BENTO DE DROPS SECUNDARIOS (col-span-12 md:col-span-4)
            Con ilustración <NeonRoninArt /> sobresaliendo (overflow-visible)
           ===================================================================== */}
        {filteredDrops.map((drop) => {
          const isSaved = !!savedDrops[drop.id];
          return (
            <div
              key={drop.id}
              className="col-span-12 md:col-span-4 bg-[#0B1020] border-2 border-zinc-700 hover:border-xg-yellow p-6 rounded-none shadow-[4px_4px_0px_0px_#000] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-all relative overflow-visible group flex flex-col justify-between mt-4"
            >
              {/* Badge Superior Out-of-Bounds */}
              <div
                className="absolute -top-3 left-4 z-20 px-2.5 py-0.5 text-[10px] font-mono font-black uppercase text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                style={{ backgroundColor: drop.accentColor }}
              >
                {drop.badgeText}
              </div>

              {/* Arte Anime Ronin Sobresaliendo por la esquina superior derecha */}
              <div className="absolute -top-9 right-2 w-28 h-28 z-20 pointer-events-none transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105">
                <NeonRoninArt className="w-full h-full drop-shadow-[4px_4px_0px_rgba(0,0,0,0.9)]" />
              </div>

              <div className="relative z-30 pt-3 pr-20">
                <span className="text-[11px] font-mono text-zinc-400 uppercase block">
                  {drop.code}
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1 group-hover:text-[#FFD200] transition-colors">
                  {drop.title}
                </h3>
              </div>

              <div className="relative z-30 my-4 bg-[#050508] border-l-2 border-[#FFD200] p-2.5">
                <p className="text-[11px] font-mono text-zinc-300">{drop.specs}</p>
              </div>

              <div className="relative z-30 flex items-center justify-between pt-3 border-t border-zinc-800">
                <div>
                  <span className="text-lg font-black text-[#FFD200] block leading-none">
                    {drop.price}
                  </span>
                  <span className="text-[10px] font-mono text-[#D4FE00] uppercase">
                    ● {drop.stock} EN STOCK
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSaveDrop(drop.id)}
                    aria-label={`Guardar ${drop.title}`}
                    className={`p-2 border-2 rounded-none transition-colors ${
                      isSaved
                        ? "bg-[#E6002B] border-black text-white shadow-[2px_2px_0px_0px_#FFD200]"
                        : "bg-[#050508] border-zinc-700 text-zinc-400 hover:border-[#FFD200] hover:text-[#FFD200]"
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSaveDrop(drop.id)}
                    className="bg-[#FFD200] hover:bg-[#D4FE00] text-black font-black text-xs px-3 py-2 rounded-none border-2 border-black shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider flex items-center gap-1"
                  >
                    {isSaved ? "LOCKED" : "RESERVAR"}
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* =====================================================================
            5. BANNER INFERIOR: RANKING DE LA COMUNIDAD / REBEL LEADERBOARD (col-span-12)
           ===================================================================== */}
        <div className="col-span-12 bg-[#050508] border-2 border-xg-yellow p-6 rounded-none shadow-[4px_4px_0px_0px_#E6002B] mt-2">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD200] text-black p-2 border-2 border-black shadow-[3px_3px_0px_0px_#E6002B]">
                <Trophy className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                  REBEL LEADERBOARD // TOP COMUNIDAD XTREMGEN
                </h2>
                <p className="text-xs font-mono text-zinc-400">
                  SINCRONIZADO CON SERVIDOR OFICIAL DISCORD &amp; SUPABASE REALTIME
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0B1020] border border-[#D4FE00] px-3 py-1.5">
              <ShieldAlert className="w-4 h-4 text-[#D4FE00]" />
              <span className="text-xs font-mono text-[#D4FE00] font-bold">
                SEASON 01 REWARDS // ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REBEL_LEADERBOARD.map((member) => (
              <div
                key={member.handle}
                className="bg-[#0B1020] border-2 border-zinc-800 hover:border-[#FFD200] p-4 rounded-none shadow-[4px_4px_0px_0px_#000] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#E6002B] text-white font-mono font-black text-xs px-2 py-0.5">
                    {member.rank}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#D4FE00]">
                    <span className="w-2 h-2 bg-[#D4FE00] inline-block" />
                    ONLINE
                  </span>
                </div>

                <p className="text-sm font-black text-white truncate">
                  {member.handle}
                </p>
                <p className="text-[11px] font-mono text-[#FFD200] uppercase mb-3">
                  {member.role}
                </p>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-xs font-mono">
                  <span className="text-zinc-400">{member.streak}</span>
                  <span className="text-[#D4FE00] font-black">{member.rep}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

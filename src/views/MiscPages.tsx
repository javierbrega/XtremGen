"use client";

import React from 'react';
import { BookOpen, Info } from 'lucide-react';
import { Card } from '../components/ui/Base';

export const BlogPage = () => (
  <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
    <h1 className="text-4xl md:text-6xl font-black mb-8 flex items-center gap-4">
      <BookOpen className="text-primary w-10 h-10 md:w-14 md:h-14" />
      BLOG <span className="text-primary">XG</span>
    </h1>
    <Card className="p-14 text-center border-dashed border-white/10">
      <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
      <h2 className="text-xl font-black text-white">Editorial en 0</h2>
      <p className="text-sm text-zinc-400 mt-1">
        Sin artículos hardcodeados. Publica contenido desde Noticias o Foro.
      </p>
    </Card>
  </div>
);

export const AboutPage = () => (
  <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
    <h1 className="text-4xl md:text-6xl font-black mb-12 flex items-center gap-4">
      <Info className="text-primary w-10 h-10 md:w-14 md:h-14" />
      ACERCA DE <span className="text-primary">XG</span>
    </h1>
    <div className="max-w-3xl">
      <p className="text-xl text-zinc-300 leading-relaxed mb-8">
        XtremGen (XG) es la plataforma integral para entusiastas del hardware y el gaming competitivo, respaldada en tiempo real por Supabase.
      </p>
    </div>
  </div>
);

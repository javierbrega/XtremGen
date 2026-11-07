"use client";

import React from 'react';
import { Link } from '../lib/router';
import { Shield, ChevronLeft } from 'lucide-react';
import { Button, Card } from '../components/ui/Base';

export const ProHQ = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20 px-6 max-w-5xl mx-auto text-center">
      <Card className="p-14 border-dashed border-white/10 bg-[#121218]/60">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black mb-2 uppercase">Pro Headquarters en 0</h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Se eliminaron todas las organizaciones hardcodeadas. Las organizaciones verificadas se gestionan desde el directorio oficial de Clanes en Supabase.
        </p>
        <Link to="/clan">
          <Button variant="primary">
            <ChevronLeft className="w-4 h-4" /> Volver a Clanes XG
          </Button>
        </Link>
      </Card>
    </div>
  );
};

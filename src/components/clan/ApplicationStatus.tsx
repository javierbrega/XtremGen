"use client";

import React from 'react';
import { Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

export type ApplicationState = 'pending' | 'reviewing' | 'accepted' | 'rejected';

interface ApplicationStatusProps {
  clanName: string;
  clanLogo: string;
  roleApplied: string;
  status: ApplicationState;
  dateApplied: string;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  clanName,
  clanLogo,
  roleApplied,
  status,
  dateApplied
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-zinc-400" />,
          text: 'Pendiente',
          color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
          description: 'Tu solicitud ha sido enviada y está a la espera de revisión.'
        };
      case 'reviewing':
        return {
          icon: <Clock className="w-5 h-5 text-blue-400 animate-pulse" />,
          text: 'En Revisión',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          description: 'El líder del clan está evaluando tus stats y tu clip.'
        };
      case 'accepted':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          text: 'Aceptado',
          color: 'bg-green-500/10 text-green-500 border-green-500/20',
          description: '¡Felicidades! Has sido aceptado en el clan.'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Rechazado',
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          description: 'Tu solicitud no ha sido aceptada en esta ocasión.'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="bg-[#111] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={clanLogo} alt={clanName} className="w-12 h-12 rounded-lg border border-gray-800 object-cover" referrerPolicy="no-referrer" />
          <div>
            <h4 className="font-bold text-white text-lg">{clanName}</h4>
            <p className="text-sm text-zinc-500">Postulación para <span className="text-primary font-semibold">{roleApplied}</span></p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${config.color}`}>
          {config.icon}
          {config.text}
        </div>
      </div>
      
      <div className="bg-[#0a0a0a] rounded-lg p-3 border border-gray-800/30">
        <p className="text-sm text-zinc-400">{config.description}</p>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 font-medium">
        <span>Enviado el {dateApplied}</span>
        {status === 'accepted' && (
          <button className="text-primary hover:text-red-400 flex items-center gap-1 transition-colors">
            Ir al Clan <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from '../lib/motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(({ title, message, type }: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={`
                relative overflow-hidden p-4 rounded-xl glass shadow-2xl flex gap-3 items-start
                ${n.type === 'success' ? 'border-l-4 border-l-accent' : ''}
                ${n.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
                ${n.type === 'info' ? 'border-l-4 border-l-primary' : ''}
              `}
            >
              <div className="mt-0.5">
                {n.type === 'success' && <CheckCircle className="w-5 h-5 text-accent" />}
                {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {n.type === 'info' && <Info className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{n.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{n.message}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 opacity-30
                  ${n.type === 'success' ? 'bg-accent' : ''}
                  ${n.type === 'error' ? 'bg-red-500' : ''}
                  ${n.type === 'info' ? 'bg-primary' : ''}
                `}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

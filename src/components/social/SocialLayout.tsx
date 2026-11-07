"use client";

import React from 'react';
import { SocialSidebar } from './SocialSidebar';
import { SocialRightSidebar } from './SocialRightSidebar';

export const SocialLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex justify-center mx-auto max-w-[1265px] w-full relative">
      <header className="w-[80px] lg:w-[260px] flex-shrink-0 z-50 relative">
        <div className="sticky top-20 h-[calc(100vh-5rem)] w-full">
          <SocialSidebar />
        </div>
      </header>

      <main className="flex-1 max-w-[750px] w-full min-h-screen pb-20 bg-[#0a0a0a] z-10 px-4 sm:px-8 lg:px-12">
        {children}
      </main>

      <aside className="hidden xl:block w-[350px] flex-shrink-0 z-30 bg-[#0a0a0a]">
        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pl-6 border-l border-gray-800/50">
          <SocialRightSidebar />
        </div>
      </aside>
    </div>
  );
};

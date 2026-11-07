"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type FilterCategory = 'pc' | 'ps' | 'xbox' | 'nintendo' | 'mobile' | 'esports' | null;

interface FilterContextType {
  activeFilter: FilterCategory;
  setActiveFilter: (filter: FilterCategory) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(null);

  const handleSetFilter = (filter: FilterCategory) => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };

  return (
    <FilterContext.Provider value={{ activeFilter, setActiveFilter: handleSetFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

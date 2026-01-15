
// Fix: Import React to provide the React namespace for ReactNode
import React from 'react';

export interface Game {
  id: string;
  title: string;
  subtitle: string;
  tagline: string; // Brief description below the title
  image: string;
  playingCount: string;
  category: 'original' | 'slot' | 'live';
  bgColor: string;
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

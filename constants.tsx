
import React from 'react';
import { 
  Disc, 
  FileText, 
  LayoutGrid,
  Activity,
  Rocket,
  Bomb,
  Gift,
  Users,
  Trophy,
  History,
  Star,
  Settings
} from 'lucide-react';
import { Game, NavItem } from './types';

export const OVERVIEW_NAV: NavItem[] = [
  { label: 'Lobby', icon: <LayoutGrid className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Trading', icon: <Activity className="w-5 h-5" />, path: '/trading' },
  { label: 'Crash', icon: <Rocket className="w-5 h-5" />, path: '/crash' },
  { label: 'Mines', icon: <Bomb className="w-5 h-5" />, path: '/mines' },
  { label: 'Plinko', icon: <Disc className="w-5 h-5" />, path: '/plinko' },
  { label: 'Transactions', icon: <History className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Favorites', icon: <Star className="w-5 h-5" />, path: '/dashboard' },
  { label: 'VIP Club', icon: <Trophy className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Account', icon: <Settings className="w-5 h-5" />, path: '/dashboard' },
];

export const ORIGINALS: Game[] = [
  { 
    id: '1', 
    title: 'TRADING', 
    subtitle: 'STAKE ORIGINALS', 
    tagline: 'Predict market trends with 86% ROI',
    playingCount: '12,438', 
    category: 'original', 
    bgColor: 'bg-emerald-600', 
    image: 'https://images.unsplash.com/photo-1611974717483-3600991e1645?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '2', 
    title: 'CRASH', 
    subtitle: 'STAKE ORIGINALS', 
    tagline: 'Watch the multiplier climb and cash out',
    playingCount: '8,857', 
    category: 'original', 
    bgColor: 'bg-orange-500', 
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '3', 
    title: 'MINES', 
    subtitle: 'STAKE ORIGINALS', 
    tagline: 'Avoid hidden explosives to find gems',
    playingCount: '5,846', 
    category: 'original', 
    bgColor: 'bg-blue-500', 
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '4', 
    title: 'PLINKO', 
    subtitle: 'STAKE ORIGINALS', 
    tagline: 'Classic game of chance and multipliers',
    playingCount: '5,193', 
    category: 'original', 
    bgColor: 'bg-pink-500', 
    image: 'https://images.unsplash.com/photo-1611252110292-16e6d191295c?auto=format&fit=crop&q=80&w=400' 
  },
];

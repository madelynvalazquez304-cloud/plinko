
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  
  const handlePlay = () => {
    switch (game.title) {
      case 'PLINKO': navigate('/plinko'); break;
      case 'TRADING': navigate('/trading'); break;
      case 'CRASH': navigate('/crash'); break;
      case 'MINES': navigate('/mines'); break;
      default: break;
    }
  };

  return (
    <div onClick={handlePlay} className="group cursor-pointer flex flex-col gap-3">
      <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden ${game.bgColor} flex items-center justify-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-lg border border-white/5`}>
        <img 
          src={game.image} 
          alt={game.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
        />
        <div className="relative z-10 text-center p-6">
          <h4 className="text-3xl font-black italic text-white tracking-tighter mb-2 drop-shadow-2xl uppercase leading-none">
            {game.title}
          </h4>
          <p className="text-[10px] font-bold text-white/90 uppercase tracking-[0.2em] opacity-80 mb-4">
            {game.subtitle}
          </p>
        </div>
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-8 h-8 text-black ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
           </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-1">
        <h5 className="text-[11px] font-black uppercase text-white tracking-tight">{game.title}</h5>
        <p className="text-[10px] text-gray-500 font-medium leading-tight line-clamp-2">{game.tagline}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">{game.playingCount} Active</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

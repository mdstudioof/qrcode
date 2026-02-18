import React from 'react';
import { Heart, PlayCircle, QrCode } from 'lucide-react';

interface HeroProps {
  onOpenCreateModal: () => void;
  onOpenLoginModal: () => void;
  onViewDemo: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenCreateModal, onOpenLoginModal, onViewDemo }) => {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28 bg-slate-900">
      
      {/* Background Decor (Dark Mode) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-1/4 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute -bottom-[10%] left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Pill Badge (Dark Style) */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/50 border border-brand-700/50 text-brand-300 mb-8 animate-fade-in backdrop-blur-sm shadow-lg shadow-brand-900/20">
          <Heart size={16} className="fill-brand-500 text-brand-500" />
          <span className="text-sm font-semibold tracking-wide">Preservando Memórias Para Sempre</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 animate-slide-up leading-[1.1]">
          Eternize Memórias com <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-purple-400">
            QR Code Memorial
          </span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
          Crie um tributo emocionante que dura para sempre. Reúna fotos, vídeos, áudios e histórias de vida em um memorial digital acessível instantaneamente através de um QR Code exclusivo.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-lg px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-brand-900/50 hover:shadow-brand-600/40 transform hover:-translate-y-1 w-full sm:w-auto justify-center border border-transparent"
          >
            <QrCode size={20} />
            Começar Agora
          </button>
          
          <button 
            onClick={onViewDemo}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-lg px-8 py-4 rounded-full font-bold transition-all w-full sm:w-auto justify-center hover:text-white shadow-lg shadow-black/20"
          >
            <PlayCircle size={20} />
            Ver Demonstração
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
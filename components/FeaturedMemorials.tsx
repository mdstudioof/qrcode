import React, { useEffect, useState } from 'react';
import { getPublicMemorials, getMockMemorials } from '../services/memorialService';
import { Memorial } from '../types';
import { Calendar, User, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FeaturedMemorialsProps {
  onViewMemorial: (id: string) => void;
  onExploreClick: () => void;
}

const FeaturedMemorials: React.FC<FeaturedMemorialsProps> = ({ onViewMemorial, onExploreClick }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemorials = async () => {
      setLoading(true);
      if (isAuthenticated) {
        // Se logado, busca memoriais reais públicos
        const { data } = await getPublicMemorials();
        if (data) {
          setMemorials(data.slice(0, 3));
        }
      } else {
        // Se não logado, usa os mocks
        const mocks = getMockMemorials();
        setMemorials(mocks);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchMemorials();
    }
  }, [isAuthenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <section className="py-12 bg-slate-50 flex justify-center">
        <Loader2 className="animate-spin text-brand-600" size={24} />
      </section>
    );
  }

  if (memorials.length === 0) return null;

  return (
    <section className="pt-4 pb-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Histórias que <span className="text-brand-600">Inspiram</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              {isAuthenticated 
                ? "Explore alguns dos memoriais criados por nossa comunidade."
                : "Veja exemplos de como os memoriais ficam lindos e emocionantes."
              }
            </p>
          </div>
          <button 
            onClick={onExploreClick}
            className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors group"
          >
            Ver todos os memoriais
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {memorials.map((memorial) => (
            <div 
              key={memorial.id} 
              onClick={() => onViewMemorial(memorial.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group cursor-pointer flex flex-col h-full"
            >
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                {memorial.cover_image_url ? (
                  <img src={memorial.cover_image_url} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                
                {/* Demo Badge */}
                {!isAuthenticated && (
                  <div className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    DEMO
                  </div>
                )}
              </div>

              <div className="p-6 pt-0 flex-1 flex flex-col relative items-center">
                {/* Profile Image */}
                <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden -mt-12 mb-4 shadow-md relative z-10">
                    {memorial.profile_image_url ? <img src={memorial.profile_image_url} alt={memorial.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100"><User size={32} /></div>}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 text-center">{memorial.name}</h3>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 py-1 px-3 rounded-full">
                  <Calendar size={12} />
                  <span>{memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : '?'} - {memorial.death_date ? new Date(memorial.death_date).getFullYear() : '?'}</span>
                </div>
                
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 text-center">{memorial.biography || "Uma vida lembrada com carinho..."}</p>

                <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center text-sm text-brand-600 font-bold group-hover:text-brand-700">
                    <span className="flex items-center gap-1"><Heart size={16} /> Lembranças</span>
                    <span>Ver Memorial &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-8 text-center md:hidden">
           <button 
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors"
          >
            Ver todos os memoriais
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedMemorials;
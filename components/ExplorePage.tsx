import React, { useEffect, useState } from 'react';
import { getPublicMemorials, getMockMemorials } from '../services/memorialService';
import { Memorial } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Calendar, 
  User,
  Loader2,
  Heart,
  Lock
} from 'lucide-react';

interface ExplorePageProps {
  onViewMemorial: (id: string) => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ onViewMemorial }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [filteredMemorials, setFilteredMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMemorials = async () => {
      setLoading(true);
      if (isAuthenticated) {
        // Logado: Busca reais
        const { data } = await getPublicMemorials();
        if (data) {
          setMemorials(data);
          setFilteredMemorials(data);
        }
      } else {
        // Não logado: Mostra mocks
        const mocks = getMockMemorials();
        setMemorials(mocks);
        setFilteredMemorials(mocks);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchMemorials();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMemorials(memorials);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredMemorials(memorials.filter(m => 
        m.name.toLowerCase().includes(lower) || 
        m.biography?.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, memorials]);

  if (authLoading || loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Explorar Memoriais</h1>
           <p className="text-lg text-slate-600 max-w-2xl mx-auto">
             {isAuthenticated 
               ? "Conheça histórias inspiradoras e celebre a vida de pessoas que deixaram saudades."
               : "Veja exemplos de memoriais criados em nossa plataforma."}
           </p>
           
           {!isAuthenticated && (
              <div className="mt-4 bg-brand-50 border border-brand-100 rounded-lg p-3 inline-block">
                <p className="text-sm text-brand-700 font-medium">
                  Faça login para ver memoriais reais criados pela comunidade.
                </p>
              </div>
           )}
           
           <div className="mt-8 max-w-xl mx-auto relative">
             <input 
               type="text" 
               placeholder="Buscar por nome ou história..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-300 shadow-sm focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all text-lg"
             />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredMemorials.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum memorial encontrado</h3>
             <p className="text-slate-500">Tente buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMemorials.map((memorial) => (
              <div 
                key={memorial.id} 
                onClick={() => onViewMemorial(memorial.id)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group cursor-pointer flex flex-col h-full relative"
              >
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {memorial.cover_image_url ? (
                    <img src={memorial.cover_image_url} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  
                  {/* Demo Badge for Non-Auth */}
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
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
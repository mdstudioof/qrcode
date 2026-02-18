import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  ChevronDown, 
  X, 
  Maximize2, 
  Share2, 
  Loader2, 
  Music, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';
import { getMemorialFull } from '../services/memorialService';
import { Memorial, TimelineEvent, MediaItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface MemorialViewPageProps {
  memorialId: string;
  onBack: () => void;
}

const MemorialViewPage: React.FC<MemorialViewPageProps> = ({ memorialId, onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedTimelineIds, setExpandedTimelineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadMemorial = async () => {
      setLoading(true);
      const { memorial, timeline, media, error } = await getMemorialFull(memorialId);
      
      if (error || !memorial) {
        setError("Não foi possível carregar o memorial.");
        setLoading(false);
        return;
      }

      setMemorial(memorial);
      setTimeline(timeline.map((t: any) => ({
        id: t.id,
        year: t.year,
        title: t.title,
        description: t.description
      })));

      // Categorize media
      const g: MediaItem[] = [];
      const v: MediaItem[] = [];
      const a: MediaItem[] = [];

      media.forEach((m: any) => {
        const item: MediaItem = {
          id: m.id,
          type: m.type,
          previewUrl: m.url,
          isExisting: true
        };
        if (m.type === 'image') g.push(item);
        else if (m.type === 'video') v.push(item);
        else if (m.type === 'audio') a.push(item);
      });

      setGallery(g);
      setVideos(v);
      setAudios(a);
      setLoading(false);
    };

    loadMemorial();
  }, [memorialId]);

  const toggleTimelineExpand = (id: string) => {
    setExpandedTimelineIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  if (error || !memorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onBack} className="text-brand-600 hover:underline">Voltar</button>
      </div>
    );
  }

  // --- ACCESS CONTROL LOGIC ---
  const isAdmin = user?.email === 'admin@eternize.com.br';
  const isOwner = user?.id === memorial.user_id;
  const isApproved = memorial.status === true;
  const isDemo = memorial.id.startsWith('demo-'); // Allow all users to see demos

  // 1. If not approved AND NOT owner AND NOT admin AND NOT demo -> Block Access
  if (!isApproved && !isOwner && !isAdmin && !isDemo) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
         <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-500">
           <Lock size={40} />
         </div>
         <h1 className="text-2xl font-bold text-slate-900 mb-2">Memorial Indisponível</h1>
         <p className="text-slate-600 mb-8 max-w-md">
           Este memorial ainda não está ativo ou aguarda aprovação. Por favor, tente novamente mais tarde.
         </p>
         <button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">
           Voltar ao Início
         </button>
       </div>
    );
  }

  // Determine if we have a top banner to adjust layout
  const hasTopBanner = isDemo || (!isApproved && !isDemo);

  return (
    <div className="min-h-screen bg-white animate-fade-in pb-24">
      
      {/* Pending Banner (Only visible to Owner/Admin if not approved) */}
      {!isApproved && !isDemo && (
        <div className="bg-amber-100 text-amber-900 px-4 py-3 text-center text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-[60]">
           <AlertTriangle size={18} />
           <span>Memorial aguardando pagamento ou aprovação. Visível apenas para você.</span>
        </div>
      )}
      
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-brand-600 text-white px-4 py-3 text-center text-sm font-bold sticky top-0 z-[60]">
           MODO DEMONSTRAÇÃO - Visualizando Memorial Exemplo
        </div>
      )}

      {/* Navbar Overlay */}
      <div className={`fixed left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none transition-all duration-300 ${hasTopBanner ? 'top-14' : 'top-0'}`}>
        <button 
          onClick={onBack} 
          className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 px-4 py-2 rounded-full font-medium transition-all shadow-lg border border-white/10"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        {(isApproved || isDemo) && (
          <button className="pointer-events-auto bg-black/30 backdrop-blur-md text-white hover:bg-black/50 p-2 rounded-full transition-all shadow-lg border border-white/10">
            <Share2 size={20} />
          </button>
        )}
      </div>

      {/* Hero Cover */}
      <div className="h-[50vh] w-full bg-slate-900 relative">
        {memorial.cover_image_url ? (
          <img src={memorial.cover_image_url} alt="Capa" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-brand-900 to-slate-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-32 z-10">
        
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-48 h-48 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-slate-100 mx-auto">
              {memorial.profile_image_url ? (
                <img src={memorial.profile_image_url} alt={memorial.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">{memorial.name}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 rounded-full text-brand-700 font-semibold border border-brand-100">
             <Calendar size={14} />
             <span>
               {memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : 'Unknown'} 
               {' - '} 
               {memorial.death_date ? new Date(memorial.death_date).getFullYear() : 'Presente'}
             </span>
          </div>
        </div>

        {/* Biography */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400"></div>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
            "{memorial.biography || "Uma vida para ser lembrada..."}"
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-20 bg-slate-100 rounded-full"></div>
          </div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="mb-16 animate-slide-up">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ImageIcon size={24} /></div>
              Galeria de Fotos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedImage(item.previewUrl)}
                  className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group relative transform hover:-translate-y-1"
                >
                  <img src={item.previewUrl} alt="Memória" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg transform scale-75 group-hover:scale-100 duration-300" size={32} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="mb-16 animate-slide-up">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Calendar size={24} /></div>
              Linha do Tempo
            </h3>
            <div className="space-y-4 pl-4 border-l-2 border-slate-200 ml-3">
              {timeline.map((event) => {
                const isExpanded = expandedTimelineIds.has(event.id);
                return (
                  <div 
                    key={event.id} 
                    className="relative pl-8 cursor-pointer group"
                    onClick={() => toggleTimelineExpand(event.id)}
                  >
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ring-2 transition-all duration-300 ${isExpanded ? 'bg-amber-500 ring-amber-200 scale-125' : 'bg-slate-300 ring-transparent group-hover:bg-amber-400'}`}></div>
                    
                    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-white border-amber-100 shadow-lg shadow-amber-50/50 p-6' : 'bg-transparent border-transparent hover:bg-slate-50 p-2'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className={`font-bold text-sm block mb-1 transition-colors ${isExpanded ? 'text-amber-600' : 'text-slate-500'}`}>{event.year}</span>
                          <h4 className={`text-xl font-bold transition-colors ${isExpanded ? 'text-slate-900' : 'text-slate-700'}`}>{event.title}</h4>
                        </div>
                        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                      </div>
                      
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isExpanded ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden">
                          <p className="text-slate-600 leading-relaxed text-lg">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Videos & Audios */}
        {(videos.length > 0 || audios.length > 0) && (
          <div className="grid grid-cols-1 gap-12 mb-12 animate-slide-up">
            {videos.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600"><Video size={24} /></div>
                   Vídeos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map(vid => (
                    <div key={vid.id} className="bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 group">
                      <video 
                        src={vid.previewUrl} 
                        controls 
                        className="w-full aspect-video object-contain bg-black"
                      />
                      <div className="p-4 bg-white">
                        <p className="text-sm font-medium text-slate-700 truncate capitalize">
                           {vid.id.substring(0, 8)}... (Video)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audios.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Mic size={24} /></div>
                  Áudios
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {audios.map(aud => (
                    <div key={aud.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shadow-inner">
                         <Music size={20} />
                      </div>
                      <div className="flex-1">
                        <audio 
                          src={aud.previewUrl} 
                          controls 
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Ampliada" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default MemorialViewPage;
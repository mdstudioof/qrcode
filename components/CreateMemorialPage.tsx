import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Camera,
  ArrowLeft,
  Save,
  CreditCard,
  ExternalLink,
  Globe,
  Lock,
  X,
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { MemorialFormData, MediaItem, TimelineEvent } from '../types';
import { generateBiography } from '../services/geminiService';
import { createMemorial, getMemorialFull, updateMemorial } from '../services/memorialService';
import { useAuth } from '../context/AuthContext';

interface CreateMemorialPageProps {
  onCancel: () => void;
  memorialId?: string | null;
}

const CreateMemorialPage: React.FC<CreateMemorialPageProps> = ({ onCancel, memorialId }) => {
  const { user } = useAuth();
  const [view, setView] = useState<'edit' | 'review'>('edit');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLinkOpened, setPaymentLinkOpened] = useState(false);
  
  // File Objects for Cover/Profile
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Track deleted items for Edit mode
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);

  // Timeline Temp State
  const [tempTimeline, setTempTimeline] = useState({
    year: '',
    title: '',
    description: ''
  });

  // Form State
  const [formData, setFormData] = useState<MemorialFormData>({
    name: '',
    relationship: '',
    birthDate: '',
    deathDate: '',
    biography: '',
    isPublic: false,
    memories: '',
    timeline: [],
    coverImage: null,
    profileImage: null,
    gallery: [],
    videos: [],
    audios: []
  });

  // Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // --- Effect: Load Data if Editing ---
  useEffect(() => {
    if (memorialId) {
      const loadData = async () => {
        setIsLoadingData(true);
        const { memorial, timeline, media, error } = await getMemorialFull(memorialId);
        
        if (error || !memorial) {
          alert("Erro ao carregar memorial para edição.");
          onCancel();
          return;
        }

        // Map DB data to FormData
        const galleryItems: MediaItem[] = [];
        const videoItems: MediaItem[] = [];
        const audioItems: MediaItem[] = [];

        media.forEach((m: any) => {
          const item: MediaItem = {
            id: m.id,
            type: m.type,
            previewUrl: m.url,
            isExisting: true
          };
          if (m.type === 'image') galleryItems.push(item);
          else if (m.type === 'video') videoItems.push(item);
          else if (m.type === 'audio') audioItems.push(item);
        });

        setFormData({
          name: memorial.name,
          relationship: memorial.relationship,
          birth_date: memorial.birth_date || '',
          death_date: memorial.death_date || '',
          biography: memorial.biography || '',
          isPublic: memorial.is_public,
          memories: '', 
          timeline: timeline.map((t: any) => ({
             id: t.id,
             year: t.year,
             title: t.title,
             description: t.description
          })),
          coverImage: memorial.cover_image_url,
          profileImage: memorial.profile_image_url,
          gallery: galleryItems,
          videos: videoItems,
          audios: audioItems
        } as any); // Type assertion needed due to field naming differences in DB vs Form

        setIsLoadingData(false);
      };
      loadData();
    }
  }, [memorialId]);


  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'profile' | 'gallery' | 'video' | 'audio') => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];

      if (type === 'cover' || type === 'profile') {
        const file = files[0];
        const previewUrl = URL.createObjectURL(file);
        
        if (type === 'cover') setCoverFile(file);
        else setProfileFile(file);

        setFormData(prev => ({
          ...prev,
          [type === 'cover' ? 'coverImage' : 'profileImage']: previewUrl
        }));
      } else {
        const newMediaItems: MediaItem[] = files.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
          type: type === 'gallery' ? 'image' : type === 'video' ? 'video' : 'audio',
          isExisting: false
        }));

        setFormData(prev => ({
          ...prev,
          [type === 'gallery' ? 'gallery' : type === 'video' ? 'videos' : 'audios']: [
            ...prev[type === 'gallery' ? 'gallery' : type === 'video' ? 'videos' : 'audios'],
            ...newMediaItems
          ]
        }));
      }
    }
  };

  const removeMediaItem = (id: string, type: 'gallery' | 'video' | 'audio') => {
    // Check if it's an existing item (from DB) to track for deletion
    const list = formData[type === 'gallery' ? 'gallery' : type === 'video' ? 'videos' : 'audios'];
    const itemToRemove = list.find(i => i.id === id);

    if (itemToRemove && itemToRemove.isExisting) {
      setDeletedMediaIds(prev => [...prev, id]);
    }

    setFormData(prev => ({
      ...prev,
      [type === 'gallery' ? 'gallery' : type === 'video' ? 'videos' : 'audios']: prev[type === 'gallery' ? 'gallery' : type === 'video' ? 'videos' : 'audios'].filter(item => item.id !== id)
    }));
  };

  // Timeline Handlers
  const handleAddTimelineEvent = () => {
    if (!tempTimeline.year || !tempTimeline.title) return;

    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      year: tempTimeline.year,
      title: tempTimeline.title,
      description: tempTimeline.description
    };

    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, newEvent].sort((a, b) => parseInt(a.year) - parseInt(b.year))
    }));

    setTempTimeline({ year: '', title: '', description: '' });
  };

  const removeTimelineEvent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter(t => t.id !== id)
    }));
  };

  // AI Generation
  const handleGenerateBio = async () => {
    if (!formData.name) return;
    setIsGeneratingAi(true);
    
    const serviceData = {
      name: formData.name,
      relationship: "Entes queridos",
      dates: `${formData.birthDate} - ${formData.deathDate}`,
      memories: formData.memories || formData.biography
    };

    const bio = await generateBiography(serviceData);
    setFormData(prev => ({ ...prev, biography: bio }));
    setIsGeneratingAi(false);
  };

  // Initial Click on "Save"
  const handleSaveClick = () => {
    if (!user) {
      alert("Você precisa estar logado para continuar.");
      return;
    }

    if (memorialId) {
      // If editing, skip payment modal
      finalizeSave();
    } else {
      // If creating, show payment modal
      setShowPaymentModal(true);
    }
  };

  const handleOpenPayment = () => {
    const paymentUrl = "https://pay.cakto.com.br/39p2jpp_772823";
    window.open(paymentUrl, '_blank');
    setPaymentLinkOpened(true);
  };

  // Actual Save Logic (called after payment or if editing)
  const finalizeSave = async () => {
    if (!user) return;

    setIsSaving(true);
    
    try {
      let result;
      if (memorialId) {
        // Update Mode
        result = await updateMemorial(
          memorialId, 
          user.id, 
          formData, 
          coverFile, 
          profileFile, 
          deletedMediaIds
        );
      } else {
        // Create Mode
        result = await createMemorial(formData, user.id, coverFile, profileFile);
      }
      
      if (!result.success) {
        throw new Error("Erro ao salvar dados do memorial.");
      }

      setShowPaymentModal(false);
      
      if (memorialId) {
        alert("Memorial atualizado com sucesso!");
      } else {
        alert("Memorial criado com sucesso! Ele ficará aguardando aprovação do administrador para se tornar público.");
      }
      
      onCancel(); // Go back to dashboard

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  // --- REVIEW VIEW ---
  if (view === 'review') {
    return (
      <div className="min-h-screen bg-white animate-fade-in pb-24">
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-slide-up">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Finalizar Memorial</h3>
                <p className="text-slate-500 mt-2">
                  Para eternizar este memorial, é necessário realizar o pagamento da taxa única.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleOpenPayment}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-200"
                >
                  <ExternalLink size={20} />
                  Ir para Pagamento (Cakto)
                </button>
                
                {paymentLinkOpened && (
                  <div className="animate-fade-in pt-2">
                    <p className="text-sm text-center text-slate-500 mb-3">
                      Já realizou o pagamento na nova aba?
                    </p>
                    <button 
                      onClick={finalizeSave}
                      disabled={isSaving}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                      Confirmar Pagamento e Salvar
                    </button>
                  </div>
                )}

                {!paymentLinkOpened && (
                  <p className="text-xs text-center text-slate-400 mt-4">
                    Após clicar em pagar, o botão de confirmação aparecerá aqui.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <button onClick={() => setView('edit')} className="flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium transition-colors">
            <ArrowLeft size={20} />
            Voltar e Editar
          </button>
          <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full">
            Pré-visualização
          </div>
        </div>

        {/* Content (Preview) */}
        <div className="relative">
          <div className="h-64 md:h-80 w-full bg-slate-200 relative overflow-hidden">
             {formData.coverImage ? (
                <img src={formData.coverImage} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200"></div>
              )}
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-24 z-10">
             <div className="text-center mb-10">
               <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 mx-auto">
                  {formData.profileImage && <img src={formData.profileImage} alt="Perfil" className="w-full h-full object-cover" />}
               </div>
               <h1 className="text-4xl font-bold text-slate-900 mt-4">{formData.name}</h1>
               {/* Visibility Badge in Preview */}
               <div className="flex justify-center mt-3">
                 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${formData.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                   {formData.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                   {formData.isPublic ? 'Público' : 'Privado'}
                 </div>
               </div>
             </div>
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-slate-600 whitespace-pre-wrap">{formData.biography}</p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40">
           <div className="max-w-4xl mx-auto flex justify-end gap-4">
              <button onClick={() => setView('edit')} className="px-6 py-2 rounded-full bg-slate-100 font-semibold">Editar</button>
              <button onClick={handleSaveClick} disabled={isSaving} className="px-6 py-2 rounded-full bg-brand-600 text-white font-bold flex items-center gap-2">
                 {isSaving ? <Loader2 className="animate-spin" /> : (memorialId ? <Save size={18} /> : <CreditCard size={18} />)}
                 {memorialId ? 'Salvar Alterações' : 'Ir para Pagamento e Salvar'}
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- EDIT VIEW (Main Form) ---

  // Common styling classes for inputs
  const labelClass = "block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide";
  const inputClass = "w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium";

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-fade-in">
      {/* Hidden File Inputs */}
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'cover')} />
      <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'profile')} />
      <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileSelect(e, 'gallery')} />
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" multiple onChange={(e) => handleFileSelect(e, 'video')} />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" multiple onChange={(e) => handleFileSelect(e, 'audio')} />

      {/* Payment Modal (Also available in Edit View if user clicks main save button and it's a new memorial) */}
      {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-slide-up">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Finalizar Memorial</h3>
                <p className="text-slate-500 mt-2">
                  Para eternizar este memorial, é necessário realizar o pagamento da taxa única.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleOpenPayment}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-200"
                >
                  <ExternalLink size={20} />
                  Ir para Pagamento (Cakto)
                </button>
                
                {paymentLinkOpened && (
                  <div className="animate-fade-in pt-2">
                    <p className="text-sm text-center text-slate-500 mb-3">
                      Já realizou o pagamento na nova aba?
                    </p>
                    <button 
                      onClick={finalizeSave}
                      disabled={isSaving}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                      Confirmar Pagamento e Salvar
                    </button>
                  </div>
                )}

                {!paymentLinkOpened && (
                  <p className="text-xs text-center text-slate-400 mt-4">
                    Após clicar em pagar, o botão de confirmação aparecerá aqui.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-6 mb-8 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{memorialId ? 'Editar Memorial' : 'Criar Memorial'}</h1>
            <p className="text-slate-500 text-sm font-medium">Preencha as informações para criar um memorial eterno</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Card 1: Identity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div 
            onClick={() => coverInputRef.current?.click()}
            className="h-56 bg-slate-100 relative group cursor-pointer hover:bg-slate-200 transition-colors border-b border-slate-200"
          >
             {formData.coverImage ? (
              <img src={formData.coverImage} alt="Capa" className="w-full h-full object-cover" />
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                 <Camera size={32} /> 
                 <span className="font-semibold">Adicionar Foto de Capa</span>
               </div>
             )}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>
          <div className="px-8 pb-8 relative">
            <div 
              onClick={() => profileInputRef.current?.click()}
              className="-mt-20 w-40 h-40 rounded-full border-4 border-white bg-slate-50 shadow-lg relative group cursor-pointer overflow-hidden z-10 mx-auto md:mx-0"
            >
               {formData.profileImage ? (
                <img src={formData.profileImage} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
               )}
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-bold text-xs uppercase tracking-widest">
                 Alterar
               </div>
            </div>
            <p className="text-center md:text-left mt-2 text-sm text-slate-500 font-medium">Clique na foto para alterar</p>
          </div>
        </div>

        {/* Card 2: Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
             <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
               <Sparkles size={20} />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Informações Básicas</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
             {/* VISIBILITY TOGGLE */}
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-full ${formData.isPublic ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                   {formData.isPublic ? <Globe size={24} /> : <Lock size={24} />}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800">Visibilidade do Memorial</h3>
                   <p className="text-sm text-slate-500">
                     {formData.isPublic 
                       ? "Público: Aparece na página Explorar e pode ser compartilhado." 
                       : "Privado: Apenas você pode ver e editar."}
                   </p>
                 </div>
               </div>
               <button 
                 onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                 className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                   formData.isPublic 
                   ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200' 
                   : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                 }`}
               >
                 {formData.isPublic ? 'Tornar Privado' : 'Tornar Público'}
               </button>
             </div>

             <div>
                <label className={labelClass}>Nome Completo do Ente Querido</label>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Maria da Silva" className={inputClass} />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className={labelClass}>Data de Nascimento</label>
                   <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                   <label className={labelClass}>Data de Falecimento</label>
                   <input type="date" name="deathDate" value={formData.deathDate} onChange={handleInputChange} className={inputClass} />
                </div>
             </div>

             <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Biografia</label>
                 <button onClick={handleGenerateBio} disabled={isGeneratingAi} className="text-brand-600 text-xs font-bold flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded-md transition-colors">
                    <Sparkles size={14} /> GERAR COM IA
                 </button>
               </div>
               <textarea name="biography" value={formData.biography} onChange={handleInputChange} rows={6} placeholder="Conte a história de vida..." className={inputClass} />
             </div>
          </div>
        </div>

        {/* Card 3: Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
             <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
               <Calendar size={20} />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Linha do Tempo</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase">Adicionar Novo Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                 <div className="md:col-span-1">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Ano</label>
                   <input 
                    type="text" 
                    placeholder="1990" 
                    value={tempTimeline.year}
                    onChange={(e) => setTempTimeline({...tempTimeline, year: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none" 
                   />
                 </div>
                 <div className="md:col-span-3">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Título do Evento</label>
                   <input 
                    type="text" 
                    placeholder="Casamento, Formatura..." 
                    value={tempTimeline.title}
                    onChange={(e) => setTempTimeline({...tempTimeline, title: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none" 
                   />
                 </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
                <textarea 
                  placeholder="Detalhes sobre este momento..." 
                  value={tempTimeline.description}
                  onChange={(e) => setTempTimeline({...tempTimeline, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none h-20 resize-none" 
                />
              </div>
              <button 
                onClick={handleAddTimelineEvent}
                disabled={!tempTimeline.year || !tempTimeline.title}
                className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
              >
                Adicionar Evento
              </button>
            </div>

            {/* List of Events */}
            {formData.timeline.length > 0 && (
              <div className="border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                 {formData.timeline.map((event) => (
                   <div key={event.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white ring-2 ring-slate-100"></div>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                         <div className="flex justify-between items-start">
                           <div>
                             <span className="text-brand-600 font-bold text-sm">{event.year}</span>
                             <h4 className="font-bold text-slate-900">{event.title}</h4>
                             <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                           </div>
                           <button 
                            onClick={() => removeTimelineEvent(event.id)}
                            className="text-slate-300 hover:text-red-500 p-1"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Media */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
               <ImageIcon size={20} />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Galeria de Mídia</h2>
          </div>
           
           {/* Gallery */}
           <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex justify-between">
                GALERIA DE FOTOS
                <span className="text-slate-400 font-normal text-xs">{formData.gallery.length} fotos</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {formData.gallery.map(img => (
                   <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-200">
                      <img src={img.previewUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                      <button onClick={() => removeMediaItem(img.id, 'gallery')} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md transform scale-90 group-hover:scale-100">
                        <Trash2 size={14} />
                      </button>
                   </div>
                 ))}
                 <button onClick={() => galleryInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50/50 transition-all gap-2 group">
                    <div className="bg-slate-100 group-hover:bg-brand-100 p-3 rounded-full transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="text-xs font-bold">ADICIONAR</span>
                 </button>
              </div>
           </div>

           {/* Videos/Audios simplified */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">VÍDEOS</h3>
                <button onClick={() => videoInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-brand-400 hover:text-brand-600 transition-all mb-3 font-medium text-slate-600">
                   <Video size={20} /> Adicionar Vídeo
                </button>
                <div className="space-y-2">
                  {formData.videos.map(v => (
                     <div key={v.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg group">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <Video size={16} className="text-slate-400 shrink-0" />
                           <span className="text-sm font-medium text-slate-700 truncate">{v.file?.name || "Vídeo carregado"}</span>
                        </div>
                        <button onClick={() => removeMediaItem(v.id, 'video')} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                     </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">ÁUDIOS</h3>
                <button onClick={() => audioInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-brand-400 hover:text-brand-600 transition-all mb-3 font-medium text-slate-600">
                   <Mic size={20} /> Adicionar Áudio
                </button>
                <div className="space-y-2">
                  {formData.audios.map(a => (
                     <div key={a.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg group">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <Mic size={16} className="text-slate-400 shrink-0" />
                           <span className="text-sm font-medium text-slate-700 truncate">{a.file?.name || "Áudio carregado"}</span>
                        </div>
                        <button onClick={() => removeMediaItem(a.id, 'audio')} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                     </div>
                  ))}
                </div>
              </div>
           </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={onCancel} className="text-slate-500 font-bold hover:text-slate-800 px-4 py-2">CANCELAR</button>
          
          <div className="flex gap-4 w-full md:w-auto">
             <button 
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex-1 md:flex-none px-8 py-3.5 bg-brand-600 text-white rounded-full font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:shadow-brand-300 flex items-center justify-center gap-2"
             >
               {isSaving ? <Loader2 className="animate-spin" /> : (memorialId ? <Save size={20} /> : <CreditCard size={20} />)}
               {memorialId ? 'Salvar Alterações' : 'Ir para Pagamento e Salvar'}
             </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreateMemorialPage;
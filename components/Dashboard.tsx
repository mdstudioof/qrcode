import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getUserMemorials, 
  deleteMemorial, 
  getUserProfile, 
  updateUserProfileImage, 
  deleteUserAccount 
} from '../services/memorialService';
import { Memorial } from '../types';
import { 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  Lock, 
  Camera, 
  Edit2,
  User,
  Loader2,
  Trash2,
  Clock,
  AlertOctagon,
  X,
  AlertTriangle,
  QrCode,
  Download,
  Share2
} from 'lucide-react';

interface DashboardProps {
  onCreateClick: () => void;
  onEditMemorial: (id: string) => void;
  onViewMemorial: (id: string) => void;
  onDeleteAccountSuccess?: () => void; // Nova prop para redirecionamento
}

// Interface para o Modal de Confirmação
interface ConfirmModalState {
  isOpen: boolean;
  type: 'delete_memorial' | 'delete_account';
  title: string;
  message: string;
  itemId?: string; // ID do memorial (se for exclusão de memorial)
  confirmText: string;
  isDestructive: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onCreateClick, 
  onEditMemorial, 
  onViewMemorial,
  onDeleteAccountSuccess 
}) => {
  const { user, logout } = useAuth();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estado para o Modal de Confirmação
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  // QR Code Modal State
  const [selectedQrMemorial, setSelectedQrMemorial] = useState<Memorial | null>(null);

  // Profile State
  const [userCover, setUserCover] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        
        // 1. Fetch Memorials
        const { data: memorialsData } = await getUserMemorials(user.id);
        if (memorialsData) {
          setMemorials(memorialsData);
        }

        // 2. Fetch Extended Profile Data (Persistent Images)
        const { data: profileData } = await getUserProfile(user.id);
        if (profileData) {
          if (profileData.avatar_url) setUserAvatar(profileData.avatar_url);
          else setUserAvatar(user.avatar); // Fallback to AuthContext avatar
          
          if (profileData.cover_url) setUserCover(profileData.cover_url);
        } else {
           setUserAvatar(user.avatar);
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    if (e.target.files && e.target.files[0] && user) {
      setIsUploading(true);
      const file = e.target.files[0];
      
      // Optimistic Update
      const previewUrl = URL.createObjectURL(file);
      if (type === 'cover') setUserCover(previewUrl);
      else setUserAvatar(previewUrl);

      // Upload and Persist
      const result = await updateUserProfileImage(user.id, file, type);
      
      if (!result.success) {
        alert("Erro ao salvar a imagem. Tente novamente.");
      }
      setIsUploading(false);
    }
  };

  // --- ABERTURA DOS MODAIS ---

  const openDeleteMemorialModal = (e: React.MouseEvent, memorialId: string, memorialName: string) => {
    e.stopPropagation(); // Impede cliques acidentais no card
    setConfirmModal({
      isOpen: true,
      type: 'delete_memorial',
      title: 'Excluir Memorial?',
      message: `Você tem certeza que deseja apagar o memorial de "${memorialName}"? Esta ação é irreversível e apagará todas as fotos e mensagens.`,
      itemId: memorialId,
      confirmText: 'Sim, Apagar Memorial',
      isDestructive: true
    });
  };

  const openDeleteAccountModal = () => {
    setConfirmModal({
      isOpen: true,
      type: 'delete_account',
      title: 'Excluir Conta Permanentemente?',
      message: 'ATENÇÃO: Isso excluirá sua conta, todos os seus memoriais e todos os dados associados. Não há como desfazer.',
      confirmText: 'Entendo, Excluir Minha Conta',
      isDestructive: true
    });
  };

  const openQrModal = (e: React.MouseEvent, memorial: Memorial) => {
    e.stopPropagation();
    setSelectedQrMemorial(memorial);
  };

  // --- EXECUÇÃO DAS AÇÕES ---

  const handleConfirmAction = async () => {
    if (!confirmModal) return;

    setIsProcessingAction(true);

    try {
      if (confirmModal.type === 'delete_memorial' && confirmModal.itemId) {
        const { success, error } = await deleteMemorial(confirmModal.itemId);
        if (success) {
          setMemorials(prev => prev.filter(m => m.id !== confirmModal.itemId));
          setConfirmModal(null); // Fecha modal apenas se sucesso
        } else {
          alert(`Erro ao apagar: ${error?.message || "Tente novamente."}`);
        }
      } 
      else if (confirmModal.type === 'delete_account') {
        // 1. Tenta apagar a conta no Supabase (RPC)
        const { success, error } = await deleteUserAccount();
        
        if (success) {
          // 2. Força logout imediato (limpa sessão local)
          await logout();
          
          setConfirmModal(null);
          
          // 3. Redireciona para a home (usando a prop passada pelo App.tsx)
          if (onDeleteAccountSuccess) {
            onDeleteAccountSuccess();
          }
        } else {
          alert(`Erro ao excluir conta: ${error?.message || "Tente novamente."}`);
        }
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro inesperado.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDownloadQr = async () => {
    if (!selectedQrMemorial) return;
    
    // Construct the URL exactly as shown in the image src
    const targetUrl = `${window.location.origin}?view=memorial&id=${selectedQrMemorial.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(targetUrl)}&margin=10`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${selectedQrMemorial.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Erro ao baixar o QR Code. Tente novamente.");
    }
  };

  const handleShare = async (e: React.MouseEvent, memorial: Memorial) => {
    e.stopPropagation();
    
    // Constrói a URL que redireciona para a view_memorial
    const url = `${window.location.origin}?view=memorial&id=${memorial.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Memorial de ${memorial.name}`,
          text: `Confira o memorial eterno de ${memorial.name}.`,
          url: url
        });
      } catch (err) {
        // Usuário cancelou ou erro na API
        console.log('Compartilhamento cancelado ou falhou', err);
      }
    } else {
      // Fallback para área de transferência
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!");
      } catch (err) {
        alert("Não foi possível copiar o link.");
      }
    }
  };

  if (loading && !memorials.length && !userCover) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in relative">
      <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" accept="image/*" />
      <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isProcessingAction && setConfirmModal(null)}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-slide-up border border-slate-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{confirmModal.title}</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button 
                onClick={() => setConfirmModal(null)}
                disabled={isProcessingAction}
                className="px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isProcessingAction ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                {isProcessingAction ? 'Processando...' : confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- QR CODE MODAL --- */}
      {selectedQrMemorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedQrMemorial(null)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 animate-slide-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-brand-600 p-6 text-center relative">
               <button 
                  onClick={() => setSelectedQrMemorial(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
               >
                 <X size={20} />
               </button>
               <h3 className="text-xl font-bold text-white">QR Code Eterno</h3>
               <p className="text-brand-100 text-sm mt-1">Escaneie para visitar o memorial</p>
            </div>

            {/* QR Content */}
            <div className="p-8 flex flex-col items-center">
               <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-6">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}?view=memorial&id=${selectedQrMemorial.id}`)}`}
                   alt="QR Code" 
                   className="w-48 h-48 object-contain"
                 />
               </div>
               
               <p className="text-center text-slate-900 font-bold text-lg mb-1">{selectedQrMemorial.name}</p>
               <p className="text-center text-slate-500 text-sm mb-6">ID: {selectedQrMemorial.id.substring(0, 8)}...</p>

               <button 
                onClick={handleDownloadQr}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
               >
                 <Download size={20} />
                 Baixar para Imprimir
               </button>
               <p className="text-xs text-center text-slate-400 mt-4 px-4">
                 Ideal para imprimir em adesivos, placas de metal ou cerâmica para lápides.
               </p>
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------- */}


      {/* HEADER / PROFILE SECTION */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-slate-200 group">
          {userCover ? (
            <img src={userCover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-600 to-purple-600 flex items-center justify-center">
               <div className="text-white/20 font-bold text-4xl">EternizeQR</div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

          <button 
            onClick={() => coverInputRef.current?.click()} 
            disabled={isUploading}
            className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />} 
            Alterar Capa
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-6">
          <div className="flex flex-col md:flex-row items-end -mt-16 md:-mt-12 gap-6">
            
            {/* Avatar Image */}
            <div className="relative group cursor-pointer z-20">
              <div 
                onClick={() => avatarInputRef.current?.click()} 
                className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden relative"
              >
                <img src={userAvatar || user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   {isUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
                </div>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 mb-2 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
              <p className="text-slate-500 font-medium">{user?.email}</p>
            </div>

            {/* Actions */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 mb-2">
              <button onClick={onCreateClick} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                <Plus size={18} /> Novo Memorial
              </button>
              
              <button 
                onClick={openDeleteAccountModal}
                className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
                title="Excluir conta permanentemente"
              >
                <AlertOctagon size={18} /> Apagar Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Meus Memoriais <span className="bg-brand-100 text-brand-700 text-sm py-0.5 px-3 rounded-full font-bold">{memorials.length}</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <input type="text" placeholder="Buscar nos meus memoriais..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-200 outline-none shadow-sm" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {memorials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-500"><Plus size={40} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Crie seu primeiro memorial</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Eternize as memórias de quem você ama de forma simples e emocionante.</p>
            <button onClick={onCreateClick} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-brand-200 transition-all hover:scale-105">
              Começar Agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {memorials.map((memorial) => {
              const isApproved = memorial.status === true;

              return (
                <div key={memorial.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full relative">
                  
                  {/* Status Banner */}
                  {!isApproved && (
                     <div className="absolute top-0 left-0 right-0 z-20 text-center py-1.5 text-xs font-bold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-sm">
                        Aguardando Pagamento
                     </div>
                  )}

                  {/* Cover */}
                  <div className="h-48 bg-slate-200 relative overflow-hidden mt-0">
                    {memorial.cover_image_url ? (
                      <img src={memorial.cover_image_url} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>}
                    
                    {/* Privacy Badge */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1 mt-6"> 
                      <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                        {memorial.is_public ? <><Eye size={12} className="text-emerald-600" /> Público</> : <><Lock size={12} className="text-slate-500" /> Privado</>}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-0 flex-1 flex flex-col relative">
                    
                    {/* Profile Image */}
                    <div className="flex justify-center -mt-12 mb-4 relative z-10">
                       <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md">
                         {memorial.profile_image_url ? <img src={memorial.profile_image_url} alt={memorial.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100"><User size={32} /></div>}
                       </div>
                    </div>
                    
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{memorial.name}</h3>
                        <p className="text-sm text-brand-600 font-bold uppercase tracking-wide">{memorial.relationship}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-5 bg-slate-50 py-1.5 px-3 rounded-lg w-fit mx-auto">
                      <Calendar size={14} />
                      <span>{memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : '?'} - {memorial.death_date ? new Date(memorial.death_date).getFullYear() : '?'}</span>
                    </div>
                    
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 text-center italic px-2">
                       "{memorial.biography || "Sem biografia..."}"
                    </p>

                    <div className="flex gap-2 mt-auto w-full pt-4 border-t border-slate-50">
                      <button 
                          onClick={(e) => openDeleteMemorialModal(e, memorial.id, memorial.name)}
                          className="p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center"
                          title="Apagar Memorial Permanentemente"
                      >
                         <Trash2 size={18} />
                      </button>
                      
                      <button 
                          onClick={(e) => openQrModal(e, memorial)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center justify-center"
                          title="Gerar QR Code"
                      >
                         <QrCode size={18} />
                      </button>

                      <button 
                          onClick={(e) => handleShare(e, memorial)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-brand-600 transition-colors flex items-center justify-center"
                          title="Compartilhar Memorial"
                      >
                         <Share2 size={18} />
                      </button>

                      <button 
                          onClick={() => onEditMemorial(memorial.id)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center justify-center"
                          title="Editar Memorial"
                      >
                          <Edit2 size={18} />
                      </button>
                      
                      <button 
                          onClick={() => onViewMemorial(memorial.id)}
                          disabled={!isApproved}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md flex items-center justify-center gap-1.5 ${
                            isApproved 
                              ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200 hover:-translate-y-0.5' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                          title={!isApproved ? "Aguardando confirmação do pagamento" : ""}
                      >
                          {isApproved ? 'Visualizar' : <><Clock size={16} /> Pendente</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Create Card (Grid Item) */}
            <button onClick={onCreateClick} className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all flex flex-col items-center justify-center h-full min-h-[400px] group cursor-pointer relative overflow-hidden">
               <div className="w-32 h-32 bg-brand-100 rounded-full blur-3xl absolute opacity-0 group-hover:opacity-50 transition-opacity"></div>
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-brand-500 group-hover:scale-110 transition-all mb-4 relative z-10"><Plus size={32} /></div>
               <span className="text-slate-500 font-bold group-hover:text-brand-700 relative z-10">Criar Novo Memorial</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
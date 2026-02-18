import React, { useState } from 'react';
import { X, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { generateBiography, BiographyParams } from '../services/geminiService';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateMemorialModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BiographyParams>({
    name: '',
    relationship: '',
    dates: '',
    memories: ''
  });
  const [generatedBio, setGeneratedBio] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.memories) return;
    setIsLoading(true);
    const bio = await generateBiography(formData);
    setGeneratedBio(bio);
    setIsLoading(false);
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-brand-50 p-6 flex justify-between items-center border-b border-brand-100">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
               <Sparkles className="text-brand-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Criar Novo Memorial</h3>
              <p className="text-sm text-brand-700">Com Inteligência Artificial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Ente Querido</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sua relação</label>
                  <input
                    type="text"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
                    placeholder="Ex: Mãe, Avô, Amigo"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Datas (Nascimento - Falecimento)</label>
                <input
                  type="text"
                  name="dates"
                  value={formData.dates}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
                  placeholder="Ex: 1950 - 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Memórias e Características Principais</label>
                <textarea
                  name="memories"
                  value={formData.memories}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none resize-none"
                  placeholder="Conte um pouco sobre a pessoa, do que ela gostava, frases marcantes..."
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">A IA usará isso para escrever uma biografia emocionante.</p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!formData.name || !formData.memories || isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  !formData.name || !formData.memories || isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Escrevendo homenagem...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Gerar Biografia com IA
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-brand-50 to-white p-6 rounded-2xl border border-brand-100">
                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-3">Biografia Gerada</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {generatedBio}
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Voltar e Editar
                </button>
                <button className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center justify-center gap-2">
                  Continuar Cadastro
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMemorialModal;
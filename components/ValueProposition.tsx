import React from 'react';
import { Check, Globe, Infinity, ShieldCheck, Sparkles } from 'lucide-react';

interface ValuePropositionProps {
  onStartCreate: () => void;
}

const ValueProposition: React.FC<ValuePropositionProps> = ({ onStartCreate }) => {
  return (
    <section className="relative py-24 bg-slate-900 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/50 border border-brand-700/50 text-brand-300 mb-6 backdrop-blur-sm">
              <Globe size={16} />
              <span className="text-sm font-semibold tracking-wide">Acessível em qualquer lugar do mundo</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Uma homenagem eterna, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                ao alcance de todos.
              </span>
            </h2>
            
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Crie um espaço sagrado digital que preserva a história do seu ente querido para sempre. 
              Sem mensalidades, sem custos escondidos. Apenas uma taxa única para garantir que as memórias nunca se apaguem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
              {[
                "Acesso 24 horas, 7 dias por semana",
                "Sem mensalidades (Taxa Única)",
                "Página segura e vitalícia",
                "QR Code gerado instantaneamente",
                "Galeria de fotos ilimitada",
                "Biografia escrita por Inteligência Artificial"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card (Price) */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-600 rounded-3xl blur-xl opacity-30 transform translate-y-4"></div>
            <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 text-center">
              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
                <Sparkles size={16} className="fill-white" />
                OFERTA ESPECIAL
              </div>

              <div className="mb-2 text-slate-500 font-semibold uppercase tracking-wider text-sm mt-4">
                Pagamento Único
              </div>
              
              <div className="flex items-end justify-center gap-1 mb-6 text-slate-900">
                <span className="text-3xl font-bold align-top mt-2">R$</span>
                <span className="text-7xl font-extrabold tracking-tighter">29,90</span>
              </div>

              <p className="text-slate-500 text-sm mb-8 px-4 leading-snug">
                Garanta a preservação da história de quem você ama com um pagamento único e vitalício.
              </p>

              <button 
                onClick={onStartCreate}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Infinity size={20} />
                Criar Memorial Eterno
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} />
                <span>Pagamento seguro via Cakto</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
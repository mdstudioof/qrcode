import React from 'react';
import { QrCode, Cloud, Image, Video, Shield, Heart } from 'lucide-react';
import { FeatureItem } from '../types';

const features: FeatureItem[] = [
  {
    id: '1',
    title: 'Pronto para Lápides',
    description: 'O QR Code ideal para ser fixado em túmulos ou urnas. Conecte o mundo físico às memórias digitais instantaneamente.',
    icon: QrCode
  },
  {
    id: '2',
    title: 'Armazenamento Ilimitado',
    description: 'Guarde fotos, vídeos e organize a história de vida em uma linha do tempo com os acontecimentos mais importantes.',
    icon: Cloud
  },
  {
    id: '3',
    title: 'Galeria de Fotos',
    description: 'Organize e compartilhe momentos especiais em uma galeria linda.',
    icon: Image
  },
  {
    id: '4',
    title: 'Vídeos e Áudios',
    description: 'Preserve vozes e momentos em movimento para sempre.',
    icon: Video
  },
  {
    id: '5',
    title: 'Seguro e Privado',
    description: 'Controle total sobre quem pode visualizar o memorial.',
    icon: Shield
  },
  {
    id: '6',
    title: 'Memorial Eterno',
    description: 'Um lugar especial que permanece para sempre acessível.',
    icon: Heart
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Background Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Recursos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Especiais</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tudo que você precisa para criar um memorial digital completo, emocionante e duradouro.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:border-brand-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-900/5 overflow-hidden"
            >
              {/* Hover Light Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Animated Blob behind Icon */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-200/60 transition-colors duration-500"></div>

              <div className="relative z-10">
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-all duration-500">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Line Indicator */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-brand-500 to-purple-500 group-hover:w-full transition-all duration-700 ease-out"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
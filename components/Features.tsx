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
    description: 'Guarde fotos, vídeos e histórias sem limite de espaço.',
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
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Recursos <span className="text-brand-600">Especiais</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tudo que você precisa para criar um memorial digital completo e emocionante.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-brand-100 hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
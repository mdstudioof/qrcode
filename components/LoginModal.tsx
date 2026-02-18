import React, { useState } from 'react';
import { X, Loader2, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithEmail, registerWithEmail, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;
    
    if (isSignUp) {
      if (!fullName) return; // Simple validation
      result = await registerWithEmail(email, password, fullName);
    } else {
      result = await loginWithEmail(email, password);
    }

    if (result && result.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col">
        
        <div className="p-8">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-600 shadow-sm border border-brand-100">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? 'Criar sua conta' : 'Acesse o EternizeQR'}
            </h2>
            <p className="text-slate-500 mt-2">
              {isSignUp ? 'Comece a criar memoriais eternos hoje.' : 'Entre para gerenciar suas homenagens.'}
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left animate-fade-in shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-1.5 rounded-full text-red-600 mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <div className="text-sm text-red-700 w-full">
                    <p className="font-bold text-red-800 mb-1">Atenção</p>
                    <p className="mb-0 text-xs leading-relaxed opacity-90">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Seu nome</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors pointer-events-none">
                      <UserIcon size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Silva"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 ml-1">E-mail</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors pointer-events-none">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-semibold text-slate-700">Senha</label>
                  {!isSignUp && (
                    <button type="button" className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline">
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors pointer-events-none">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:translate-y-0 disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{isSignUp ? 'Criar Conta Grátis' : 'Entrar na Conta'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            
            {/* Toggle Login/SignUp */}
            <div className="text-center pt-2">
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  clearError();
                }}
                className="group text-sm text-slate-500 hover:text-brand-700 transition-colors"
              >
                {isSignUp ? (
                  <>Já tem uma conta? <span className="font-bold text-brand-600 group-hover:underline decoration-2 underline-offset-2">Fazer login</span></>
                ) : (
                  <>Não tem uma conta? <span className="font-bold text-brand-600 group-hover:underline decoration-2 underline-offset-2">Criar agora</span></>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
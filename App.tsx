import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ValueProposition from './components/ValueProposition';
import FeaturedMemorials from './components/FeaturedMemorials';
import CreateMemorialPage from './components/CreateMemorialPage';
import MemorialViewPage from './components/MemorialViewPage';
import Dashboard from './components/Dashboard';
import ExplorePage from './components/ExplorePage';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

type AppView = 'home' | 'create' | 'dashboard' | 'view_memorial' | 'edit_memorial' | 'explore' | 'admin';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedMemorialId, setSelectedMemorialId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setSelectedMemorialId(null); // Clear ID for creation
      setCurrentView('create');
      window.scrollTo(0, 0);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleEditMemorial = (id: string) => {
    setSelectedMemorialId(id);
    setCurrentView('create'); // Reuse create page for edit
    window.scrollTo(0, 0);
  };

  const handleViewMemorial = (id: string) => {
    setSelectedMemorialId(id);
    setCurrentView('view_memorial');
    window.scrollTo(0, 0);
  };

  const handleViewDemo = () => {
    // ID do memorial fictício definido em memorialService.ts
    handleViewMemorial('demo-1');
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
      window.scrollTo(0, 0);
    }
  };

  const handleExploreClick = () => {
    setCurrentView('explore');
    window.scrollTo(0, 0);
  };

  const handleLogoClick = () => {
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setCurrentView('dashboard');
    window.scrollTo(0, 0);
  };

  const handleAdminClick = () => {
    if (user?.email === 'admin@eternize.com.br') {
      setCurrentView('admin');
      window.scrollTo(0, 0);
    }
  };

  const handleLogout = () => {
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  // Special full-screen render for Admin Dashboard
  if (currentView === 'admin') {
    // Double check security on render
    if (user?.email !== 'admin@eternize.com.br') {
       setCurrentView('home');
       return null;
    }
    return (
      <AdminDashboard 
        onLogout={() => {
          logout();
          setCurrentView('home');
        }}
        onNavigateHome={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white">
      {currentView !== 'view_memorial' && (
        <Navbar 
          onOpenCreateModal={handleCreateClick} 
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenDashboard={handleDashboardClick}
          onOpenExplore={handleExploreClick}
          onLogoClick={handleLogoClick}
          onOpenAdmin={handleAdminClick} // Pass admin handler
          onLogout={handleLogout}
        />
      )}
      
      <main>
        {currentView === 'create' && (
          <CreateMemorialPage 
            onCancel={() => setCurrentView('dashboard')} 
            memorialId={selectedMemorialId}
          />
        )}

        {currentView === 'view_memorial' && selectedMemorialId && (
          <MemorialViewPage 
            memorialId={selectedMemorialId}
            onBack={() => {
                if (isAuthenticated) setCurrentView('dashboard');
                else setCurrentView('explore');
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard 
            onCreateClick={handleCreateClick} 
            onEditMemorial={handleEditMemorial}
            onViewMemorial={handleViewMemorial}
            onDeleteAccountSuccess={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {currentView === 'explore' && (
          <ExplorePage 
            onViewMemorial={handleViewMemorial}
          />
        )}

        {currentView === 'home' && (
          <>
            <Hero 
              onOpenCreateModal={handleCreateClick}
              onOpenLoginModal={() => {
                if (isAuthenticated) {
                  handleDashboardClick();
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              onViewDemo={handleViewDemo}
            />
            
            <FeaturedMemorials 
              onViewMemorial={handleViewMemorial}
              onExploreClick={handleExploreClick}
            />

            <Features />
            
            <ValueProposition onStartCreate={handleCreateClick} />
            
            <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-400 text-sm">
                  © 2024 EternoQR. Todos os direitos reservados.
                </div>
                <div className="flex gap-6">
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Termos</a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacidade</a>
                  {user?.email === 'admin@eternize.com.br' && (
                    <button onClick={handleAdminClick} className="text-slate-600 hover:text-slate-400 transition-colors text-sm font-mono">
                      Admin
                    </button>
                  )}
                </div>
              </div>
            </footer>
          </>
        )}
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
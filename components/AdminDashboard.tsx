import React, { useEffect, useState } from 'react';
import { getAllMemorialsAdmin, updateMemorialStatus } from '../services/memorialService';
import { Memorial } from '../types';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Search, 
  LayoutGrid, 
  LogOut, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  MoreVertical,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigateHome }) => {
  const { user } = useAuth();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  useEffect(() => {
    fetchMemorials();
  }, []);

  const fetchMemorials = async () => {
    setLoading(true);
    const { data } = await getAllMemorialsAdmin();
    if (data) {
      // Map undefined status to false (default off)
      const mappedData = data.map(m => ({ ...m, status: m.status === undefined ? false : m.status }));
      setMemorials(mappedData);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean | undefined) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setMemorials(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));

    const { success } = await updateMemorialStatus(id, newStatus);
    
    if (!success) {
      // Revert on error
      setMemorials(prev => prev.map(m => m.id === id ? { ...m, status: !!currentStatus } : m));
      alert("Erro ao atualizar status. Verifique sua conexão.");
    }
  };

  // Stats Calculation
  const stats = {
    total: memorials.length,
    active: memorials.filter(m => m.status).length,
    pending: memorials.filter(m => !m.status).length
  };

  // Filter Logic
  const filteredMemorials = memorials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'active') return matchesSearch && m.status;
    if (filter === 'pending') return matchesSearch && !m.status;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutGrid className="text-brand-500" /> AdminPainel
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-600/10 text-brand-400 rounded-xl font-medium border border-brand-500/20">
            <Users size={20} />
            Gestão de Memoriais
          </button>
          <button onClick={onNavigateHome} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-medium">
            <Eye size={20} />
            Ver Site
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
             <img src={user?.avatar} alt="Admin" className="w-8 h-8 rounded-full bg-slate-700" />
             <div className="overflow-hidden">
               <p className="text-sm font-medium truncate">{user?.name}</p>
               <p className="text-xs text-slate-500 truncate">Administrador</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors py-2">
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
           <h1 className="text-2xl font-bold text-slate-800 md:block hidden">Dashboard</h1>
           <div className="md:hidden font-bold text-brand-600">EternoQR Admin</div>
           
           <div className="flex items-center gap-4">
             <div className="text-sm text-slate-500 hidden sm:block">
               Última atualização: {new Date().toLocaleTimeString()}
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Total de Memoriais</p>
                <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Aprovados (Ativos)</p>
                <h3 className="text-3xl font-bold text-emerald-600">{stats.active}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Pendentes de Pagamento</p>
                <h3 className="text-3xl font-bold text-amber-500">{stats.pending}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou ID..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
               <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
               >
                 Todos
               </button>
               <button 
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'active' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
               >
                 Aprovados
               </button>
               <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
               >
                 Pendentes
               </button>
             </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Memorial</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data Criação</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status Pagamento</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Carregando dados...
                      </td>
                    </tr>
                  ) : filteredMemorials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Nenhum memorial encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredMemorials.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                               {m.profile_image_url ? <img src={m.profile_image_url} className="w-full h-full object-cover" /> : null}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{m.name}</p>
                              <p className="text-xs text-slate-500">{m.relationship}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-400" title={m.user_id}>
                          {m.user_id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            m.status 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {m.status ? 'APROVADO' : 'PENDENTE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <a 
                                href={`https://pay.cakto.com.br/39p2jpp_772823`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Ver Link de Pagamento"
                             >
                               <ArrowUpRight size={18} />
                             </a>
                             <button
                               onClick={() => handleToggleStatus(m.id, m.status)}
                               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                 m.status 
                                  ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600'
                                  : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-200'
                               }`}
                             >
                               {m.status ? (
                                 <>
                                   <ToggleRight size={16} className="text-emerald-500" /> Desativar
                                 </>
                               ) : (
                                 <>
                                   <ToggleLeft size={16} /> Aprovar
                                 </>
                               )}
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
              <span>Mostrando {filteredMemorials.length} de {stats.total} registros</span>
              <div className="flex gap-2">
                 <button className="px-3 py-1 rounded border border-slate-200 bg-white disabled:opacity-50">Anterior</button>
                 <button className="px-3 py-1 rounded border border-slate-200 bg-white disabled:opacity-50">Próximo</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { ViewType, ProfessionalProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  profile: ProfessionalProfile;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, profile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
    { id: 'clients', label: 'Prontuários', icon: '👥' },
    { id: 'evaluations', label: 'Diagnóstico Clínico', icon: '📋' },
    { id: 'training', label: 'Prescrição', icon: '🏋️' },
    { id: 'financial', label: 'Financeiro', icon: '💳' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ];

  const handleNav = (id: ViewType) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden no-print" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-[110] transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} no-print`}>
        <div className="p-8 border-b border-slate-800">
          <button 
            onClick={() => handleNav('dashboard')}
            className="text-2xl font-black tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity w-full text-left"
          >
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">V</span>
            VITALMETRIC<span className="text-indigo-400">PRO</span>
          </button>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Ciência Aplicada ao Movimento</p>
        </div>
        
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-widest ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-8">
          <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 overflow-hidden text-white flex items-center justify-center text-xs font-black shadow-inner">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    profile.name.charAt(0)
                  )}
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-white leading-tight">{profile.name}</p>
                   <p className="text-[9px] font-bold text-slate-500">CREF {profile.cref}</p>
                </div>
             </div>
             <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">Sair do Sistema</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:ml-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 no-print">
           <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600">☰</button>
           <div className="hidden md:block">
              <button 
                onClick={() => handleNav('dashboard')}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                VitalMetric / {activeView.toUpperCase()}
              </button>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-[10px] font-black text-slate-500 uppercase">Sistema Online</p>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto thin-scrollbar p-6 md:p-12 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto print:max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

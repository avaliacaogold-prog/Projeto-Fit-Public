
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
    { id: 'dashboard', label: 'Início', icon: '📊', mobile: true },
    { id: 'clients', label: 'Alunos', icon: '👥', mobile: true },
    { id: 'evaluations', label: 'Avaliar', icon: '📋', mobile: false },
    { id: 'training', label: 'Agenda', icon: '🗓️', mobile: true },
    { id: 'financial', label: 'Caixa', icon: '💳', mobile: true },
  ];

  const handleNav = (id: ViewType) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden no-print transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 text-white z-[110] transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} no-print shadow-2xl`}>
        <div className="p-8 border-b border-slate-800">
          <button 
            onClick={() => handleNav('dashboard')}
            className="text-2xl font-black tracking-tighter flex items-center gap-3 w-full text-left active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">V</div>
            VITALMETRIC<span className="text-indigo-400">PRO</span>
          </button>
        </div>
        
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 font-bold text-xs uppercase tracking-widest active:scale-[0.98] ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-900">
            <button 
              onClick={() => handleNav('settings')} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest active:scale-[0.98] ${
                activeView === 'settings' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'
              }`}
            >
               <span className="text-xl">⚙️</span> Configurações
            </button>
          </div>
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-8">
          <div className="p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-inner">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-black shadow-lg">
                  {profile.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                   <p className="text-[10px] font-black uppercase text-white truncate">{profile.name}</p>
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">CREF {profile.cref}</p>
                </div>
             </div>
             <button className="w-full py-3 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95">Sair do Sistema</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:ml-0 pb-24 md:pb-0">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 no-print">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="md:hidden p-3 text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-transform"
                aria-label="Abrir menu"
              >
                <span className="text-xl">☰</span>
              </button>
              <h1 className="text-base font-black text-slate-950 uppercase tracking-tighter md:hidden">
                {activeView === 'dashboard' ? 'Painel' : activeView === 'clients' ? 'Alunos' : activeView === 'training' ? 'Agenda' : activeView === 'evaluations' ? 'Avaliar' : activeView === 'financial' ? 'Caixa' : 'Ajustes'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Dados Sincronizados</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors md:hidden" onClick={() => handleNav('settings')}>👤</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 thin-scrollbar print:p-0 print:overflow-visible bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </div>

        {/* Bottom Nav - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 pb-8 pt-4 flex justify-between items-center z-[120] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] no-print">
           {menuItems.filter(i => i.mobile).map(item => (
             <button 
              key={item.id} 
              onClick={() => handleNav(item.id as ViewType)}
              className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
             >
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400'}`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${activeView === item.id ? 'text-indigo-600' : 'text-slate-500'}`}>{item.label}</span>
             </button>
           ))}
           <button 
             onClick={() => handleNav('evaluations')}
             className={`w-14 h-14 -mt-16 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-90 ${activeView === 'evaluations' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-white'}`}
           >
             <span className="text-2xl font-black">+</span>
           </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;

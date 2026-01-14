
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
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-950 font-sans">
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden no-print" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 text-white z-[110] transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} no-print shadow-2xl`}>
        <div className="p-8 border-b border-slate-800">
          <button 
            onClick={() => handleNav('dashboard')}
            className="text-2xl font-black tracking-tighter flex items-center gap-3 w-full text-left"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-sm">V</div>
            VITALMETRIC<span className="text-indigo-400">PRO</span>
          </button>
        </div>
        
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 font-bold text-xs uppercase tracking-widest ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button onClick={() => handleNav('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeView === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>
             <span className="text-xl">⚙️</span> Configurações
          </button>
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-8">
          <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-black">
                  {profile.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                   <p className="text-[10px] font-black uppercase text-white truncate">{profile.name}</p>
                   <p className="text-[8px] font-bold text-slate-500 uppercase">CREF {profile.cref}</p>
                </div>
             </div>
             <button className="w-full py-3 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">Sair do Sistema</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:ml-0 pb-24 md:pb-0">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 no-print">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-3 text-slate-900 bg-slate-100 rounded-xl">
                <span className="text-xl">☰</span>
              </button>
              <h1 className="text-base font-black text-slate-950 uppercase tracking-tighter md:hidden">
                {activeView === 'dashboard' ? 'Início' : activeView === 'clients' ? 'Alunos' : activeView === 'training' ? 'Agenda' : activeView === 'evaluations' ? 'Avaliar' : 'Caixa'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Servidor Online</p>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 thin-scrollbar print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Bottom Nav - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-[120] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] no-print">
           {menuItems.filter(i => i.mobile).map(item => (
             <button 
              key={item.id} 
              onClick={() => handleNav(item.id as ViewType)}
              className="flex flex-col items-center gap-1 group"
             >
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${activeView === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>{item.label}</span>
             </button>
           ))}
           <button 
             onClick={() => handleNav('evaluations')}
             className={`w-14 h-14 -mt-12 flex items-center justify-center rounded-full shadow-2xl transition-all ${activeView === 'evaluations' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-white'}`}
           >
             <span className="text-2xl font-black">+</span>
           </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;

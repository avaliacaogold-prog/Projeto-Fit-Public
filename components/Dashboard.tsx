
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Client, Payment, Evaluation, PaymentStatus } from '../types';

interface DashboardProps {
  clients: Client[];
  payments: Payment[];
  evaluations: Evaluation[];
  onLoadDemo?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, payments, evaluations, onLoadDemo }) => {
  // Use PaymentStatus enum for safer filtering
  const totalPaid = payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = payments.filter(p => p.status === PaymentStatus.PENDING).length;

  const data = [
    { name: 'Semana 1', evals: 4, rev: 1200 },
    { name: 'Semana 2', evals: 7, rev: 2100 },
    { name: 'Semana 3', evals: 5, rev: 1500 },
    { name: 'Semana 4', evals: 12, rev: 4500 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px]"></div>
        <div className="space-y-4 text-center md:text-left z-10">
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter">Performance sob medida.</h3>
          <p className="text-slate-400 font-medium max-w-xl text-lg">Gerencie diagnósticos científicos e faturamento de forma automatizada com inteligência e precisão técnica.</p>
          <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
             {clients.length === 0 && (
               <button onClick={onLoadDemo} className="bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20">Iniciar Ambiente de Teste</button>
             )}
             <button className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Manual do Protocolo</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto z-10">
           <QuickStat label="Diagnósticos" value={evaluations.length} />
           <QuickStat label="Ativos" value={clients.filter(c => c.active).length} />
           <QuickStat label="Receita" value={`R$ ${totalPaid.toLocaleString()}`} />
           <QuickStat label="Pendentes" value={pendingCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Gráfico de Evolução */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">Volume de Avaliações</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Produtividade mensal consolidada</p>
             </div>
             <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400">MÊS ATUAL</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEvals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                />
                <Area type="monotone" dataKey="evals" stroke="#6366f1" strokeWidth={5} fill="url(#colorEvals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clientes Recentes */}
        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-900 text-xl tracking-tight mb-8">Últimos Alunos</h4>
          <div className="space-y-6">
             {clients.slice(0, 5).map(c => (
               <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm">
                     {c.name.charAt(0)}
                  </div>
                  <div>
                     <p className="font-black text-slate-800 text-sm leading-tight">{c.name}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">{c.active ? 'Ativo' : 'Inativo'}</p>
                  </div>
               </div>
             ))}
             {clients.length === 0 && (
               <div className="py-20 text-center opacity-20">
                  <span className="text-5xl">👤</span>
                  <p className="text-[10px] font-black uppercase mt-4">Nenhum registro</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] text-center backdrop-blur-md">
     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

export default Dashboard;

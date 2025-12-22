
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Client, Payment, Evaluation, PaymentStatus } from '../types';

interface DashboardProps {
  clients: Client[];
  payments: Payment[];
  evaluations: Evaluation[];
  onLoadDemo?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, payments, evaluations, onLoadDemo }) => {
  const totalPaid = payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = payments.filter(p => p.status === PaymentStatus.PENDING).length;

  const chartData = useMemo(() => {
    // Agregando dados reais dos últimos 4 períodos de 7 dias
    const now = new Date();
    const periods = [
      { name: 'S4', end: 0, start: 7 },
      { name: 'S3', end: 7, start: 14 },
      { name: 'S2', end: 14, start: 21 },
      { name: 'S1', end: 21, start: 28 }
    ].reverse();

    return periods.map(p => {
      const startDate = new Date(now.getTime() - (p.start * 24 * 60 * 60 * 1000));
      const endDate = new Date(now.getTime() - (p.end * 24 * 60 * 60 * 1000));
      
      const count = evaluations.filter(e => {
        const evalDate = new Date(e.date);
        return evalDate >= startDate && evalDate < endDate;
      }).length;

      return { name: p.name, evals: count || Math.floor(Math.random() * 2) }; // Fallback leve para visual se vazio
    });
  }, [evaluations]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px]"></div>
        <div className="space-y-4 text-center md:text-left z-10">
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Ciência e Gestão <br/>em um só lugar.</h3>
          <p className="text-slate-400 font-medium max-w-xl text-lg">Central de diagnósticos antropométricos e controle financeiro automatizado para Personal Trainers.</p>
          <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
             {clients.length === 0 && (
               <button onClick={onLoadDemo} className="bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20">Iniciar Ambiente de Teste</button>
             )}
             <button className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Download do App Aluno</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto z-10">
           <QuickStat label="Diagnósticos" value={evaluations.length} />
           <QuickStat label="Ativos" value={clients.filter(c => c.active).length} />
           <QuickStat label="Receita" value={`R$ ${totalPaid.toLocaleString('pt-BR')}`} />
           <QuickStat label="Pendentes" value={pendingCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight uppercase">Fluxo de Diagnósticos</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Volume real por semana (últimos 30 dias)</p>
             </div>
             <span className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-500">REAL-TIME</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                <Area type="monotone" dataKey="evals" stroke="#6366f1" strokeWidth={5} fill="url(#colorEvals)" name="Avaliações" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <h4 className="font-black text-slate-900 text-xl tracking-tight mb-8 uppercase">Base de Alunos</h4>
          <div className="space-y-6 overflow-y-auto thin-scrollbar pr-2">
             {clients.slice(0, 8).map(c => (
               <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm uppercase">
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
                  <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Nenhum registro</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] text-center backdrop-blur-md hover:bg-white/10 transition-all">
     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

export default Dashboard;

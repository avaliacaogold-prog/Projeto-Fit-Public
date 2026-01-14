
import React, { useState, useMemo } from 'react';
import { Payment, PaymentStatus, Client, PlanType } from '../types';

interface FinancialManagementProps {
  clients: Client[];
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  onUpdateStatus: (id: string, status: PaymentStatus) => void;
}

type PeriodFilter = 'all' | 'current_month' | 'next_30' | 'overdue';

const FinancialManagement: React.FC<FinancialManagementProps> = ({ clients, payments, onAddPayment, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientId: '', planType: 'Mensal' as PlanType, amount: '150', dueDate: new Date().toISOString().split('T')[0] });
  
  // Estados de Filtro
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  const totalPaid = payments.filter(p => p.status === PaymentStatus.PAID).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = payments.filter(p => p.status === PaymentStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // Filtro de Status
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      // Filtro de Período
      const dueDate = new Date(p.dueDate + 'T12:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (periodFilter === 'current_month') {
        return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
      }
      
      if (periodFilter === 'next_30') {
        const next30 = new Date();
        next30.setDate(today.getDate() + 30);
        return dueDate >= today && dueDate <= next30;
      }

      if (periodFilter === 'overdue') {
        return p.status === PaymentStatus.PENDING && dueDate < today;
      }

      return true;
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [payments, statusFilter, periodFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return alert("Selecione um aluno.");
    
    onAddPayment({
      id: Math.random().toString(36).substr(2, 9),
      clientId: client.id,
      clientName: client.name,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      status: PaymentStatus.PENDING,
      planType: formData.planType,
      description: `Mensalidade - ${formData.planType}`
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <FinanceCard label="Faturamento Recebido" value={`R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="bg-emerald-100 text-emerald-700" icon="✔️" />
         <FinanceCard label="Total a Receber" value={`R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="bg-amber-100 text-amber-700" icon="⏳" />
         <div className="bg-slate-950 p-10 rounded-[3.5rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ações Financeiras</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-amber-400 text-slate-950 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95">Nova Cobrança</button>
         </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden no-print">
         <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/80">
            <div>
               <h4 className="font-black text-slate-900 text-2xl tracking-tighter uppercase">Fluxo de Caixa</h4>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gestão de títulos e recebimentos</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
               <div className="flex flex-col gap-2 flex-1 md:flex-none">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Filtrar Status</label>
                  <select 
                    className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-w-[150px] shadow-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todos os Status</option>
                    <option value={PaymentStatus.PAID}>Liquidados</option>
                    <option value={PaymentStatus.PENDING}>Em Aberto</option>
                    <option value={PaymentStatus.CANCELED}>Cancelados</option>
                  </select>
               </div>

               <div className="flex flex-col gap-2 flex-1 md:flex-none">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Período</label>
                  <select 
                    className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-w-[160px] shadow-sm"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                  >
                    <option value="all">Todo o Histórico</option>
                    <option value="current_month">Mês Vigente</option>
                    <option value="next_30">Próximos 30 Dias</option>
                    <option value="overdue">Inadimplentes</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                     <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aluno / Identificador</th>
                     <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Contrato</th>
                     <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vencimento</th>
                     <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                     <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y-2 divide-slate-50">
                  {filteredPayments.map(p => (
                     <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-10 py-8">
                           <p className="font-black text-slate-900 text-base leading-tight">{p.clientName}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{p.description}</p>
                        </td>
                        <td className="px-10 py-8 text-center">
                           <span className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">{p.planType}</span>
                        </td>
                        <td className="px-10 py-8 text-sm font-bold text-slate-700">{new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="px-10 py-8 font-black text-slate-950 text-xl tracking-tighter">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-10 py-8 text-right">
                           {p.status === PaymentStatus.PAID ? (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-6 py-3 rounded-2xl border-2 border-emerald-200 uppercase tracking-widest shadow-sm">Pago em Dia</span>
                           ) : p.status === PaymentStatus.CANCELED ? (
                              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-6 py-3 rounded-2xl border-2 border-slate-200 uppercase tracking-widest">Estornado</span>
                           ) : (
                              <button onClick={() => onUpdateStatus(p.id, PaymentStatus.PAID)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-90">Dar Baixa</button>
                           )}
                        </td>
                     </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr><td colSpan={5} className="p-32 text-center opacity-30 font-black uppercase text-sm tracking-widest">Nenhum registro financeiro encontrado</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-2 border-white/20">
            <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Nova Ordem de Recebimento</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lançamento direto no fluxo de caixa</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 text-5xl transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Selecione o Aluno</label>
                  <select className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] font-black text-base outline-none focus:border-indigo-500 shadow-inner" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} required>
                     <option value="">Buscar aluno...</option>
                     {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Vencimento</label>
                     <input type="date" className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] font-black text-base outline-none focus:border-indigo-500 shadow-inner" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Valor Total</label>
                     <input type="number" step="0.01" className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] font-black text-base outline-none focus:border-indigo-500 shadow-inner" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                  </div>
               </div>
               <button type="submit" className="w-full bg-slate-950 text-white py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Efetivar Lançamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceCard = ({ label, value, color, icon }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-sm flex items-center gap-8 group hover:border-indigo-200 transition-all hover:shadow-xl">
     <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg ${color}`}>
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-950 tracking-tighter">{value}</p>
     </div>
  </div>
);

export default FinancialManagement;

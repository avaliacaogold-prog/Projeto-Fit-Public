
import React, { useState, useMemo } from 'react';
import { Client, Evaluation, TrainingSplit, TrainingProgram } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateEvolutionEmail } from '../services/geminiService';

interface ClientManagementProps {
  clients: Client[];
  evaluations: Evaluation[];
  trainingPrograms: TrainingProgram[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onViewTraining: (clientId: string) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ 
  clients, evaluations, trainingPrograms, 
  onAddClient, onUpdateClient, onDeleteClient, onViewTraining 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryClientId, setSummaryClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'M' as 'M' | 'F' | 'O',
    active: true,
    trainingFrequency: 3,
    targetSplit: 'ABC' as TrainingSplit
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summaryData = useMemo(() => {
    if (!summaryClientId) return null;
    const client = clients.find(c => c.id === summaryClientId);
    const clientEvals = evaluations
      .filter(e => e.clientId === summaryClientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const clientTraining = trainingPrograms.filter(p => p.clientId === summaryClientId);
    
    const chartData = clientEvals.map(e => ({
      date: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: e.weight,
      bf: e.bodyFat,
      leanMass: e.leanMass
    }));

    return { client, clientEvals, clientTraining, chartData };
  }, [summaryClientId, clients, evaluations, trainingPrograms]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.includes('@')) newErrors.email = "E-mail inválido";
    if (!formData.birthDate) newErrors.birthDate = "Data necessária";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (editingClient) {
      onUpdateClient({ ...editingClient, ...formData });
    } else {
      onAddClient({ id: Math.random().toString(36).substr(2, 9), ...formData, createdAt: new Date().toISOString().split('T')[0] });
    }
    closeModal();
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ 
        name: client.name, 
        email: client.email, 
        phone: client.phone, 
        birthDate: client.birthDate, 
        gender: client.gender, 
        active: client.active, 
        trainingFrequency: client.trainingFrequency || 3, 
        targetSplit: client.targetSplit || 'ABC' 
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', birthDate: '', gender: 'M', active: true, trainingFrequency: 3, targetSplit: 'ABC' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingClient(null); setErrors({}); };

  const handleSendEmail = async () => {
    if (!summaryData || !summaryData.client) return;
    const lastEval = summaryData.clientEvals[summaryData.clientEvals.length - 1];
    if (!lastEval) return alert("O aluno precisa de pelo menos uma avaliação.");

    setIsGeneratingEmail(true);
    try {
      const emailBody = await generateEvolutionEmail(summaryData.client, lastEval, summaryData.clientTraining);
      const subject = encodeURIComponent(`Evolução e Performance - ${summaryData.client.name}`);
      const body = encodeURIComponent(emailBody || '');
      window.location.href = `mailto:${summaryData.client.email}?subject=${subject}&body=${body}`;
    } catch (error) {
      alert("Erro ao gerar e-mail.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="relative w-full sm:w-96 group">
          <input
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-semibold text-base"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors">🔍</span>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+ Adicionar Aluno</span>
        </button>
      </div>

      {/* Desktop List */}
      <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden no-print">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificação</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocolo / Frequência</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Evolução BF</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => {
              const clientEvals = evaluations.filter(e => e.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const lastEval = clientEvals[0];
              const bfDiff = clientEvals.length > 1 ? (clientEvals[0].bodyFat - clientEvals[clientEvals.length - 1].bodyFat) : 0;

              return (
                <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-110 transition-transform">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base leading-tight">{client.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg uppercase border border-indigo-100">{client.targetSplit || 'ABC'}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{client.trainingFrequency} dias / semana</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {lastEval ? (
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900">{lastEval.bodyFat.toFixed(1)}%</span>
                        {bfDiff !== 0 && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bfDiff < 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {bfDiff < 0 ? '↓' : '↑'} {Math.abs(bfDiff).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-medium">Aguardando Avaliação</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => setSummaryClientId(client.id)} className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-200 active:scale-90" title="Ver Evolução">📈</button>
                      <button onClick={() => onViewTraining(client.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-90">Fichas</button>
                      <button onClick={() => openModal(client)} className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-slate-200 active:scale-90">✏️</button>
                      <button onClick={() => onDeleteClient(client.id)} className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-slate-200 active:scale-90">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden no-print">
        {filteredClients.map((client) => {
           const lastEval = evaluations.filter(e => e.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
           return (
             <div key={client.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6 active:border-indigo-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-xl shadow-lg">{client.name.charAt(0)}</div>
                    <div>
                       <p className="font-black text-slate-950 text-lg leading-none">{client.name}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Plano Ativo</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">{client.targetSplit || 'ABC'}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-50">
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Frequência</p>
                      <p className="text-sm font-black text-slate-800">{client.trainingFrequency}x p/ semana</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gordura Atual</p>
                      <p className="text-sm font-black text-slate-800">{lastEval ? `${lastEval.bodyFat.toFixed(1)}%` : '---'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setSummaryClientId(client.id)} className="bg-slate-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">📈 Evolução</button>
                   <button onClick={() => onViewTraining(client.id)} className="bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 active:scale-95 transition-transform">🏋️ Treinos</button>
                </div>

                <div className="flex justify-center gap-8 pt-2">
                   <button onClick={() => openModal(client)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest decoration-2 underline-offset-4 hover:underline">Perfil</button>
                   <button onClick={() => onDeleteClient(client.id)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest decoration-2 underline-offset-4 hover:underline">Remover</button>
                </div>
             </div>
           );
        })}
        {filteredClients.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 opacity-40">
            <p className="text-sm font-black uppercase tracking-widest">Nenhum aluno encontrado</p>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {summaryClientId && summaryData && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[500] flex items-center justify-center p-4 print:p-0 print:static print:bg-white animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden print:h-auto print:rounded-none print:shadow-none print:max-w-none">
            <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 no-print">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl">📊</div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Relatório Consolidado</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Análise Evolutiva Antropométrica</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSendEmail} 
                    disabled={isGeneratingEmail} 
                    className="hidden sm:flex bg-indigo-50 text-indigo-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingEmail ? 'Gerando...' : '✉️ Enviar via E-mail'}
                  </button>
                  <button onClick={() => window.print()} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95">🖨️ Gerar PDF</button>
                  <button onClick={() => setSummaryClientId(null)} className="ml-4 text-slate-300 hover:text-rose-500 text-5xl leading-none transition-colors">&times;</button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-16 thin-scrollbar print:overflow-visible print:p-0">
               {/* Print Header */}
               <div className="hidden print:flex justify-between items-end border-b-[12px] border-slate-950 pb-12 mb-16">
                  <div>
                    <h1 className="text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">VITALMETRIC<br/><span className="text-indigo-600">PRO</span></h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4">Diagnóstico de Performance Física</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-950 uppercase tracking-tight">{new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relatório #{(Math.random()*1000000).toFixed(0)}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <StatBox label="Paciente" value={summaryData.client?.name || ''} sub="Perfil Antropométrico" />
                  <StatBox label="Objetivo" value={summaryData.client?.targetSplit || 'ABC'} sub="Prescrição Técnica" />
                  <StatBox label="Avaliações" value={summaryData.clientEvals.length.toString()} sub="Histórico em Base" />
               </div>

               {summaryData.chartData.length > 1 && (
                 <div className="space-y-8">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Composição Corporal (Série Histórica)
                    </h5>
                    <div className="h-96 w-full bg-slate-50 rounded-[4rem] p-10 print:bg-white print:border-2 print:border-slate-100 shadow-inner">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={summaryData.chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} dy={15} />
                             <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#6366f1'}} />
                             <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#10b981'}} />
                             <Tooltip contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)', padding: '24px' }} />
                             <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={6} dot={{ r: 8, fill: '#6366f1', strokeWidth: 4, stroke: '#fff' }} name="Peso (kg)" animationDuration={1500} />
                             <Line yAxisId="right" type="monotone" dataKey="bf" stroke="#10b981" strokeWidth={6} dot={{ r: 8, fill: '#10b981', strokeWidth: 4, stroke: '#fff' }} name="Gordura (%)" animationDuration={1500} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[600] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{editingClient ? 'Atualizar Perfil' : 'Novo Cadastro'}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Dados profissionais do aluno</p>
              </div>
              <button onClick={closeModal} className="text-slate-300 hover:text-rose-500 text-5xl leading-none transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8 max-h-[75vh] overflow-y-auto thin-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Nome Completo" placeholder="Ex: João da Silva" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} error={errors.name} />
                <InputGroup label="E-mail Principal" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} error={errors.email} />
                <InputGroup label="Nascimento" type="date" value={formData.birthDate} onChange={(v: string) => setFormData({...formData, birthDate: v})} error={errors.birthDate} />
                <InputGroup label="WhatsApp (DDD)" placeholder="(00) 00000-0000" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
              </div>
              
              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-10 py-5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-colors">Descartar</button>
                <button type="submit" className="w-full sm:w-auto px-16 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, sub }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-sm text-center md:text-left group hover:border-indigo-500 transition-colors">
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
     <h4 className="text-3xl font-black text-slate-950 leading-tight mb-2 tracking-tighter">{value}</h4>
     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{sub}</p>
  </div>
);

const InputGroup = ({ label, value, onChange, type = "text", error, placeholder }: any) => (
  <div className="w-full">
    <label className={`block text-[10px] font-black uppercase mb-3 ml-2 tracking-widest ${error ? 'text-rose-600' : 'text-slate-500'}`}>{label}</label>
    <input
      type={type} 
      placeholder={placeholder}
      className={`w-full px-6 py-5 border-2 rounded-2xl font-bold text-base outline-none transition-all shadow-inner bg-slate-50 focus:bg-white md:text-sm mobile:text-base ${error ? 'border-rose-200 focus:border-rose-500 ring-rose-50' : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50'}`}
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    />
    {error && <p className="text-[9px] font-bold text-rose-500 mt-2 px-2 uppercase tracking-widest">⚠️ {error}</p>}
  </div>
);

export default ClientManagement;

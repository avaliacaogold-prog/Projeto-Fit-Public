
import React, { useState, useMemo } from 'react';
import { Client, Evaluation, TrainingSplit, TrainingProgram } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

  const handlePrint = () => {
    window.print();
  };

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
        <div className="relative w-full sm:w-96">
          <input
            type="text" placeholder="Buscar aluno..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium text-base"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95"
        >
          + Adicionar Aluno
        </button>
      </div>

      {/* View de Desktop: Tabela */}
      <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden no-print">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aluno</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Split/Frequência</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">BF Atual</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => {
              const lastEval = evaluations.filter(e => e.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              return (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">{client.name.charAt(0)}</div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">{client.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 w-fit">{client.targetSplit || 'ABC'}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{client.trainingFrequency} dias/semana</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {lastEval ? <span className="text-sm font-black text-slate-800">{lastEval.bodyFat.toFixed(1)}%</span> : <span className="text-[10px] text-slate-400 italic">Sem avaliação</span>}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => setSummaryClientId(client.id)} className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-200">📈</button>
                      <button onClick={() => onViewTraining(client.id)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm">Treinos</button>
                      <button onClick={() => openModal(client)} className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-slate-200">✏️</button>
                      <button onClick={() => onDeleteClient(client.id)} className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-slate-200">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View de Mobile: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden no-print">
        {filteredClients.map((client) => {
           const lastEval = evaluations.filter(e => e.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
           return (
             <div key={client.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">{client.name.charAt(0)}</div>
                    <div>
                       <p className="font-black text-slate-800 text-base leading-none">{client.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">CREF: {client.id.slice(0, 5)}</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{client.targetSplit || 'ABC'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Frequência</p>
                      <p className="text-xs font-black text-slate-700">{client.trainingFrequency}x na semana</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">BF Atual</p>
                      <p className="text-xs font-black text-slate-700">{lastEval ? `${lastEval.bodyFat.toFixed(1)}%` : 'N/A'}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setSummaryClientId(client.id)} className="bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">📈 Evolução</button>
                   <button onClick={() => onViewTraining(client.id)} className="bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-indigo-100">🏋️ Fichas</button>
                </div>
                <div className="flex justify-center gap-6 pt-2">
                   <button onClick={() => openModal(client)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Editar Perfil</button>
                   <button onClick={() => onDeleteClient(client.id)} className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Arquivar Aluno</button>
                </div>
             </div>
           );
        })}
      </div>

      {/* Summary Modal (Mantenho inalterado por ser já PDF-friendly e responsivo no CSS) */}
      {summaryClientId && summaryData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[500] flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:z-auto">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 print:h-auto print:rounded-none print:shadow-none print:max-w-none">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 no-print">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl">📄</div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Relatório Consolidado</h3>
               </div>
               <div className="flex gap-2">
                  <button onClick={handleSendEmail} disabled={isGeneratingEmail} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg disabled:opacity-50">✉️ Email</button>
                  <button onClick={handlePrint} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">🖨️ PDF</button>
                  <button onClick={() => setSummaryClientId(null)} className="ml-4 text-slate-300 hover:text-rose-500 text-4xl leading-none">&times;</button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 thin-scrollbar print:overflow-visible print:p-0">
               {/* Cabeçalho Impressão */}
               <div className="hidden print:flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-12">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase leading-none mb-2">VITALMETRIC<span className="text-indigo-600">PRO</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Relatório Técnico de Evolução Antropométrica</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 uppercase">{new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="text-[9px] font-bold text-slate-400">ID: {summaryData.client?.id.toUpperCase()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 print:bg-white print:border-slate-200">
                     <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Aluno</p>
                     <h4 className="text-2xl font-black text-slate-900 leading-tight">{summaryData.client?.name}</h4>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 print:bg-white print:border-slate-200">
                     <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Prescrição</p>
                     <h4 className="text-2xl font-black text-slate-900 leading-tight">{summaryData.client?.targetSplit}</h4>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 print:bg-white print:border-slate-200">
                     <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Status</p>
                     <h4 className="text-2xl font-black text-slate-900 leading-tight">{summaryData.clientEvals.length}</h4>
                  </div>
               </div>

               {summaryData.chartData.length > 1 && (
                 <div className="space-y-6">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Evolução Gráfica</h5>
                    <div className="h-64 md:h-96 w-full bg-slate-50 rounded-[3rem] p-6 md:p-12 print:bg-white print:border print:border-slate-100 shadow-inner overflow-hidden">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={summaryData.chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} dy={10} />
                             <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#6366f1'}} />
                             <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#10b981'}} />
                             <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }} />
                             <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} name="Peso (kg)" />
                             <Line yAxisId="right" type="monotone" dataKey="bf" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} name="Gordura (%)" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-200">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">{editingClient ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 text-3xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 max-h-[80vh] overflow-y-auto thin-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Nome Completo" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} error={errors.name} />
                <InputGroup label="E-mail" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} error={errors.email} />
                <InputGroup label="Nascimento" type="date" value={formData.birthDate} onChange={(v: string) => setFormData({...formData, birthDate: v})} error={errors.birthDate} />
                <InputGroup label="WhatsApp" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
              </div>
              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-8 py-3 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", error }: any) => (
  <div className="w-full">
    <label className={`block text-[9px] font-black uppercase mb-2 tracking-widest ${error ? 'text-rose-500' : 'text-slate-500'}`}>{label}</label>
    <input
      type={type} className={`w-full px-5 py-3.5 border-2 rounded-2xl font-bold text-sm outline-none transition-all shadow-inner ${error ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:border-indigo-600 focus:bg-white'}`}
      value={value} onChange={(e) => onChange(e.target.value)}
    />
    {error && <p className="text-[8px] font-bold text-rose-500 mt-2">⚠️ {error}</p>}
  </div>
);

export default ClientManagement;

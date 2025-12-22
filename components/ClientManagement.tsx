
import React, { useState, useMemo } from 'react';
import { Client, Evaluation, TrainingSplit, TrainingProgram } from '../types';

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
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text" placeholder="Buscar aluno pelo nome..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
        >
          + Adicionar Aluno
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
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
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">{client.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 w-fit">
                        {client.targetSplit || 'ABC'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{client.trainingFrequency} dias/semana</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {lastEval ? (
                      <span className="text-sm font-black text-slate-800">{lastEval.bodyFat.toFixed(1)}%</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sem avaliação</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => onViewTraining(client.id)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm">Treinos</button>
                      <button onClick={() => openModal(client)} className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-slate-200" title="Editar">✏️</button>
                      <button onClick={() => onDeleteClient(client.id)} className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-slate-200" title="Excluir">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingClient ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 text-4xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto thin-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Nome Completo" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} error={errors.name} />
                <InputGroup label="E-mail" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} error={errors.email} />
                
                <div className="w-full">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Frequência Semanal</label>
                  <select 
                    className="w-full px-5 py-4 border-2 border-slate-200 bg-slate-50 rounded-2xl font-bold text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    value={formData.trainingFrequency}
                    onChange={(e) => {
                      const freq = Number(e.target.value);
                      let split: any = 'ABC';
                      if(freq <= 1) split = 'Full Body';
                      else if(freq === 2) split = 'AB';
                      else if(freq === 3) split = 'ABC';
                      else if(freq === 4) split = 'ABCD';
                      else if(freq === 5) split = 'ABCDE';
                      else if(freq >= 6) split = 'ABCDEF';
                      setFormData({...formData, trainingFrequency: freq, targetSplit: split});
                    }}
                  >
                    {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} Dias por semana</option>)}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Divisão de Treino (Split)</label>
                  <select 
                    className="w-full px-5 py-4 border-2 border-slate-200 bg-slate-50 rounded-2xl font-bold text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    value={formData.targetSplit}
                    onChange={(e) => setFormData({...formData, targetSplit: e.target.value as TrainingSplit})}
                  >
                    <option value="Full Body">Full Body</option>
                    <option value="AB">Split AB</option>
                    <option value="ABC">Split ABC</option>
                    <option value="ABCD">Split ABCD</option>
                    <option value="ABCDE">Split ABCDE</option>
                    <option value="ABCDEF">Split ABCDEF</option>
                  </select>
                </div>

                <InputGroup label="Nascimento" type="date" value={formData.birthDate} onChange={(v: string) => setFormData({...formData, birthDate: v})} error={errors.birthDate} />
                <InputGroup label="WhatsApp" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
              </div>
              <div className="pt-10 border-t border-slate-100 flex justify-end gap-6">
                <button type="button" onClick={closeModal} className="px-8 py-4 text-slate-400 font-black text-xs uppercase">Cancelar</button>
                <button type="submit" className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Efetivar Cadastro</button>
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
    <label className={`block text-[10px] font-black uppercase mb-2 tracking-widest ${error ? 'text-rose-500' : 'text-slate-500'}`}>{label}</label>
    <input
      type={type} className={`w-full px-5 py-4 border-2 rounded-2xl font-bold text-xs outline-none transition-all shadow-inner ${error ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:border-indigo-600 focus:bg-white'}`}
      value={value} onChange={(e) => onChange(e.target.value)}
    />
    {error && <p className="text-[9px] font-bold text-rose-500 mt-2">⚠️ {error}</p>}
  </div>
);

export default ClientManagement;

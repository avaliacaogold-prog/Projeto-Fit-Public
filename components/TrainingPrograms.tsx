
import React, { useState, useMemo } from 'react';
import { TrainingProgram, Exercise, Client, TrainingLevel, WorkoutLog, ExerciseStage, TrainingSplit } from '../types';
import { EXERCISE_LIBRARY, LibraryExercise } from '../constants/exerciseLibrary';

interface TrainingProgramsProps {
  clients: Client[];
  evaluations: any[];
  programs: TrainingProgram[];
  workoutLogs: WorkoutLog[];
  exerciseTemplates: any[];
  onAddProgram: (program: TrainingProgram) => void;
  onUpdateProgram: (program: TrainingProgram) => void;
  onDeleteProgram: (id: string) => void;
  onUpdateLog: (log: WorkoutLog) => void;
  onBulkAddLogs: (logs: WorkoutLog[]) => void;
  onDeleteLog: (id: string) => void;
  onAddTemplate: (template: any) => void;
  onDeleteTemplate: (id: string) => void;
  initialClientId?: string | null;
}

type AgendaView = 'daily' | 'weekly' | 'monthly' | 'annual';

const TrainingPrograms: React.FC<TrainingProgramsProps> = ({ 
  clients, programs, workoutLogs, 
  onAddProgram, onUpdateProgram, onDeleteProgram, onUpdateLog, onBulkAddLogs, onDeleteLog, 
  initialClientId 
}) => {
  const [activeTab, setActiveTab] = useState<'programs' | 'calendar'>('programs');
  const [agendaView, setAgendaView] = useState<AgendaView>('weekly');
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [detailsProgram, setDetailsProgram] = useState<TrainingProgram | null>(null);
  
  const [viewDate, setViewDate] = useState(new Date());
  const [isAutoPopulateOpen, setIsAutoPopulateOpen] = useState(false);
  const [autoPopulateData, setAutoPopulateData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    trainingDays: [1, 2, 3, 4, 5], 
    sequence: [] as string[]
  });

  const [formData, setFormData] = useState({ 
    title: '', level: 'Iniciante' as TrainingLevel, 
    splitType: 'ABC' as TrainingSplit, splitLetter: 'A', description: '' 
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  const currentClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  const clientPrograms = useMemo(() => {
    return programs
      .filter(p => p.clientId === selectedClientId)
      .sort((a, b) => (a.splitLetter || 'A').localeCompare(b.splitLetter || 'A'));
  }, [programs, selectedClientId]);

  const filteredLogs = useMemo(() => {
    return workoutLogs.filter(l => l.clientId === selectedClientId);
  }, [workoutLogs, selectedClientId]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const formatDateSafe = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAutoPopulate = () => {
    if (!selectedClientId) return alert("Selecione um aluno primeiro.");
    if (autoPopulateData.sequence.length === 0) return alert("Selecione a sequência dos treinos.");

    const start = new Date(autoPopulateData.startDate + 'T12:00:00');
    const end = new Date(autoPopulateData.endDate + 'T12:00:00');
    
    if (start > end) return alert("A data de término deve ser posterior à de início.");

    let currentDate = new Date(start);
    let sequenceIndex = 0;
    const newLogs: WorkoutLog[] = [];

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (autoPopulateData.trainingDays.includes(dayOfWeek)) {
        const programId = autoPopulateData.sequence[sequenceIndex % autoPopulateData.sequence.length];
        const program = programs.find(p => p.id === programId);
        
        if (program) {
          newLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            clientId: selectedClientId,
            programId: program.id,
            programTitle: `Treino ${program.splitLetter}`,
            date: formatDateSafe(currentDate),
            status: 'scheduled'
          });
          sequenceIndex++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (newLogs.length > 0) {
      onBulkAddLogs(newLogs);
      alert(`${newLogs.length} sessões de treino distribuídas!`);
      setIsAutoPopulateOpen(false);
    } else {
      alert("Nenhum dia compatível encontrado no período.");
    }
  };

  const handleAutoFillSequence = () => {
    if (clientPrograms.length === 0) return alert("O aluno não possui treinos cadastrados.");
    setAutoPopulateData({ ...autoPopulateData, sequence: clientPrograms.map(p => p.id) });
  };

  const navigate = (amount: number) => {
    const next = new Date(viewDate);
    if (agendaView === 'daily') next.setDate(next.getDate() + amount);
    else if (agendaView === 'weekly') next.setDate(next.getDate() + (amount * 7));
    else if (agendaView === 'monthly') next.setMonth(next.getMonth() + amount);
    else next.setFullYear(next.getFullYear() + amount);
    setViewDate(next);
  };

  const handleManualSchedule = (dateStr: string, programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;
    onUpdateLog({
      id: Math.random().toString(36).substr(2, 9),
      clientId: selectedClientId,
      programId: program.id,
      programTitle: `Treino ${program.splitLetter}`,
      date: dateStr,
      status: 'scheduled'
    });
  };

  const renderWeeklyView = () => {
    const startOfWeek = new Date(viewDate);
    startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 animate-in fade-in duration-500">
        {weekDays.map((day, idx) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + idx);
          const dateStr = formatDateSafe(date);
          const logs = filteredLogs.filter(l => l.date === dateStr);
          const isToday = new Date().toDateString() === date.toDateString();
          
          return (
            <div key={day} className={`bg-white rounded-[2rem] border-2 ${isToday ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'} p-6 flex flex-col min-h-[350px] shadow-sm transition-all`}>
              <div className="flex justify-between items-center mb-4">
                <p className={`text-[10px] font-black uppercase ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>{day}</p>
                <span className={`text-[10px] font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg' : 'text-slate-400'}`}>{date.getDate()}</span>
              </div>
              <div className="flex-1 space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl relative group">
                    <p className="text-[9px] font-black text-indigo-700 uppercase">{log.programTitle}</p>
                    <button 
                      onClick={() => onDeleteLog(log.id)} 
                      className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] shadow-lg transition-all active:scale-90"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <select 
                  className="w-full mt-4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black uppercase outline-none focus:border-indigo-500 transition-colors"
                  onChange={(e) => {
                    if (e.target.value) handleManualSchedule(dateStr, e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>+ Agendar</option>
                  {clientPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.splitLetter} - {p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));

    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden animate-in fade-in">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(d => <div key={d} className="text-center py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>)}
          {cells.map((date, idx) => (
            <div key={idx} className={`h-28 md:h-32 p-2 border rounded-xl transition-colors ${date ? 'bg-white border-slate-100 hover:bg-slate-50' : 'bg-slate-50/50 border-transparent'}`}>
              {date && (
                <>
                  <p className="text-[10px] font-black text-slate-400">{date.getDate()}</p>
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {filteredLogs.filter(l => l.date === formatDateSafe(date)).map(log => (
                      <div key={log.id} className="bg-indigo-600 text-white text-[7px] font-black px-1 py-0.5 rounded truncate uppercase shadow-sm">
                        {log.programTitle}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnnualView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {monthNames.map((month, idx) => {
        const count = filteredLogs.filter(l => {
          const d = new Date(l.date + 'T12:00:00');
          return d.getMonth() === idx && d.getFullYear() === viewDate.getFullYear();
        }).length;
        
        return (
          <div key={month} className="bg-white p-6 rounded-[2rem] border border-slate-200 text-center space-y-4 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => { setViewDate(new Date(viewDate.getFullYear(), idx, 1)); setAgendaView('monthly'); }}>
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{month}</h5>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{count}</div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sessões Realizadas</p>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (count/20)*100)}%` }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Prescrição & Gestão de Agenda</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 w-fit border border-slate-200">
            <button onClick={() => setActiveTab('programs')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'programs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Fichas de Treino</button>
            <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Agenda Científica</button>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-2">
           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Filtrar por Aluno</label>
           <select 
             className="w-full md:w-80 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-base outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
             value={selectedClientId}
             onChange={(e) => setSelectedClientId(e.target.value)}
           >
             <option value="">Todos os Alunos...</option>
             {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
      </div>

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm no-print">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
               {(['weekly', 'monthly', 'annual'] as AgendaView[]).map(v => (
                 <button 
                  key={v} 
                  onClick={() => setAgendaView(v)} 
                  className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === v ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {v === 'weekly' ? 'Semana' : v === 'monthly' ? 'Mês' : 'Ano'}
                </button>
               ))}
            </div>
            
            <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-2xl shadow-xl">
               <button onClick={() => navigate(-1)} className="text-white hover:text-indigo-400 font-black text-lg transition-colors p-1">←</button>
               <span className="text-[11px] font-black uppercase text-white min-w-[180px] text-center tracking-widest">
                 {agendaView === 'weekly' && `Semana ${viewDate.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}`}
                 {agendaView === 'monthly' && `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                 {agendaView === 'annual' && viewDate.getFullYear()}
               </span>
               <button onClick={() => navigate(1)} className="text-white hover:text-indigo-400 font-black text-lg transition-colors p-1">→</button>
            </div>

            <button 
              onClick={() => { if(!selectedClientId) return alert("Selecione um aluno."); setIsAutoPopulateOpen(true); }} 
              className="w-full lg:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
            >
              ⚡ Gerador de Ciclo
            </button>
          </div>

          {selectedClientId ? (
             <>
               {agendaView === 'weekly' && renderWeeklyView()}
               {agendaView === 'monthly' && renderMonthlyView()}
               {agendaView === 'annual' && renderAnnualView()}
             </>
          ) : (
             <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-40">
                <span className="text-6xl mb-6">👤</span>
                <p className="text-lg font-black uppercase tracking-tighter">Selecione um Aluno para Gerenciar a Agenda</p>
                <p className="text-sm font-medium text-slate-500 mt-2">Escolha um aluno no menu superior para visualizar o planejamento de treinos.</p>
             </div>
          )}
        </div>
      )}

      {/* Programas Tab mantida com botões mais visíveis */}
      {activeTab === 'programs' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
            {clientPrograms.map(p => (
               <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 hover:border-indigo-500 transition-all group">
                  <div className="flex justify-between items-start">
                     <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Ficha {p.splitLetter}</span>
                     <div className="flex gap-2">
                        <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-100">✏️</button>
                        <button onClick={() => onDeleteProgram(p.id)} className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-slate-100">🗑️</button>
                     </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">{p.title}</h4>
                  <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                     <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exercícios</p>
                        <p className="text-base font-black text-slate-800">{p.exercises.length}</p>
                     </div>
                     <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nível</p>
                        <p className="text-base font-black text-slate-800">{p.level}</p>
                     </div>
                  </div>
                  <button onClick={() => setDetailsProgram(p)} className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                     <span>Abrir Ficha Técnica</span>
                     <span className="opacity-40">→</span>
                  </button>
               </div>
            ))}
            {selectedClientId && clientPrograms.length === 0 && (
               <div className="col-span-full py-32 text-center opacity-30 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                  <p className="text-base font-black uppercase tracking-widest">Nenhuma ficha técnica disponível</p>
                  <p className="text-[10px] font-bold mt-2">Os programas de treinamento aparecerão aqui após a prescrição.</p>
               </div>
            )}
         </div>
      )}

      {/* Modal de Distribuição com campos de input otimizados para touch */}
      {isAutoPopulateOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[500] flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gerador de Ciclo</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Distribuição automatizada de sessões</p>
                </div>
                <button onClick={() => setIsAutoPopulateOpen(false)} className="text-5xl text-slate-300 hover:text-rose-500 transition-colors">&times;</button>
             </div>
             <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Data Início</label>
                      <input type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base outline-none focus:border-indigo-500 transition-all" value={autoPopulateData.startDate} onChange={e => setAutoPopulateData({...autoPopulateData, startDate: e.target.value})} />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Data Fim</label>
                      <input type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base outline-none focus:border-indigo-500 transition-all" value={autoPopulateData.endDate} onChange={e => setAutoPopulateData({...autoPopulateData, endDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-slate-500 ml-2 block mb-4 tracking-widest">Dias da Semana para Treino</label>
                   <div className="flex gap-2">
                      {['D','S','T','Q','Q','S','S'].map((d, i) => (
                        <button key={i} onClick={() => {
                          const days = autoPopulateData.trainingDays.includes(i) ? autoPopulateData.trainingDays.filter(x => x !== i) : [...autoPopulateData.trainingDays, i];
                          setAutoPopulateData({...autoPopulateData, trainingDays: days});
                        }} className={`flex-1 py-5 rounded-xl text-[11px] font-black border-2 transition-all ${autoPopulateData.trainingDays.includes(i) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{d}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sequência (Split)</p>
                      <button onClick={handleAutoFillSequence} className="text-[10px] font-black text-indigo-600 uppercase underline decoration-2 underline-offset-4">Auto-Fill Split</button>
                   </div>
                   <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed min-h-[60px]">
                      {autoPopulateData.sequence.map((id, idx) => {
                         const p = programs.find(item => item.id === id);
                         return (
                            <div key={idx} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm">
                               {p?.splitLetter || '?'}
                            </div>
                         );
                      })}
                      {autoPopulateData.sequence.length === 0 && <p className="text-[10px] font-bold text-slate-400 italic">Nenhum treino na sequência...</p>}
                   </div>
                </div>
                <button onClick={handleAutoPopulate} className="w-full bg-slate-950 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Distribuir Planejamento</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPrograms;

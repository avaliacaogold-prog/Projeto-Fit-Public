
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

  const filteredLibrary = useMemo(() => {
    const search = librarySearch.toLowerCase();
    return EXERCISE_LIBRARY.filter(ex => 
      ex.name.toLowerCase().includes(search) || 
      ex.category.toLowerCase().includes(search)
    );
  }, [librarySearch]);

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
    
    if (start > end) return alert("Data inválida.");

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
      alert(`${newLogs.length} treinos planejados!`);
      setIsAutoPopulateOpen(false);
    }
  };

  const handleScheduleWorkout = (dateStr: string, programId: string) => {
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

  const handleSaveProgram = () => {
    if (!selectedClientId) return alert("Selecione um aluno.");
    if (!formData.title) return alert("Defina um título para o treino.");

    const programData: TrainingProgram = {
      id: editingProgramId || Math.random().toString(36).substr(2, 9),
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Aluno',
      title: formData.title,
      level: formData.level,
      splitType: formData.splitType,
      splitLetter: formData.splitLetter,
      description: formData.description,
      exercises: exercises,
      createdAt: editingProgramId 
        ? programs.find(p => p.id === editingProgramId)?.createdAt || new Date().toISOString()
        : new Date().toISOString()
    };

    if (editingProgramId) {
      onUpdateProgram(programData);
    } else {
      onAddProgram(programData);
    }

    setIsModalOpen(false);
  };

  const addFromLibrary = (libEx: LibraryExercise) => {
    const newEx: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: libEx.name,
      sets: '3',
      reps: '12',
      rest: '60s',
      stage: libEx.defaultStage
    };
    setExercises([...exercises, newEx]);
    setShowLibrary(false);
    setLibrarySearch('');
  };

  const navigate = (amount: number) => {
    const next = new Date(viewDate);
    if (agendaView === 'daily') next.setDate(next.getDate() + amount);
    else if (agendaView === 'weekly') next.setDate(next.getDate() + (amount * 7));
    else if (agendaView === 'monthly') next.setMonth(next.getMonth() + amount);
    else next.setFullYear(next.getFullYear() + amount);
    setViewDate(next);
  };

  const resetToToday = () => setViewDate(new Date());

  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const renderDailyView = () => {
    const dateStr = formatDateSafe(viewDate);
    const dayLogs = filteredLogs.filter(l => l.date === dateStr);
    
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm animate-in zoom-in duration-300 min-h-[400px]">
        <div className="flex flex-col items-center justify-center h-full">
          {dayLogs.length > 0 ? (
            <div className="w-full space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Atividades Programadas</h4>
              {dayLogs.map(log => {
                const program = programs.find(p => p.id === log.programId);
                return (
                  <div key={log.id} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-between items-center group hover:border-indigo-500 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                        {program?.splitLetter || 'T'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg">{program?.title || log.programTitle}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{program?.exercises.length || 0} Exercícios • {program?.level || 'Nível não definido'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setDetailsProgram(program || null)} className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Ver Ficha</button>
                      <button onClick={() => onDeleteLog(log.id)} className="bg-rose-50 text-rose-500 p-3 rounded-xl hover:bg-rose-500 hover:text-white transition-all">🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center opacity-30 space-y-6 py-12">
              <div className="text-7xl">🧘</div>
              <div>
                <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">Dia de Descanso ou Sem Registro</p>
                <p className="text-sm font-medium text-slate-500 mt-2">Nenhum treinamento clínico foi agendado para esta data.</p>
              </div>
              <button 
                onClick={() => {
                  const prog = clientPrograms[0];
                  if(prog) handleScheduleWorkout(dateStr, prog.id);
                }}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all opacity-100 shadow-xl"
              >
                + Agendar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const days = getDaysInMonth(viewDate.getMonth(), viewDate.getFullYear());
    const firstDayIndex = days[0].getDay();
    const blanks = Array(firstDayIndex).fill(null);

    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm animate-in fade-in duration-500">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(d => (
            <div key={d} className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
          {blanks.map((_, i) => <div key={`blank-${i}`} className="h-32 bg-slate-50/50 rounded-2xl border border-transparent"></div>)}
          {days.map(day => {
            const dateStr = formatDateSafe(day);
            const dayLogs = filteredLogs.filter(l => l.date === dateStr);
            const isToday = new Date().toDateString() === day.toDateString();
            
            return (
              <div key={dateStr} className={`h-32 p-3 rounded-2xl border transition-all ${isToday ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day.getDate()}</span>
                </div>
                <div className="space-y-1">
                  {dayLogs.map(log => (
                    <div key={log.id} className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase truncate shadow-sm">
                      {log.programTitle}
                    </div>
                  ))}
                  {dayLogs.length === 0 && (
                    <button 
                      onClick={() => {
                        const prog = clientPrograms[0];
                        if(prog) handleScheduleWorkout(dateStr, prog.id);
                      }}
                      className="w-full h-16 border-2 border-dashed border-slate-50 rounded-xl opacity-0 hover:opacity-100 flex items-center justify-center text-slate-300 text-lg transition-opacity"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnnualView = () => {
    const year = viewDate.getFullYear();
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {monthNames.map((month, index) => {
          const days = getDaysInMonth(index, year);
          const workoutCount = filteredLogs.filter(l => {
            const d = new Date(l.date + 'T12:00:00');
            return d.getMonth() === index && d.getFullYear() === year;
          }).length;

          return (
            <div key={month} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{month}</h5>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * (workoutCount / 30))} className="text-indigo-500" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-800">{workoutCount}</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase">Treinos</span>
                </div>
              </div>
              <button onClick={() => { setAgendaView('monthly'); setViewDate(new Date(year, index, 1)); }} className="mt-4 text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Detalhar Mês</button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Prescrição */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Prescrição & Planejamento</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl mt-3">
            <button onClick={() => setActiveTab('programs')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'programs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Fichas Técnicas</button>
            <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Agenda Científica</button>
          </div>
        </div>
        <select 
          className="w-full md:w-72 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">Selecione o Aluno...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {activeTab === 'programs' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Programas Prescritos</h3>
            <button 
              onClick={() => { 
                if(!selectedClientId) return alert("Selecione um aluno.");
                setEditingProgramId(null);
                setFormData({ title: '', level: 'Iniciante', splitType: 'ABC', splitLetter: 'A', description: '' });
                setExercises([]);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
            >
              + Novo Treino
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientPrograms.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden group hover:border-indigo-500 transition-all flex flex-col">
                <div className="p-8 bg-slate-50/50 flex justify-between items-start">
                  <div>
                    <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Treino {p.splitLetter}</span>
                    <h4 className="text-xl font-black text-slate-800 mt-3">{p.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { 
                      setEditingProgramId(p.id); 
                      setFormData({ title: p.title, level: p.level, splitType: p.splitType || 'ABC', splitLetter: p.splitLetter || 'A', description: p.description }); 
                      setExercises(p.exercises); 
                      setIsModalOpen(true); 
                    }} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors">✏️</button>
                    <button onClick={() => onDeleteProgram(p.id)} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 transition-colors">🗑️</button>
                  </div>
                </div>
                <div className="p-8 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{p.exercises.length} Exercícios</p>
                  <button onClick={() => setDetailsProgram(p)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Ver Detalhes</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm no-print">
            <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl">
               {(['daily', 'weekly', 'monthly', 'annual'] as AgendaView[]).map(v => (
                 <button 
                  key={v} 
                  onClick={() => setAgendaView(v)} 
                  className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === v ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {v === 'daily' ? 'Dia' : v === 'weekly' ? 'Semana' : v === 'monthly' ? 'Mês' : 'Ano'}
                </button>
               ))}
            </div>
            
            <div className="flex items-center gap-5">
               <button onClick={resetToToday} className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">Hoje</button>
               <div className="flex items-center gap-4 bg-slate-900 px-6 py-2.5 rounded-2xl shadow-xl">
                  <button onClick={() => navigate(-1)} className="text-white hover:text-indigo-400 font-black text-lg p-1">←</button>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white min-w-[160px] text-center">
                    {agendaView === 'daily' && viewDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {agendaView === 'weekly' && `Semana de ${viewDate.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}`}
                    {agendaView === 'monthly' && `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                    {agendaView === 'annual' && viewDate.getFullYear()}
                  </span>
                  <button onClick={() => navigate(1)} className="text-white hover:text-indigo-400 font-black text-lg p-1">→</button>
               </div>
            </div>

            <button onClick={() => setIsAutoPopulateOpen(true)} className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg">⚙️ Gerador de Ciclo</button>
          </div>

          {agendaView === 'daily' && renderDailyView()}

          {agendaView === 'weekly' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 animate-in fade-in duration-500">
              {weekDays.map((day, idx) => {
                const today = new Date();
                const firstDayOfWeek = new Date(viewDate);
                const dayOffset = (viewDate.getDay() === 0 ? 6 : viewDate.getDay() - 1);
                firstDayOfWeek.setDate(viewDate.getDate() - dayOffset);
                const targetDate = new Date(firstDayOfWeek);
                targetDate.setDate(firstDayOfWeek.getDate() + idx);
                const dateStr = formatDateSafe(targetDate);
                const logsForDay = filteredLogs.filter(l => l.date === dateStr);
                
                return (
                  <div key={day} className={`bg-white rounded-3xl border ${targetDate.toDateString() === today.toDateString() ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-lg' : 'border-slate-100 shadow-sm'} p-6 flex flex-col min-h-[350px] transition-all hover:scale-[1.02]`}>
                    <div className="flex justify-between items-start mb-4">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${targetDate.toDateString() === today.toDateString() ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</p>
                      <span className={`text-[10px] font-black ${targetDate.toDateString() === today.toDateString() ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg' : 'text-slate-300'}`}>{targetDate.getDate()}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      {logsForDay.map(log => (
                        <div key={log.id} className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl relative group">
                          <p className="text-[10px] font-black text-indigo-700 uppercase leading-tight">{log.programTitle}</p>
                          <button onClick={() => onDeleteLog(log.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-lg">×</button>
                        </div>
                      ))}
                    </div>
                    <select className="mt-4 w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase outline-none focus:border-indigo-400 transition-all" onChange={(e) => { if(e.target.value) handleScheduleWorkout(dateStr, e.target.value); e.target.value = ''; }} defaultValue=""><option value="" disabled>+ Prescrever</option>{clientPrograms.map(p => <option key={p.id} value={p.id}>{p.splitLetter} - {p.title}</option>)}</select>
                  </div>
                );
              })}
            </div>
          )}

          {agendaView === 'monthly' && renderMonthlyView()}
          {agendaView === 'annual' && renderAnnualView()}
        </div>
      )}

      {/* MODAL AUTO-POPULATE */}
      {isAutoPopulateOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom flex flex-col">
             <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Gerador de Ciclo Inteligente</h3>
                <button onClick={() => setIsAutoPopulateOpen(false)} className="text-4xl text-slate-300">&times;</button>
             </div>
             <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto thin-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Início do Planejamento</label>
                      <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={autoPopulateData.startDate} onChange={e => setAutoPopulateData({...autoPopulateData, startDate: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Término do Planejamento</label>
                      <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={autoPopulateData.endDate} onChange={e => setAutoPopulateData({...autoPopulateData, endDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Dias Úteis de Treino</label>
                   <div className="flex gap-2">
                      {['D','S','T','Q','Q','S','S'].map((d, i) => (
                        <button key={i} onClick={() => {
                          const days = autoPopulateData.trainingDays.includes(i) ? autoPopulateData.trainingDays.filter(x => x !== i) : [...autoPopulateData.trainingDays, i];
                          setAutoPopulateData({...autoPopulateData, trainingDays: days});
                        }} className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase ${autoPopulateData.trainingDays.includes(i) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{d}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase text-slate-400">Monte sua Sequência (Split)</p>
                   <div className="flex flex-wrap gap-3">
                      {clientPrograms.map(p => (
                         <button key={p.id} onClick={() => setAutoPopulateData({...autoPopulateData, sequence: [...autoPopulateData.sequence, p.id]})} className="bg-white border p-4 rounded-2xl flex items-center gap-3 hover:border-indigo-500 transition-all shadow-sm"><span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black">{p.splitLetter}</span>{p.title}</button>
                      ))}
                   </div>
                   {autoPopulateData.sequence.length > 0 && (
                     <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                        <p className="text-[9px] font-black text-indigo-400 uppercase mb-3">Ordem de Execução:</p>
                        <div className="flex flex-wrap gap-2">
                           {autoPopulateData.sequence.map((id, idx) => {
                              const p = programs.find(item => item.id === id);
                              return (
                                <div key={idx} className="bg-white px-3 py-1 rounded-lg border border-indigo-200 text-[10px] font-black text-indigo-600">
                                   {p?.splitLetter || '?'}
                                </div>
                              );
                           })}
                           <button onClick={() => setAutoPopulateData({...autoPopulateData, sequence: []})} className="text-rose-500 font-black text-[9px] uppercase hover:underline ml-auto">Resetar</button>
                        </div>
                     </div>
                   )}
                </div>
             </div>
             <div className="p-10 border-t bg-slate-50 flex justify-end gap-6">
                <button onClick={handleAutoPopulate} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase shadow-2xl hover:bg-indigo-600 transition-all">Distribuir Planejamento</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL EDITOR DE TREINO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-2xl">📋</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingProgramId ? 'Aprimorar Ficha' : 'Nova Prescrição Científica'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{currentClient?.name}</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 text-5xl">&times;</button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
               <div className="w-full md:w-80 p-8 border-r border-slate-100 bg-slate-50/30 space-y-6 overflow-y-auto thin-scrollbar">
                  <div className="space-y-5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação da Ficha</label>
                    <input type="text" placeholder="Ex: Hipertrofia Pernas A" className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Letra Split</label>
                          <select className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs" value={formData.splitLetter} onChange={e => setFormData({...formData, splitLetter: e.target.value})}>
                             {['A','B','C','D','E','F'].map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Nível</label>
                          <select className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as TrainingLevel})}>
                             <option value="Iniciante">Iniciante</option>
                             <option value="Intermediário">Interm.</option>
                             <option value="Avançado">Avançado</option>
                          </select>
                       </div>
                    </div>
                    <textarea placeholder="Observações e métodos..." className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-xs outline-none min-h-[140px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="pt-6 border-t border-slate-200">
                    <button onClick={() => setShowLibrary(!showLibrary)} className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                      📚 Biblioteca de Exercícios
                    </button>
                  </div>
               </div>
               <div className="flex-1 p-10 overflow-y-auto bg-white thin-scrollbar relative">
                  {showLibrary ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right">
                       <div className="flex justify-between items-center mb-6">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Explorar Biblioteca Técnica</h4>
                          <button onClick={() => setShowLibrary(false)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 px-4 py-2 rounded-xl hover:bg-rose-50">Cancelar</button>
                       </div>
                       <input 
                         type="text" 
                         placeholder="Pesquisar por nome ou categoria (ex: Pernas)..." 
                         className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none mb-8 focus:ring-2 focus:ring-indigo-500 transition-all"
                         value={librarySearch}
                         onChange={e => setLibrarySearch(e.target.value)}
                       />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredLibrary.map(libEx => (
                            <button 
                              key={libEx.name}
                              onClick={() => addFromLibrary(libEx)}
                              className="p-6 bg-white border border-slate-100 rounded-[2rem] text-left hover:border-indigo-400 hover:shadow-xl transition-all flex items-center gap-5 group"
                            >
                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{libEx.icon}</div>
                               <div className="flex-1">
                                  <p className="font-black text-slate-800 text-sm leading-tight">{libEx.name}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{libEx.category}</p>
                               </div>
                               <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-black text-xl">+</div>
                            </button>
                          ))}
                          {filteredLibrary.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-20">
                               <p className="text-xs font-black uppercase tracking-widest">Nenhum exercício encontrado</p>
                            </div>
                          )}
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {exercises.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center text-center opacity-20">
                           <span className="text-7xl mb-6">🖋️</span>
                           <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum exercício prescrito</p>
                           <p className="text-[10px] font-bold mt-2">Utilize a biblioteca lateral para adicionar movimentos</p>
                        </div>
                      ) : (
                        exercises.map((ex, idx) => (
                          <div key={ex.id} className="bg-slate-50/50 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col gap-8 group hover:border-indigo-200 transition-all animate-in slide-in-from-left">
                             <div className="flex items-center gap-6 w-full">
                                <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs">{idx + 1}</div>
                                <input type="text" className="flex-1 bg-transparent font-black text-slate-800 text-lg outline-none" value={ex.name} onChange={e => setExercises(exercises.map(item => item.id === ex.id ? { ...item, name: e.target.value } : item))} />
                                <div className="flex items-center gap-3">
                                  <select className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest" value={ex.stage} onChange={e => setExercises(exercises.map(item => item.id === ex.id ? { ...item, stage: e.target.value as ExerciseStage } : item))}>
                                     <option value="Preparação">Prep</option>
                                     <option value="Principal">Base</option>
                                     <option value="Finalização">Fim</option>
                                  </select>
                                  <button onClick={() => setExercises(exercises.filter(item => item.id !== ex.id))} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">🗑️</button>
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-6">
                                <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Séries</label>
                                   <input type="text" className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold text-sm text-center" value={ex.sets} onChange={e => setExercises(exercises.map(item => item.id === ex.id ? { ...item, sets: e.target.value } : item))} />
                                </div>
                                <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Repetições</label>
                                   <input type="text" className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold text-sm text-center" value={ex.reps} onChange={e => setExercises(exercises.map(item => item.id === ex.id ? { ...item, reps: e.target.value } : item))} />
                                </div>
                                <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Descanso</label>
                                   <input type="text" className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold text-sm text-center" value={ex.rest} onChange={e => setExercises(exercises.map(item => item.id === ex.id ? { ...item, rest: e.target.value } : item))} />
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
               </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
               <button onClick={handleSaveProgram} className="px-14 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-4">💾 Publicar Ficha de Treino</button>
            </div>
          </div>
        </div>
      )}

      {/* DETALHES DO TREINO (MODAL) */}
      {detailsProgram && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                   <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Treino {detailsProgram.splitLetter}</span>
                   <h3 className="text-2xl font-black text-slate-900 uppercase">{detailsProgram.title}</h3>
                </div>
                <button onClick={() => setDetailsProgram(null)} className="text-4xl text-slate-300 hover:text-rose-500">&times;</button>
             </div>
             <div className="p-10 overflow-y-auto thin-scrollbar space-y-8">
                {(['Preparação', 'Principal', 'Finalização'] as ExerciseStage[]).map(stage => {
                  const stageExercises = detailsProgram.exercises.filter(ex => ex.stage === stage);
                  if (stageExercises.length === 0) return null;
                  return (
                    <div key={stage} className="space-y-4">
                       <h5 className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-lg w-fit ${stage === 'Preparação' ? 'bg-amber-100 text-amber-600' : stage === 'Principal' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{stage}</h5>
                       <div className="grid grid-cols-1 gap-4">
                          {stageExercises.map(ex => (
                            <div key={ex.id} className="bg-slate-50 p-6 rounded-[2rem] flex justify-between items-center border border-slate-100">
                               <div>
                                  <p className="font-black text-slate-800 text-sm">{ex.name}</p>
                                  <div className="flex gap-4 mt-1">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">Sets: {ex.sets}</span>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">Reps: {ex.reps}</span>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">Rest: {ex.rest}</span>
                                  </div>
                               </div>
                               <div className="text-lg opacity-20">⚙️</div>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPrograms;

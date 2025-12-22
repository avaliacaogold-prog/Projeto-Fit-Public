
import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Evaluation, Client, EvaluationProtocol, Skinfolds, Perimeters, ProfessionalProfile } from '../types';
import { getAIInsights } from '../services/geminiService';
import { calculateBodyFat, calculateMetabolism, getIMCClassification, getBFClassification, getRCQ } from '../services/fitnessCalculations';

interface EvaluationSystemProps {
  clients: Client[];
  evaluations: Evaluation[];
  profile: ProfessionalProfile;
  onAddEvaluation: (evaluation: Evaluation) => void;
  onUpdateEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (id: string) => void;
}

const EVAL_STEPS = [
  { id: 'anamnesis', label: 'Anamnese', icon: '📝' },
  { id: 'clinical', label: 'Hemodinâmica', icon: '💓' },
  { id: 'composition', label: 'Antropometria', icon: '⚖️' },
  { id: 'perimeters', label: 'Perímetros', icon: '📏' },
  { id: 'review', label: 'Revisão e Salvar', icon: '💾' }
];

const EvaluationSystem: React.FC<EvaluationSystemProps> = ({ clients, evaluations, profile, onAddEvaluation, onUpdateEvaluation, onDeleteEvaluation }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeStep, setActiveStep] = useState('anamnesis');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null);
  const [viewingEval, setViewingEval] = useState<Evaluation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState: Partial<Evaluation> = {
    date: new Date().toISOString().split('T')[0],
    protocol: 'Pollock7',
    weight: 0,
    height: 0,
    skinfolds: { triceps: 0, biceps: 0, subscapular: 0, suprailiac: 0, abdominal: 0, chest: 0, thigh: 0, midaxillary: 0, calf: 0 },
    perimeters: { waist: 0, hips: 0, abdomen: 0, chest: 0, arm: 0, armFlexed: 0, forearm: 0, neck: 0, shoulders: 0, thigh: 0, thighProximal: 0, calf: 0 },
    anamnesis: { medicalHistory: '', medications: '', allergies: '', sleepQuality: 'Boa', waterIntake: 2, isSmoker: false, alcoholConsumption: 'Nenhum', lifestyle: 'Moderado', injuries: '' },
    clinical: { bloodPressure: '120/80', metabolicSyndromeRisk: false, fastingGlucose: 0, restingHR: 0, totalCholesterol: 0 },
    notes: ''
  };

  const [formData, setFormData] = useState<Partial<Evaluation>>(initialFormState);

  const client = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const clientAge = useMemo(() => {
    if (!client) return 0;
    const birth = new Date(client.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }, [client]);

  // Cálculo de resultados em tempo real para o resumo
  const liveResults = useMemo(() => {
    if (!formData.weight || !client) return null;
    const bf = calculateBodyFat(formData.protocol as EvaluationProtocol, formData.skinfolds as Skinfolds, clientAge, client.gender, formData.weight, formData.height || 0, formData.perimeters);
    const fatMass = (formData.weight * bf) / 100;
    const leanMass = formData.weight - fatMass;
    const { bmr, tdee } = calculateMetabolism(formData.weight, formData.height || 0, clientAge, client.gender, leanMass);
    return { bf, fatMass, leanMass, bmr, tdee };
  }, [formData, client, clientAge]);

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof Evaluation] as any), [field]: value }
    }));
  };

  const handleOpenNew = () => {
    if (!selectedClientId) return;
    setEditingEvalId(null);
    setFormData(initialFormState);
    setActiveStep('anamnesis');
    setIsFormOpen(true);
    setViewingEval(null);
  };

  const handleOpenEdit = (ev: Evaluation) => {
    setEditingEvalId(ev.id);
    setFormData({ ...ev });
    setActiveStep('anamnesis');
    setIsFormOpen(true);
    setViewingEval(null);
  };

  const handleSave = async () => {
    if (!client || !liveResults) return alert("Dados insuficientes para calcular o diagnóstico.");
    setIsSaving(true);
    
    try {
      const finalEval: Evaluation = {
        ...(formData as Evaluation),
        id: editingEvalId || Math.random().toString(36).substr(2, 9),
        clientId: selectedClientId,
        ageAtEvaluation: clientAge,
        bodyFat: liveResults.bf,
        leanMass: liveResults.leanMass,
        fatMass: liveResults.fatMass,
        bmr: liveResults.bmr,
        tdee: liveResults.tdee
      };

      // Gera Insight de IA apenas se for novo ou solicitado (simplificado para economia de tokens)
      if (!finalEval.aiInsight || editingEvalId) {
        const insight = await getAIInsights(finalEval, client, evaluations.filter(e => e.clientId === client.id && e.id !== editingEvalId));
        finalEval.aiInsight = insight;
      }

      if (editingEvalId) {
        onUpdateEvaluation(finalEval);
      } else {
        onAddEvaluation(finalEval);
      }

      setIsFormOpen(false);
      setViewingEval(finalEval);
    } catch (error) {
      alert("Erro ao salvar avaliação. Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const compositionData = useMemo(() => {
    if (!viewingEval) return [];
    return [
      { name: 'Massa Magra', value: viewingEval.leanMass, color: '#10b981' },
      { name: 'Massa Gorda', value: viewingEval.fatMass, color: '#6366f1' }
    ];
  }, [viewingEval]);

  return (
    <div className="space-y-8">
      {/* Header Select Aluno */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">📋</div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Avaliações Físicas</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Histórico e Evolução do Aluno</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="flex-1 md:w-72 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">Selecione um Aluno...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            onClick={handleOpenNew}
            disabled={!selectedClientId}
            className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedClientId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
          >
            Nova Avaliação
          </button>
        </div>
      </div>

      {/* Grid de Avaliações */}
      {!selectedClientId ? (
        <div className="py-24 text-center opacity-30">
          <span className="text-6xl">🔍</span>
          <p className="mt-4 font-black uppercase text-xs tracking-[0.3em]">Selecione um aluno para visualizar o histórico</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
          {evaluations.filter(e => e.clientId === selectedClientId).length === 0 ? (
             <div className="col-span-full py-16 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhuma avaliação registrada para este aluno</p>
             </div>
          ) : (
            evaluations.filter(e => e.clientId === selectedClientId).map(ev => (
              <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-500 transition-all cursor-pointer group flex flex-col shadow-sm relative overflow-hidden" onClick={() => setViewingEval(ev)}>
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="flex justify-between items-start mb-8 z-10">
                    <div className="px-4 py-2 bg-slate-900 text-white rounded-xl">
                       <p className="text-[10px] font-black uppercase tracking-widest">{new Date(ev.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(ev); }} className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">✏️</button>
                       <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir esta avaliação permanentemente?')) onDeleteEvaluation(ev.id); }} className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all">🗑️</button>
                    </div>
                 </div>
                 <h4 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">Gordura: {ev.bodyFat.toFixed(1)}%</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Peso</p>
                       <p className="text-sm font-black text-slate-700">{ev.weight} kg</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Prot.</p>
                       <p className="text-sm font-black text-slate-700">{ev.protocol}</p>
                    </div>
                 </div>
                 <button className="mt-8 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">Ver Laudo Completo →</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL FORMULÁRIO WORKFLOW */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            {/* Header Modal */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl">🖋️</div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingEvalId ? 'Editar Avaliação' : 'Nova Avaliação Técnica'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{client?.name} | {clientAge} anos</p>
                 </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-300 hover:text-rose-500 text-5xl">&times;</button>
            </div>

            {/* Steps Navigation */}
            <div className="flex bg-slate-50 border-b border-slate-100 px-8 py-4 overflow-x-auto no-scrollbar">
              {EVAL_STEPS.map(step => (
                <button 
                  key={step.id} 
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all mr-4 whitespace-nowrap ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="text-lg">{step.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>
                </button>
              ))}
            </div>

            {/* Conteúdo Dinâmico por Step */}
            <div className="flex-1 overflow-y-auto p-10 thin-scrollbar">
              <div className="max-w-4xl mx-auto">
                {activeStep === 'anamnesis' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputGroup label="Data da Avaliação" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                       <InputGroup label="Qualidade do Sono" value={formData.anamnesis?.sleepQuality} onChange={v => updateNestedField('anamnesis', 'sleepQuality', v)} />
                       <InputGroup label="Hidratação (L/dia)" type="number" value={formData.anamnesis?.waterIntake} onChange={v => updateNestedField('anamnesis', 'waterIntake', Number(v))} />
                       <InputGroup label="Estilo de Vida" value={formData.anamnesis?.lifestyle} onChange={v => updateNestedField('anamnesis', 'lifestyle', v)} />
                    </div>
                    <div className="space-y-6">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Histórico Médico e Lesões</label>
                       <textarea className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]" value={formData.anamnesis?.medicalHistory} onChange={e => updateNestedField('anamnesis', 'medicalHistory', e.target.value)} placeholder="Descreva condições preexistentes, cirurgias ou dores..." />
                    </div>
                  </div>
                )}

                {activeStep === 'clinical' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputGroup label="Pressão Arterial (mmHg)" placeholder="Ex: 120/80" value={formData.clinical?.bloodPressure} onChange={v => updateNestedField('clinical', 'bloodPressure', v)} />
                       <InputGroup label="FC em Repouso (bpm)" type="number" value={formData.clinical?.restingHR} onChange={v => updateNestedField('clinical', 'restingHR', Number(v))} />
                       <InputGroup label="Glicemia de Jejum (mg/dL)" type="number" value={formData.clinical?.fastingGlucose} onChange={v => updateNestedField('clinical', 'fastingGlucose', Number(v))} />
                       <InputGroup label="Colesterol Total" type="number" value={formData.clinical?.totalCholesterol} onChange={v => updateNestedField('clinical', 'totalCholesterol', Number(v))} />
                    </div>
                  </div>
                )}

                {activeStep === 'composition' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-indigo-50 rounded-[3rem] border border-indigo-100">
                       <InputGroup label="Protocolo Antropométrico" type="select" value={formData.protocol} onChange={v => setFormData({...formData, protocol: v as EvaluationProtocol})} options={['Pollock7', 'Pollock3', 'Guedes', 'Petroski', 'Faulkner', 'Weltman']} />
                       <InputGroup label="Peso (kg)" type="number" value={formData.weight} onChange={v => setFormData({...formData, weight: Number(v)})} />
                       <InputGroup label="Estatura (cm)" type="number" value={formData.height} onChange={v => setFormData({...formData, height: Number(v)})} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                       {formData.protocol !== 'Weltman' && Object.keys(formData.skinfolds || {}).map(fold => (
                         <div key={fold}>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{fold}</label>
                            <input 
                              type="number" 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                              value={(formData.skinfolds as any)?.[fold]}
                              onChange={e => updateNestedField('skinfolds', fold, Number(e.target.value))}
                            />
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeStep === 'perimeters' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {Object.keys(formData.perimeters || {}).map(p => (
                      <div key={p}>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{p}</label>
                         <input 
                           type="number" 
                           className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                           value={(formData.perimeters as any)?.[p]}
                           onChange={e => updateNestedField('perimeters', p, Number(e.target.value))}
                         />
                      </div>
                    ))}
                  </div>
                )}

                {activeStep === 'review' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-9xl">🔬</div>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">Prévia do Diagnóstico</h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">BF Projetado</p>
                             <p className="text-4xl font-black text-white">{liveResults?.bf.toFixed(1)}%</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Massa Magra</p>
                             <p className="text-4xl font-black text-white">{liveResults?.leanMass.toFixed(1)}kg</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Gasto Diário</p>
                             <p className="text-4xl font-black text-white">{liveResults?.tdee.toFixed(0)} <span className="text-xs text-slate-500 font-bold">kcal</span></p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peso Gordura</p>
                             <p className="text-4xl font-black text-white">{liveResults?.fatMass.toFixed(1)}kg</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                       <p className="text-sm font-bold text-slate-400 mb-4">Deseja adicionar alguma observação técnica final ao laudo?</p>
                       <textarea className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Observações..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                    </div>

                    <div className="flex justify-center pt-8">
                       <button 
                         onClick={handleSave} 
                         disabled={isSaving}
                         className={`px-24 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-4 ${isSaving ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
                       >
                         {isSaving ? 'Processando Inteligência Artificial...' : '💾 Finalizar e Salvar Avaliação'}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer de Navegação Steps */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between">
              <button 
                onClick={() => {
                   const currentIndex = EVAL_STEPS.findIndex(s => s.id === activeStep);
                   if (currentIndex > 0) setActiveStep(EVAL_STEPS[currentIndex - 1].id);
                }}
                disabled={activeStep === EVAL_STEPS[0].id}
                className="px-10 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
              >
                ← Voltar
              </button>
              <button 
                onClick={() => {
                   const currentIndex = EVAL_STEPS.findIndex(s => s.id === activeStep);
                   if (currentIndex < EVAL_STEPS.length - 1) setActiveStep(EVAL_STEPS[currentIndex + 1].id);
                   else handleSave();
                }}
                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl"
              >
                {activeStep === 'review' ? 'Salvar' : 'Próxima Etapa →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAUDO FINAL (Preexistente e Reintegrado) */}
      {viewingEval && !isFormOpen && (
        <div className="fixed inset-0 bg-white z-[300] overflow-y-auto thin-scrollbar animate-in slide-in-from-right duration-500 print-full-page">
           <div className="max-w-5xl mx-auto w-full p-8 md:p-16 space-y-16 print:p-0 print:space-y-12">
              
              <div className="flex flex-col md:flex-row justify-between items-start border-b-[10px] border-slate-900 pb-12 gap-8 print:pb-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-6 mb-4">
                      {profile.logoUrl && <img src={profile.logoUrl} className="h-16 w-auto object-contain print:h-12" alt="Logo" />}
                      <div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] print:text-5xl">RELATÓRIO DE<br/><span className="text-indigo-600">PERFORMANCE</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Por: {profile.name} (CREF {profile.cref})</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                       <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{client?.name}</span>
                       <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Protocolo: {viewingEval.protocol}</span>
                       <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Data: {new Date(viewingEval.date).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <div className="flex gap-4 no-print">
                   <button onClick={() => handleOpenEdit(viewingEval)} className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl hover:bg-indigo-100 transition-colors font-black text-xs uppercase">Editar Dados</button>
                   <button onClick={() => setViewingEval(null)} className="p-5 bg-slate-50 text-slate-400 rounded-3xl hover:bg-slate-100 text-2xl leading-none">✕</button>
                 </div>
              </div>

              {/* Seção 1: Composição Corporal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center print:gap-10">
                 <div className="space-y-8 print:space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                       <div className="w-10 h-[2px] bg-indigo-600"></div> Composição Corporal
                    </h2>
                    <div className="grid grid-cols-2 gap-6 print:gap-4">
                       <MetricCard label="Gordura Corporal" value={`${viewingEval.bodyFat.toFixed(1)}%`} status={getBFClassification(viewingEval.bodyFat, client?.gender || 'M').status} color={getBFClassification(viewingEval.bodyFat, client?.gender || 'M').color} />
                       <MetricCard label="IMC" value={getIMCClassification(viewingEval.weight, viewingEval.height).value.toFixed(1)} status={getIMCClassification(viewingEval.weight, viewingEval.height).status} color={getIMCClassification(viewingEval.weight, viewingEval.height).color} />
                       <MetricCard label="Massa Magra" value={`${viewingEval.leanMass.toFixed(1)}kg`} sub="Tecido Ativo" />
                       <MetricCard label="Massa Gorda" value={`${viewingEval.fatMass.toFixed(1)}kg`} sub="Reserva Adiposa" />
                    </div>
                 </div>
                 <div className="h-80 w-full bg-slate-50 rounded-[4rem] p-10 relative overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner print:h-64 print:rounded-3xl">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={compositionData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                             {compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso Total</p>
                       <p className="text-3xl font-black text-slate-900 leading-none">{viewingEval.weight}kg</p>
                    </div>
                 </div>
              </div>

              {/* Seção 2: Saúde & Mapa Perimétrico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 print:gap-10">
                 <div className="space-y-8 print:space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                       <div className="w-10 h-[2px] bg-indigo-600"></div> Hemodinâmica & Saúde
                    </h2>
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 space-y-8 shadow-sm print:rounded-3xl print:p-6 print:space-y-4">
                       <ClinicalRow label="Pressão Arterial" value={viewingEval.clinical?.bloodPressure || 'N/A'} refVal="120/80 mmHg" />
                       <ClinicalRow label="FC Repouso" value={`${viewingEval.clinical?.restingHR || 0} bpm`} refVal="60-80 bpm" />
                       <ClinicalRow label="RCQ (Cint/Quad)" value={getRCQ(viewingEval.perimeters.waist, viewingEval.perimeters.hips, client?.gender || 'M')?.value.toFixed(2) || 'N/A'} refVal={client?.gender === 'M' ? '< 0.95' : '< 0.85'} badge={getRCQ(viewingEval.perimeters.waist, viewingEval.perimeters.hips, client?.gender || 'M')?.status} color={getRCQ(viewingEval.perimeters.waist, viewingEval.perimeters.hips, client?.gender || 'M')?.color} />
                       <ClinicalRow label="Metabolismo (BMR)" value={`${viewingEval.bmr.toFixed(0)} kcal`} refVal="Energia Basal" />
                    </div>
                 </div>

                 <div className="space-y-8 print:space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                       <div className="w-10 h-[2px] bg-indigo-600"></div> Mapa Perimétrico (Circunferências)
                    </h2>
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl print:rounded-3xl print:p-8">
                       <div className="grid grid-cols-2 gap-x-12 gap-y-4 print:gap-x-8 print:gap-y-2">
                          <PerimeterLine label="Pescoço" value={viewingEval.perimeters.neck} />
                          <PerimeterLine label="Ombros" value={viewingEval.perimeters.shoulders} />
                          <PerimeterLine label="Tórax" value={viewingEval.perimeters.chest} />
                          <PerimeterLine label="Braço Relax" value={viewingEval.perimeters.arm} />
                          <PerimeterLine label="Braço Contr" value={viewingEval.perimeters.armFlexed} />
                          <PerimeterLine label="Antebraço" value={viewingEval.perimeters.forearm} />
                          <PerimeterLine label="Cintura" value={viewingEval.perimeters.waist} />
                          <PerimeterLine label="Abdômen" value={viewingEval.perimeters.abdomen} />
                          <PerimeterLine label="Quadril" value={viewingEval.perimeters.hips} />
                          <PerimeterLine label="Coxa Prox." value={viewingEval.perimeters.thighProximal} />
                          <PerimeterLine label="Coxa Méd." value={viewingEval.perimeters.thigh} />
                          <PerimeterLine label="Panturrilha" value={viewingEval.perimeters.calf} />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Seção 3: Análise IA */}
              <div className="bg-indigo-50 p-12 rounded-[4rem] border border-indigo-100 relative overflow-hidden shadow-sm print:rounded-3xl print:p-8">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">Diagnóstico IA Evolutivo</h4>
                 <p className="text-slate-800 font-medium text-xl leading-relaxed italic opacity-90 print:text-lg">"{viewingEval.aiInsight || "Análise evolutiva processada via inteligência de dados."}"</p>
              </div>

              {/* Rodapé Laudo - Identidade Profissional */}
              <div className="pt-16 mt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 print:pt-8 print:mt-4">
                 <div className="text-center md:text-left">
                   <p className="text-[10px] font-black uppercase text-slate-800 tracking-widest">{profile.name}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{profile.address}</p>
                 </div>
                 <div className="text-center md:text-right">
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{profile.phone} | {profile.email}</p>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">VitalMetric Pro Certified</p>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 no-print pt-8">
                 <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-all shadow-xl">Exportar Laudo (PDF)</button>
                 <button onClick={() => setViewingEval(null)} className="flex-1 bg-white border-2 border-slate-200 text-slate-400 py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">Fechar Relatório</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", placeholder, options }: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{label}</label>
    {type === 'select' ? (
      <select 
        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    )}
  </div>
);

// Subcomponentes visuais
const MetricCard = ({ label, value, status, color, sub }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center print:p-4 print:rounded-2xl">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <div className="flex items-baseline gap-3">
        <p className="text-3xl font-black text-slate-900 leading-none print:text-2xl">{value}</p>
        {status && <span className="text-[8px] font-black uppercase px-2 py-1 rounded-full text-white" style={{backgroundColor: color}}>{status}</span>}
     </div>
     {sub && <p className="text-[8px] font-bold text-slate-300 uppercase mt-2">{sub}</p>}
  </div>
);

const ClinicalRow = ({ label, value, refVal, badge, color }: any) => (
  <div className="flex justify-between items-center group border-b border-slate-50 pb-4 last:border-0 last:pb-0 print:pb-2">
     <div>
        <p className="text-sm font-black text-slate-800 print:text-xs">{label}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ref: {refVal}</p>
     </div>
     <div className="text-right flex items-center gap-3">
        <p className="text-lg font-black text-slate-900 print:text-base">{value}</p>
        {badge && <span className="text-[8px] font-black px-3 py-1 rounded-full text-white uppercase" style={{backgroundColor: color}}>{badge}</span>}
     </div>
  </div>
);

const PerimeterLine = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-2.5 border-b border-white/5 print:py-1.5">
     <span className="text-[10px] font-black uppercase text-white/50">{label}</span>
     <span className="text-sm font-black text-indigo-300 print:text-xs">{value || '0'} cm</span>
  </div>
);

export default EvaluationSystem;

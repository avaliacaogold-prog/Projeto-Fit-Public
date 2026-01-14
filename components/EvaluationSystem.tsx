
import React, { useState, useEffect, useMemo } from 'react';
import { Evaluation, Client, EvaluationProtocol, Skinfolds, Perimeters, ProfessionalProfile, TrainingProgram } from '../types';
import { getAIInsights, getSuggestedTraining } from '../services/geminiService';
import { calculateBodyFat, calculateVO2Max, getVO2Classification, calculateAge, calculateSomatotype, calculateTDEE } from '../services/fitnessCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EvaluationSystemProps {
  clients: Client[];
  evaluations: Evaluation[];
  profile: ProfessionalProfile;
  onAddEvaluation: (evaluation: Evaluation) => void;
  onUpdateEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (id: string) => void;
  onAddTrainingProgram?: (program: TrainingProgram) => void;
}

const STEPS = [
  { id: 'anamnesis', label: 'Anamnese', icon: '🩺' },
  { id: 'clinical', label: 'Clínico', icon: '💓' },
  { id: 'anthropometry', label: 'Antropometria', icon: '📏' },
  { id: 'functional', label: 'Funcional', icon: '🏃' },
  { id: 'review', label: 'Laudo', icon: '📄' }
];

const SKINFOLD_LABELS: Record<string, string> = {
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  subscapular: 'Subescapular',
  suprailiac: 'Supra-ilíaca',
  abdominal: 'Abdominal',
  chest: 'Peitoral',
  thigh: 'Coxa',
  midaxillary: 'Axilar Média',
  calf: 'Panturrilha'
};

const PERIMETER_LABELS: Record<string, string> = {
  waist: 'Cintura',
  hips: 'Quadril',
  abdomen: 'Abdômen',
  chest: 'Tórax',
  arm: 'Braço Relaxado',
  armFlexed: 'Braço Contraído',
  forearm: 'Antebraço',
  neck: 'Pescoço',
  shoulders: 'Ombros',
  thigh: 'Coxa (Média)',
  thighProximal: 'Coxa (Proximal)',
  calf: 'Panturrilha'
};

const CustomVO2Tooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 animate-in zoom-in duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-black text-slate-800">{data.vo2.toFixed(1)}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">ml/kg/min</span>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${data.vo2 > 45 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{data.classification}</p>
        </div>
      </div>
    );
  }
  return null;
};

const EvaluationSystem: React.FC<EvaluationSystemProps> = ({ clients, evaluations, profile, onAddEvaluation, onUpdateEvaluation, onDeleteEvaluation, onAddTrainingProgram }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeStep, setActiveStep] = useState('anamnesis');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null);
  const [viewingEval, setViewingEval] = useState<Evaluation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingTraining, setIsGeneratingTraining] = useState(false);

  // Estados locais para bioimpedância
  const [bioFatPercent, setBioFatPercent] = useState(0);
  const [bioVisceralFat, setBioVisceralFat] = useState(0);
  const [bioWaterPercent, setBioWaterPercent] = useState(0);
  const [bioExtraNotes, setBioExtraNotes] = useState('');

  const initialFormState: Partial<Evaluation> = {
    date: new Date().toISOString().split('T')[0],
    protocol: 'Pollock7',
    weight: 0,
    height: 0,
    skinfolds: { triceps: 0, biceps: 0, subscapular: 0, suprailiac: 0, abdominal: 0, chest: 0, thigh: 0, midaxillary: 0, calf: 0 },
    perimeters: { waist: 0, hips: 0, abdomen: 0, chest: 0, arm: 0, armFlexed: 0, forearm: 0, neck: 0, shoulders: 0, thigh: 0, thighProximal: 0, calf: 0 },
    anamnesis: { medicalHistory: '', medications: '', allergies: '', sleepQuality: 'Boa', waterIntake: 2, isSmoker: false, alcoholConsumption: 'Nenhum', lifestyle: 'Moderado', injuries: '' },
    clinical: { bloodPressure: '120/80', restingHR: 70, riskFactors: [], acsmRiskStratification: 'Baixo' },
    functional: { vo2Protocol: 'Cooper', vo2Max: 0, testValue: 0, hrFinal: 0, flexibilityTest: '', pushUpTest: 0 },
    notes: ''
  };

  const [formData, setFormData] = useState<Partial<Evaluation>>(initialFormState);
  const client = clients.find(c => c.id === selectedClientId || c.id === viewingEval?.clientId);

  const handleEdit = (ev: Evaluation) => {
    setFormData(ev);
    setEditingEvalId(ev.id);
    setSelectedClientId(ev.clientId);
    setBioFatPercent(ev.protocol === 'Bioimpedance' ? ev.bodyFat : 0);
    // Tenta extrair notas de bioimpedância se existirem
    if (ev.protocol === 'Bioimpedance' && ev.notes.includes('[Bioimpedância]')) {
        const parts = ev.notes.split('Observações Adicionais:');
        if (parts.length > 1) {
            setBioExtraNotes(parts[1].trim());
        }
    } else {
        setBioExtraNotes('');
    }
    setIsFormOpen(true);
    setActiveStep('anamnesis');
  };

  const generateTraining = async () => {
    if (!viewingEval || !client || !onAddTrainingProgram) return;
    setIsGeneratingTraining(true);
    try {
      const suggested = await getSuggestedTraining(viewingEval, client);
      if (suggested) {
        const newProgram: TrainingProgram = {
          id: Math.random().toString(36).substr(2, 9),
          clientId: client.id,
          clientName: client.name,
          title: suggested.title,
          level: suggested.level,
          splitType: client.targetSplit || 'ABC',
          splitLetter: 'A',
          description: suggested.description,
          exercises: suggested.exercises.map((ex: any) => ({
            ...ex,
            id: Math.random().toString(36).substr(2, 9)
          })),
          createdAt: new Date().toISOString()
        };
        onAddTrainingProgram(newProgram);
        alert("Programa de treinamento sugerido pela IA gerado com sucesso! Você pode visualizá-lo na aba de Prescrição.");
      }
    } catch (error) {
      console.error(error);
      alert("Houve um erro técnico ao processar a prescrição via inteligência artificial.");
    } finally {
      setIsGeneratingTraining(false);
    }
  };

  const handleSave = async () => {
    if (!client) return alert("Selecione um paciente.");
    setIsCalculating(true);
    
    try {
      const age = calculateAge(client.birthDate, formData.date);
      const sf = formData.skinfolds as Skinfolds;
      const pm = formData.perimeters as Perimeters;
      
      let bf = 0;
      if (formData.protocol === 'Bioimpedance') {
        bf = bioFatPercent;
      } else {
        bf = calculateBodyFat(
          formData.protocol as EvaluationProtocol, 
          sf, 
          age, 
          client.gender, 
          formData.weight || 0, 
          formData.height || 0, 
          pm
        );
      }

      const vo2Max = calculateVO2Max(
        formData.functional?.vo2Protocol || 'Cooper',
        formData.functional?.testValue || 0,
        age,
        formData.weight || 0,
        client.gender,
        formData.functional?.hrFinal
      );

      const somato = calculateSomatotype(sf, pm, formData.height || 170, formData.weight || 70);
      
      const bmr = client.gender === 'M' 
          ? (10 * (formData.weight || 0)) + (6.25 * (formData.height || 0)) - (5 * age) + 5
          : (10 * (formData.weight || 0)) + (6.25 * (formData.height || 0)) - (5 * age) - 161;

      const tdee = calculateTDEE(bmr, formData.anamnesis?.lifestyle || 'Moderado');

      const bioNotes = formData.protocol === 'Bioimpedance' 
        ? `\n[Bioimpedância] Gordura Visceral: ${bioVisceralFat} | Água Corporal: ${bioWaterPercent}% | Observações Adicionais: ${bioExtraNotes}` 
        : '';

      const finalEval: Evaluation = {
        ...(formData as Evaluation),
        id: editingEvalId || Math.random().toString(36).substr(2, 9),
        clientId: selectedClientId,
        ageAtEvaluation: age,
        bodyFat: bf,
        leanMass: (formData.weight || 0) * (1 - bf/100),
        fatMass: (formData.weight || 0) * (bf/100),
        bmr: bmr,
        tdee: tdee,
        somatotype: somato,
        functional: { 
          ...formData.functional, 
          vo2Max, 
          vo2Classification: getVO2Classification(vo2Max, age, client.gender).status 
        },
        notes: (formData.notes || '') + bioNotes
      };

      if (!editingEvalId) {
        finalEval.aiInsight = await getAIInsights(finalEval, client, evaluations.filter(e => e.clientId === client.id));
        onAddEvaluation(finalEval);
      } else {
        onUpdateEvaluation(finalEval);
      }

      setIsFormOpen(false);
      setEditingEvalId(null);
      setViewingEval(finalEval);
      setBioExtraNotes('');
    } catch (error) {
      alert("Erro ao salvar avaliação. Verifique os dados inseridos.");
    } finally {
      setIsCalculating(false);
    }
  };

  const visibleFolds = useMemo(() => {
    const p = formData.protocol;
    const g = client?.gender;
    
    if (p === 'Bioimpedance') return [];
    if (p === 'Pollock7') return ['chest', 'midaxillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'];
    if (p === 'Pollock3') return g === 'M' ? ['chest', 'abdominal', 'thigh'] : ['triceps', 'suprailiac', 'thigh'];
    if (p === 'Guedes') return g === 'M' ? ['triceps', 'suprailiac', 'abdominal'] : ['triceps', 'suprailiac', 'thigh'];
    if (p === 'Faulkner') return ['triceps', 'subscapular', 'suprailiac', 'abdominal'];
    if (p === 'Petroski') return ['subscapular', 'triceps', 'suprailiac', 'calf'];
    
    return Object.keys(formData.skinfolds || {});
  }, [formData.protocol, client?.gender]);

  const vo2HistoryData = useMemo(() => {
    if (!selectedClientId) return [];
    return evaluations
      .filter(e => e.clientId === selectedClientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
        vo2: e.functional.vo2Max || 0,
        classification: e.functional.vo2Classification || '---'
      }));
  }, [selectedClientId, evaluations]);

  return (
    <div className="space-y-8">
      {/* Header Ações */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">📈</div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Avaliações Bioestatísticas</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de Performance Baseada em Evidências</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:w-64 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">Filtrar por Aluno...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            disabled={!selectedClientId}
            onClick={() => { setFormData(initialFormState); setEditingEvalId(null); setIsFormOpen(true); }}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 hover:bg-indigo-600 transition-all shadow-xl"
          >
            + Nova Avaliação
          </button>
        </div>
      </div>

      {/* Grid Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluations.filter(e => !selectedClientId || e.clientId === selectedClientId).map(ev => (
          <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-600 transition-all group shadow-sm hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2 no-print opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => { e.stopPropagation(); handleEdit(ev); }} className="p-3 bg-white rounded-xl shadow-md text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all border border-slate-100">✏️</button>
               <button onClick={(e) => { e.stopPropagation(); onDeleteEvaluation(ev.id); }} className="p-3 bg-white rounded-xl shadow-md text-slate-400 hover:text-rose-500 hover:scale-110 transition-all border border-slate-100">🗑️</button>
            </div>
            <div onClick={() => setViewingEval(ev)} className="cursor-pointer space-y-6">
                <div className="flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(ev.date).toLocaleDateString('pt-BR')}</span>
                      <p className="font-black text-slate-800 text-sm">{clients.find(c => c.id === ev.clientId)?.name}</p>
                   </div>
                   <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg ${ev.bodyFat < 20 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>Gordura {ev.bodyFat.toFixed(1)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">VO2 Máximo</p>
                      <p className="text-lg font-black text-slate-800 leading-none">{ev.functional.vo2Max?.toFixed(1) || '---'}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Gasto Diário</p>
                      <p className="text-lg font-black text-slate-800 leading-none">{ev.tdee.toFixed(0)} <span className="text-[8px]">kcal</span></p>
                   </div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Protocolo: {ev.protocol}</span>
                   <span className="text-[9px] font-black text-indigo-500 uppercase">Ver Laudo Completo →</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-white/20">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">💉</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingEvalId ? 'Retificar Avaliação' : 'Novo Diagnóstico Científico'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-300 hover:text-rose-500 text-5xl leading-none">&times;</button>
             </div>

             <div className="flex bg-white border-b border-slate-100 overflow-x-auto no-scrollbar px-6 py-4">
                {STEPS.map(s => (
                  <button key={s.id} onClick={() => setActiveStep(s.id)} className={`flex items-center gap-3 px-8 py-3 rounded-2xl transition-all mr-4 whitespace-nowrap ${activeStep === s.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <span>{s.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-12 thin-scrollbar bg-[#FDFDFD]">
                <div className="max-w-4xl mx-auto space-y-12">
                   {activeStep === 'anamnesis' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputBox label="Histórico Médico e Cardiovascular" placeholder="Ex: Hipertensão, diabetes, cirurgias pregressas..." textarea value={formData.anamnesis?.medicalHistory} onChange={v => setFormData({...formData, anamnesis: {...formData.anamnesis!, medicalHistory: v}})} />
                        <div className="space-y-6">
                           <div className="w-full">
                              <label className="text-[10px] font-black text-slate-400 uppercase block ml-2 mb-2 tracking-widest">Estilo de Vida (NAF)</label>
                              <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={formData.anamnesis?.lifestyle} onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis!, lifestyle: e.target.value}})}>
                                 <option value="Sedentário">Sedentário (1.2)</option>
                                 <option value="Levemente Ativo">Levemente Ativo (1.375)</option>
                                 <option value="Moderado">Moderado (1.55)</option>
                                 <option value="Ativo">Ativo (1.725)</option>
                                 <option value="Muito Ativo">Muito Ativo (1.9)</option>
                              </select>
                           </div>
                           <InputBox label="Lesões e Limitações Físicas" placeholder="Ex: Hérnia de disco L4-L5, condromalácia..." value={formData.anamnesis?.injuries} onChange={v => setFormData({...formData, anamnesis: {...formData.anamnesis!, injuries: v}})} />
                        </div>
                     </div>
                   )}

                   {activeStep === 'clinical' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <InputGroup label="Pressão Arterial (PAS/PAD)" placeholder="120/80 mmHg" value={formData.clinical?.bloodPressure} onChange={v => setFormData({...formData, clinical: {...formData.clinical!, bloodPressure: v}})} />
                        <InputGroup label="Frequência Cardíaca de Repouso (BPM)" type="number" value={formData.clinical?.restingHR} onChange={v => setFormData({...formData, clinical: {...formData.clinical!, restingHR: Number(v)}})} />
                     </div>
                   )}

                   {activeStep === 'anthropometry' && (
                     <div className="space-y-12">
                        <div className="grid grid-cols-3 gap-8 p-10 bg-indigo-50/50 rounded-[3rem] border border-indigo-100/50 shadow-inner">
                           <InputGroup label="Peso Corporal (kg)" type="number" value={formData.weight} onChange={v => setFormData({...formData, weight: Number(v)})} />
                           <InputGroup label="Estatura (cm)" type="number" value={formData.height} onChange={v => setFormData({...formData, height: Number(v)})} />
                           <div className="w-full">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Protocolo de Dobras</label>
                              <select 
                                className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-xs shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                                value={formData.protocol} 
                                onChange={e => setFormData({...formData, protocol: e.target.value as any})}
                              >
                                 <option value="Pollock7">Pollock (7 Dobras)</option>
                                 <option value="Pollock3">Pollock (3 Dobras)</option>
                                 <option value="Guedes">Guedes (3 Dobras)</option>
                                 <option value="Faulkner">Faulkner (4 Dobras)</option>
                                 <option value="Petroski">Petroski (4 Dobras)</option>
                                 <option value="Bioimpedance">Bioimpedância (Digital)</option>
                              </select>
                           </div>
                        </div>

                        {formData.protocol === 'Bioimpedance' ? (
                          <div className="space-y-10 animate-in fade-in slide-in-from-top duration-300">
                             <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] border-b border-emerald-100 pb-3 flex items-center gap-4">
                               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Dados do Equipamento Bioimpedância
                             </h5>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <InputGroup label="% Gordura Corporal" type="number" value={bioFatPercent} onChange={v => setBioFatPercent(Number(v))} />
                                <InputGroup label="Nível Gordura Visceral" type="number" value={bioVisceralFat} onChange={v => setBioVisceralFat(Number(v))} />
                                <InputGroup label="% Água Corporal" type="number" value={bioWaterPercent} onChange={v => setBioWaterPercent(Number(v))} />
                             </div>
                             <div className="mt-4">
                                <InputBox 
                                    label="Observações Específicas dos Resultados do Exame" 
                                    placeholder="Descreva detalhes como nível de hidratação no momento do teste, marca da balança, ou impedância segmentada..." 
                                    textarea 
                                    value={bioExtraNotes} 
                                    onChange={v => setBioExtraNotes(v)} 
                                />
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase italic">* Os demais indicadores (Massa Magra, TMB) serão calculados automaticamente com base no peso e gordura informados.</p>
                          </div>
                        ) : (
                          <div className="space-y-10">
                             <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] border-b border-indigo-100 pb-3 flex items-center gap-4">
                               <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Dobras Cutâneas (mm)
                             </h5>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {visibleFolds.map(fold => (
                                  <InputGroup key={fold} label={SKINFOLD_LABELS[fold]} type="number" value={(formData.skinfolds as any)?.[fold]} onChange={v => setFormData({...formData, skinfolds: {...formData.skinfolds!, [fold]: Number(v)}})} />
                                ))}
                             </div>
                          </div>
                        )}

                        <div className="space-y-10">
                           <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] border-b border-indigo-100 pb-3 flex items-center gap-4 mt-12">
                             <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Perímetros Corporais (cm)
                           </h5>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {Object.keys(formData.perimeters || {}).map(p => (
                                <InputGroup key={p} label={PERIMETER_LABELS[p]} type="number" value={(formData.perimeters as any)?.[p]} onChange={v => setFormData({...formData, perimeters: {...formData.perimeters!, [p]: Number(v)}})} />
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {activeStep === 'functional' && (
                     <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                              <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest">Avaliação Cardiovascular</label>
                              <select className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-xs" value={formData.functional?.vo2Protocol} onChange={e => setFormData({...formData, functional: {...formData.functional!, vo2Protocol: e.target.value as any}})}>
                                 <option value="Cooper">Cooper (Corrida 12 min)</option>
                                 <option value="Rockport">Rockport (Caminhada 1 Milha)</option>
                              </select>
                              <div className="mt-6">
                                 <InputGroup 
                                   label={formData.functional?.vo2Protocol === 'Cooper' ? 'Distância Percorrida (metros)' : 'Tempo de Conclusão (min)'} 
                                   type="number" 
                                   value={formData.functional?.testValue}
                                   onChange={v => setFormData({...formData, functional: {...formData.functional!, testValue: Number(v)}})}
                                 />
                              </div>
                           </div>
                           <div className="space-y-6">
                              <InputGroup label="FC ao Final do Teste" type="number" value={formData.functional?.hrFinal} onChange={v => setFormData({...formData, functional: {...formData.functional!, hrFinal: Number(v)}})} />
                              <InputGroup label="Flexibilidade - Banco de Wells (cm)" type="number" value={formData.functional?.flexibilityTest} onChange={v => setFormData({...formData, functional: {...formData.functional!, flexibilityTest: v}})} />
                           </div>
                        </div>

                        {/* Evolução Histórica de VO2 */}
                        {vo2HistoryData.length > 0 && (
                          <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-bottom duration-500">
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                   <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Análise de Tendência Funcional</h5>
                                   <p className="text-xl font-black text-slate-800 uppercase tracking-tighter">Histórico de VO2 Máximo</p>
                                </div>
                                <div className="text-left sm:text-right bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance Longitudinal</p>
                                   <p className="text-lg font-black text-emerald-500">{vo2HistoryData[vo2HistoryData.length - 1].vo2.toFixed(1)} <span className="text-[9px]">ml/kg/min</span></p>
                                </div>
                             </div>
                             <div className="h-80 w-full overflow-hidden">
                                <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={vo2HistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                      <defs>
                                         <linearGradient id="colorVo2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                         </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                      <XAxis 
                                         dataKey="date" 
                                         axisLine={false} 
                                         tickLine={false} 
                                         tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} 
                                         dy={10}
                                         minTickGap={20}
                                      />
                                      <YAxis 
                                         axisLine={false} 
                                         tickLine={false} 
                                         tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} 
                                         domain={['auto', 'auto']}
                                      />
                                      <Tooltip 
                                         content={<CustomVO2Tooltip />}
                                         cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                      />
                                      <Area 
                                         type="monotone" 
                                         dataKey="vo2" 
                                         stroke="#6366f1" 
                                         strokeWidth={5} 
                                         fillOpacity={1} 
                                         fill="url(#colorVo2)" 
                                         name="VO2 Max"
                                         animationDuration={2000}
                                         activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#6366f1' }}
                                      />
                                   </AreaChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                        )}
                     </div>
                   )}

                   {activeStep === 'review' && (
                     <div className="flex flex-col items-center justify-center py-24 space-y-10">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl transition-all shadow-2xl ${isCalculating ? 'bg-indigo-400 animate-pulse' : 'bg-slate-900'}`}>
                           {isCalculating ? '⏳' : '🏁'}
                        </div>
                        <div className="text-center space-y-3">
                           <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Consolidar Dados Clínicos</h4>
                           <p className="text-slate-400 font-medium max-w-sm">Ao finalizar, os algoritmos VitalMetric processarão os resultados e a IA gerará o parecer técnico evolutivo.</p>
                        </div>
                        <button 
                          disabled={isCalculating}
                          onClick={handleSave} 
                          className="bg-indigo-600 text-white px-20 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {isCalculating ? 'Processando Modelagem...' : editingEvalId ? 'Aplicar Alterações' : 'Finalizar Diagnóstico'}
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* VIEW REPORT MODAL */}
      {viewingEval && (
        <div className="fixed inset-0 bg-white z-[500] overflow-y-auto thin-scrollbar p-12 print:p-0 animate-in slide-in-from-right duration-500">
           <div className="max-w-5xl mx-auto space-y-16 print:space-y-10">
              <div className="flex justify-between items-start border-b-[16px] border-slate-900 pb-12 print:pb-8">
                 <div>
                    <h1 className="text-6xl font-black text-slate-900 leading-none uppercase tracking-tighter">PRONTUÁRIO DE<br/><span className="text-indigo-600">PERFORMANCE</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">SÉRIE: {viewingEval.id.toUpperCase()} | DATA: {new Date(viewingEval.date).toLocaleDateString('pt-BR')}</p>
                 </div>
                 <div className="flex gap-4 no-print items-center">
                    <button 
                      onClick={generateTraining}
                      disabled={isGeneratingTraining}
                      className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      {isGeneratingTraining ? 'Gerando...' : '✨ Gerar Treino Sugerido (IA)'}
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Imprimir Relatório</button>
                    <button 
                      onClick={() => setViewingEval(null)} 
                      className="group flex items-center gap-3 bg-slate-100 hover:bg-rose-50 px-6 py-4 rounded-2xl transition-all"
                    >
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-rose-600 uppercase tracking-widest">Voltar ao Painel</span>
                      <span className="text-3xl text-slate-300 group-hover:text-rose-500 leading-none">&times;</span>
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 <ReportMetric label="Gordura Corporal" value={`${viewingEval.bodyFat.toFixed(1)}%`} sub={viewingEval.protocol === 'Bioimpedance' ? 'Bioimpedância' : 'Protocolo Científico'} />
                 <ReportMetric label="VO2 Máximo" value={viewingEval.functional.vo2Max?.toFixed(1) || '---'} sub={viewingEval.functional.vo2Classification || 'Aguardando Teste'} />
                 <ReportMetric label="Gasto Metabólico" value={`${viewingEval.tdee.toFixed(0)}`} sub="Total kcal / dia" />
                 <ReportMetric label="Somatotipia" value={viewingEval.somatotype?.classification || '---'} sub="Heath-Carter" />
              </div>

              <div className="bg-indigo-50 p-12 rounded-[4rem] border border-indigo-100 shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><span className="text-6xl">🤖</span></div>
                 <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Parecer Analítico Inteligente (VitalMetric AI)</h5>
                 <p className="text-2xl font-medium text-slate-800 leading-relaxed italic pr-12">"{viewingEval.aiInsight || 'Análise bioestatística processada com sucesso. Resultados dentro dos parâmetros esperados para o perfil.'}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                 <div className="space-y-12">
                    {viewingEval.protocol !== 'Bioimpedance' && (
                      <div className="space-y-8">
                         <h6 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] border-b-2 border-slate-100 pb-3">Composição Tecidual (Dobras mm)</h6>
                         <div className="grid grid-cols-2 gap-5">
                            {viewingEval.skinfolds && (Object.entries(viewingEval.skinfolds) as [string, number][]).filter(([_,v]) => v > 0).map(([k, v]) => (
                               <div key={k} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <span className="text-[10px] font-black text-slate-500 uppercase">{SKINFOLD_LABELS[k] || k}</span>
                                  <span className="text-base font-black text-slate-800">{v} <span className="text-[10px]">mm</span></span>
                               </div>
                            ))}
                         </div>
                      </div>
                    )}
                    <div className="space-y-8">
                       <h6 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] border-b-2 border-slate-100 pb-3">Perímetros Corporais (cm)</h6>
                       <div className="grid grid-cols-1 gap-5">
                          {(Object.entries(viewingEval.perimeters) as [string, number][]).filter(([_,v]) => v > 0).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <span className="text-[10px] font-black text-slate-500 uppercase">{PERIMETER_LABELS[k] || k}</span>
                               <span className="text-base font-black text-slate-800">{v} <span className="text-[10px]">cm</span></span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="space-y-12">
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                       <h6 className="text-[10px] font-black uppercase mb-8 text-indigo-400 tracking-widest text-center">Somatocarta (Perfil Morfológico)</h6>
                       <div className="flex justify-around items-end h-32">
                          <SomatoBar label="Endo" value={viewingEval.somatotype?.endomorphy || 0} />
                          <SomatoBar label="Meso" value={viewingEval.somatotype?.mesomorphy || 0} />
                          <SomatoBar label="Ecto" value={viewingEval.somatotype?.ectomorphy || 0} />
                       </div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-50 shadow-sm">
                       <h6 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-widest">Modelagem Metabólica</h6>
                       <div className="space-y-6">
                          <MetabolicRow label="Taxa Metabólica Basal (TMB)" value={`${viewingEval.bmr.toFixed(0)} kcal`} />
                          <MetabolicRow label="Massa Isenta de Gordura" value={`${viewingEval.leanMass.toFixed(1)} kg`} />
                          <MetabolicRow label="Massa Gorda Estimada" value={`${viewingEval.fatMass.toFixed(1)} kg`} />
                          <MetabolicRow label="Protocolo Antropométrico" value={viewingEval.protocol} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, type = "text", value, onChange, placeholder }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-2">{label}</label>
    <input 
      type={type} 
      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-200 transition-all shadow-inner" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
    />
  </div>
);

const InputBox = ({ label, value, onChange, placeholder, textarea }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-2">{label}</label>
    {textarea ? (
      <textarea className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] shadow-inner" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <input type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

const ReportMetric = ({ label, value, sub }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center hover:scale-105 transition-transform">
     <p className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
     <p className="text-4xl font-black text-slate-900 leading-none mb-3 tracking-tighter">{value}</p>
     <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{sub}</p>
  </div>
);

const SomatoBar = ({ label, value }: any) => (
  <div className="flex flex-col items-center gap-3">
     <div className="w-10 bg-indigo-500 rounded-t-xl transition-all duration-1000" style={{ height: `${value * 12}px` }}></div>
     <p className="text-[10px] font-black uppercase">{label}</p>
     <p className="text-sm font-black text-indigo-400">{value}</p>
  </div>
);

const MetabolicRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
     <span className="text-[10px] font-black text-slate-400 uppercase">{label}</span>
     <span className="text-sm font-black text-slate-800">{value}</span>
  </div>
);

export default EvaluationSystem;

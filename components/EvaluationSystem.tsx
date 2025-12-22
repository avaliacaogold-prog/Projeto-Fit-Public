
import React, { useState, useMemo } from 'react';
import { Evaluation, Client, EvaluationProtocol, Skinfolds, Perimeters, ProfessionalProfile } from '../types';
import { getAIInsights } from '../services/geminiService';
import { calculateBodyFat, getIMCClassification, calculateVO2Max, getVO2Classification, calculateAge, calculateSomatotype } from '../services/fitnessCalculations';

interface EvaluationSystemProps {
  clients: Client[];
  evaluations: Evaluation[];
  profile: ProfessionalProfile;
  onAddEvaluation: (evaluation: Evaluation) => void;
  onUpdateEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (id: string) => void;
}

const STEPS = [
  { id: 'anamnesis', label: 'Anamnese & Risco', icon: '🩺' },
  { id: 'hemodynamic', label: 'Hemodinâmica', icon: '💓' },
  { id: 'anthropometry', label: 'Antropometria', icon: '📏' },
  { id: 'functional', label: 'Capacidade Funcional', icon: '🏃' },
  { id: 'review', label: 'Laudo Final', icon: '📄' }
];

const EvaluationSystem: React.FC<EvaluationSystemProps> = ({ clients, evaluations, profile, onAddEvaluation, onUpdateEvaluation, onDeleteEvaluation }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeStep, setActiveStep] = useState('anamnesis');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingEval, setViewingEval] = useState<Evaluation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const initialFormState: Partial<Evaluation> = {
    date: new Date().toISOString().split('T')[0],
    protocol: 'Pollock7',
    weight: 0,
    height: 0,
    skinfolds: { triceps: 0, biceps: 0, subscapular: 0, suprailiac: 0, abdominal: 0, chest: 0, thigh: 0, midaxillary: 0, calf: 0 },
    perimeters: { waist: 0, hips: 0, abdomen: 0, chest: 0, arm: 0, armFlexed: 0, forearm: 0, neck: 0, shoulders: 0, thigh: 0, thighProximal: 0, calf: 0 },
    anamnesis: { medicalHistory: '', medications: '', allergies: '', sleepQuality: 'Boa', waterIntake: 2, isSmoker: false, alcoholConsumption: 'Nenhum', lifestyle: 'Moderado', injuries: '' },
    clinical: { bloodPressure: '120/80', restingHR: 70, riskFactors: [], acsmRiskStratification: 'Baixo' },
    functional: { vo2Protocol: 'Cooper', vo2Max: 0, testValue: 0, hrFinal: 0 },
    notes: ''
  };

  const [formData, setFormData] = useState<Partial<Evaluation>>(initialFormState);
  const client = clients.find(c => c.id === selectedClientId);

  const handleSave = async () => {
    if (!client) return alert("Selecione um paciente.");
    setIsCalculating(true);
    
    try {
      const age = calculateAge(client.birthDate, formData.date);
      const sf = formData.skinfolds as Skinfolds;
      const pm = formData.perimeters as Perimeters;
      
      const bf = calculateBodyFat(
        formData.protocol as EvaluationProtocol, 
        sf, 
        age, 
        client.gender, 
        formData.weight || 0, 
        formData.height || 0, 
        pm
      );

      const vo2Max = calculateVO2Max(
        formData.functional?.vo2Protocol || 'Cooper',
        formData.functional?.testValue || 0,
        age,
        formData.weight || 0,
        client.gender,
        formData.functional?.hrFinal
      );

      const somato = calculateSomatotype(sf, pm, formData.height || 170, formData.weight || 70);
      
      const finalEval: Evaluation = {
        ...(formData as Evaluation),
        id: Math.random().toString(36).substr(2, 9),
        clientId: selectedClientId,
        ageAtEvaluation: age,
        bodyFat: bf,
        leanMass: (formData.weight || 0) * (1 - bf/100),
        fatMass: (formData.weight || 0) * (bf/100),
        bmr: client.gender === 'M' 
          ? (10 * (formData.weight || 0)) + (6.25 * (formData.height || 0)) - (5 * age) + 5
          : (10 * (formData.weight || 0)) + (6.25 * (formData.height || 0)) - (5 * age) - 161,
        tdee: 0, // Calcular baseado em lifestyle no futuro
        somatotype: somato,
        functional: { 
          ...formData.functional, 
          vo2Max, 
          vo2Classification: getVO2Classification(vo2Max, age, client.gender).status 
        }
      };

      // Gerar Insight IA
      finalEval.aiInsight = await getAIInsights(finalEval, client, evaluations.filter(e => e.clientId === client.id));

      onAddEvaluation(finalEval);
      setIsFormOpen(false);
      setViewingEval(finalEval);
    } catch (error) {
      alert("Erro ao processar diagnósticos estatísticos.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Clínico */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 no-print">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl">📑</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Centro de Diagnóstico Clínico</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Padrões ACSM & Diretrizes de Saúde</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="flex-1 md:w-72 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">Selecione o Paciente...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            disabled={!selectedClientId}
            onClick={() => { setFormData(initialFormState); setIsFormOpen(true); }}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-indigo-700 transition-all"
          >
            + Iniciar Avaliação
          </button>
        </div>
      </div>

      {/* Grid de Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluations.filter(e => e.clientId === selectedClientId).map(ev => (
          <div key={ev.id} onClick={() => setViewingEval(ev)} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-600 transition-all cursor-pointer group shadow-sm">
            <div className="flex justify-between mb-6">
               <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(ev.date).toLocaleDateString()}</span>
               <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${ev.clinical.acsmRiskStratification === 'Baixo' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>Risco {ev.clinical.acsmRiskStratification}</span>
            </div>
            <h4 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">{ev.bodyFat.toFixed(1)}% <span className="text-xs text-slate-400">Gordura</span></h4>
            <div className="flex items-center gap-4 text-slate-500">
               <span className="text-[10px] font-bold uppercase">VO2: {ev.functional.vo2Max?.toFixed(1)}</span>
               <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
               <span className="text-[10px] font-bold uppercase">{ev.functional.vo2Classification}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FORMULÁRIO CLÍNICO (MODAL) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl">💉</div>
                  <h3 className="text-xl font-black text-slate-800 uppercase">Workflow de Avaliação Clínica</h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-300 hover:text-rose-500 text-5xl">&times;</button>
             </div>

             <div className="flex bg-white border-b overflow-x-auto no-scrollbar px-6 py-4">
                {STEPS.map(s => (
                  <button key={s.id} onClick={() => setActiveStep(s.id)} className={`flex items-center gap-3 px-8 py-3 rounded-2xl transition-all mr-4 whitespace-nowrap ${activeStep === s.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>
                    <span>{s.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-12 thin-scrollbar bg-[#FDFDFD]">
                <div className="max-w-4xl mx-auto space-y-12">
                   {activeStep === 'anamnesis' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputBox label="Histórico Cardiovascular" placeholder="Ex: Hipertensão controlada, Arritmia..." textarea value={formData.anamnesis?.medicalHistory} onChange={v => setFormData({...formData, anamnesis: {...formData.anamnesis!, medicalHistory: v}})} />
                        <div className="space-y-6">
                           <label className="text-[10px] font-black text-slate-400 uppercase block ml-2">Triagem ACSM (Fatores de Risco)</label>
                           {['Fumante', 'Sedentarismo', 'Obesidade', 'Hiperlipoproteinemia', 'Diabetes'].map(risk => (
                             <label key={risk} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                                <span className="text-xs font-bold text-slate-700">{risk}</span>
                             </label>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeStep === 'hemodynamic' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <InputBox label="Pressão Arterial (PAS/PAD)" placeholder="120/80" value={formData.clinical?.bloodPressure} onChange={v => setFormData({...formData, clinical: {...formData.clinical!, bloodPressure: v}})} />
                        <InputBox label="FC de Repouso (bpm)" type="number" value={formData.clinical?.restingHR} onChange={v => setFormData({...formData, clinical: {...formData.clinical!, restingHR: Number(v)}})} />
                     </div>
                   )}

                   {activeStep === 'anthropometry' && (
                     <div className="space-y-12">
                        <div className="grid grid-cols-3 gap-8 p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100 shadow-inner">
                           <InputBox label="Peso Corporal (kg)" type="number" value={formData.weight} onChange={v => setFormData({...formData, weight: Number(v)})} />
                           <InputBox label="Estatura (cm)" type="number" value={formData.height} onChange={v => setFormData({...formData, height: Number(v)})} />
                           <div className="w-full">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Protocolo</label>
                              <select className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-xs" value={formData.protocol} onChange={e => setFormData({...formData, protocol: e.target.value as any})}>
                                 <option value="Pollock7">Pollock 7 Dobras</option>
                                 <option value="Pollock3">Pollock 3 Dobras</option>
                                 <option value="Guedes">Guedes</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-8">
                           <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Dobras Cutâneas (mm)</h5>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {Object.keys(formData.skinfolds || {}).map(fold => (
                                <InputBox key={fold} label={fold} type="number" value={(formData.skinfolds as any)?.[fold]} onChange={v => setFormData({...formData, skinfolds: {...formData.skinfolds!, [fold]: Number(v)}})} />
                              ))}
                           </div>
                           <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mt-10">Perímetros Corporais (cm)</h5>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {Object.keys(formData.perimeters || {}).map(p => (
                                <InputBox key={p} label={p} type="number" value={(formData.perimeters as any)?.[p]} onChange={v => setFormData({...formData, perimeters: {...formData.perimeters!, [p]: Number(v)}})} />
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {activeStep === 'functional' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                           <label className="text-[10px] font-black text-slate-400 uppercase block mb-4">Teste Cardio-Respiratório</label>
                           <select className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-xs" value={formData.functional?.vo2Protocol} onChange={e => setFormData({...formData, functional: {...formData.functional!, vo2Protocol: e.target.value as any}})}>
                              <option value="Cooper">Cooper (12 min)</option>
                              <option value="Rockport">Rockport (1 mile)</option>
                           </select>
                           <div className="mt-6">
                              <InputBox 
                                label={formData.functional?.vo2Protocol === 'Cooper' ? 'Distância Percorrida (m)' : 'Tempo de Caminhada (min)'} 
                                type="number" 
                                value={formData.functional?.testValue}
                                onChange={v => setFormData({...formData, functional: {...formData.functional!, testValue: Number(v)}})}
                              />
                           </div>
                        </div>
                        <div className="space-y-6">
                           <InputBox label="Flexibilidade (Banco de Wells)" type="number" />
                           <InputBox label="Teste de Flexão (Push-ups)" type="number" />
                        </div>
                     </div>
                   )}

                   {activeStep === 'review' && (
                     <div className="flex flex-col items-center justify-center py-20 space-y-8">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl transition-all ${isCalculating ? 'bg-slate-200 animate-pulse' : 'bg-indigo-600 animate-bounce'}`}>
                           {isCalculating ? '⏳' : '✓'}
                        </div>
                        <h4 className="text-3xl font-black text-slate-800 text-center uppercase">Diagnóstico Concluído</h4>
                        <p className="text-slate-400 font-medium text-center max-w-md">Todos os parâmetros clínicos foram coletados e estão prontos para processamento estatístico via IA.</p>
                        <button 
                          disabled={isCalculating}
                          onClick={handleSave} 
                          className="bg-slate-900 text-white px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                        >
                          {isCalculating ? 'Processando...' : 'Gerar Laudo Clínico'}
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO DE LAUDO CLÍNICO */}
      {viewingEval && (
        <div className="fixed inset-0 bg-white z-[500] overflow-y-auto thin-scrollbar p-8 md:p-16 print:p-0 animate-in slide-in-from-right duration-500">
           <div className="max-w-5xl mx-auto space-y-16 print:space-y-8">
              <div className="flex justify-between items-start border-b-[12px] border-slate-900 pb-12 print:pb-8">
                 <div>
                    <h1 className="text-5xl font-black text-slate-900 leading-none uppercase tracking-tighter">PRONTUÁRIO DE<br/><span className="text-indigo-600">PERFORMANCE</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">ID Clínico: {viewingEval.id.toUpperCase()} | DATA: {new Date(viewingEval.date).toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-4 no-print">
                    <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase">🖨️ Imprimir</button>
                    <button onClick={() => setViewingEval(null)} className="text-4xl">&times;</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <MetricBox label="Body Fat %" value={`${viewingEval.bodyFat.toFixed(1)}%`} status="Classificação ACSM" />
                 <MetricBox label="VO2 Max" value={viewingEval.functional.vo2Max?.toFixed(1) || '0'} status={viewingEval.functional.vo2Classification || 'N/A'} />
                 <MetricBox label="Hemodinâmica" value={viewingEval.clinical.bloodPressure} status={`${viewingEval.clinical.restingHR} BPM Repouso`} />
              </div>

              <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 print:rounded-3xl print:p-8">
                 <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Parecer Técnico Especializado (IA)</h5>
                 <p className="text-xl font-medium text-slate-800 leading-relaxed italic opacity-90">"{viewingEval.aiInsight || 'Análise clínica processada via VitalMetric AI Engine.'}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div className="space-y-6">
                    <h6 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mapa Antropométrico</h6>
                    <div className="grid grid-cols-1 gap-4">
                       {Object.entries(viewingEval.perimeters).filter(([_,v]) => v > 0).map(([k, v]) => (
                         <div key={k} className="flex justify-between items-center border-b pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase">{k}</span>
                            <span className="text-sm font-black text-slate-800">{v} cm</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="p-8 bg-indigo-600 rounded-[3rem] text-white shadow-xl">
                       <h6 className="text-[10px] font-black uppercase mb-4 opacity-50">Distribuição Somatotípica (Heath-Carter)</h6>
                       <div className="flex justify-around text-center">
                          <div><p className="text-xs font-bold opacity-60">Endo</p><p className="text-2xl font-black">{viewingEval.somatotype?.endomorphy || '---'}</p></div>
                          <div><p className="text-xs font-bold opacity-60">Meso</p><p className="text-2xl font-black">{viewingEval.somatotype?.mesomorphy || '---'}</p></div>
                          <div><p className="text-xs font-bold opacity-60">Ecto</p><p className="text-2xl font-black">{viewingEval.somatotype?.ectomorphy || '---'}</p></div>
                       </div>
                       <p className="text-center text-[9px] font-black uppercase tracking-widest mt-4 opacity-70">Perfil: {viewingEval.somatotype?.classification}</p>
                    </div>
                    <div className="p-8 border-2 border-slate-100 rounded-[3rem] bg-white">
                       <h6 className="text-[10px] font-black text-slate-400 uppercase mb-4">Metabolismo & Gasto</h6>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">BMR (Taxa Basal)</span><span className="text-sm font-black text-slate-800">{viewingEval.bmr.toFixed(0)} kcal</span></div>
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Massa Magra</span><span className="text-sm font-black text-slate-800">{viewingEval.leanMass.toFixed(1)} kg</span></div>
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

const InputBox = ({ label, type = "text", value, onChange, placeholder, textarea }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">{label}</label>
    {textarea ? (
      <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <input type={type} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

const MetricBox = ({ label, value, status }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
     <p className="text-[10px] font-black text-slate-400 uppercase mb-4">{label}</p>
     <p className="text-4xl font-black text-slate-900 leading-none mb-4 tracking-tighter">{value}</p>
     <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{status}</p>
  </div>
);

export default EvaluationSystem;

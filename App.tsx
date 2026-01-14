
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import EvaluationSystem from './components/EvaluationSystem';
import FinancialManagement from './components/FinancialManagement';
import TrainingPrograms from './components/TrainingPrograms';
import Settings from './components/Settings';
import { Client, Evaluation, Payment, PaymentStatus, ViewType, TrainingProgram, WorkoutLog, ExerciseTemplate, ProfessionalProfile, PlanType } from './types';

interface AppState {
  clients: Client[];
  evaluations: Evaluation[];
  payments: Payment[];
  trainingPrograms: TrainingProgram[];
  workoutLogs: WorkoutLog[];
  exerciseTemplates: ExerciseTemplate[];
  profile: ProfessionalProfile;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [preSelectedTrainingClientId, setPreSelectedTrainingClientId] = useState<string | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const savedClients = localStorage.getItem('fitcheck_clients');
    const savedEvals = localStorage.getItem('fitcheck_evaluations');
    const savedPayments = localStorage.getItem('fitcheck_payments');
    const savedTraining = localStorage.getItem('fitcheck_training');
    const savedLogs = localStorage.getItem('fitcheck_workout_logs');
    const savedTemplates = localStorage.getItem('fitcheck_exercise_templates');
    const savedProfile = localStorage.getItem('fitcheck_profile');

    return {
      clients: savedClients ? JSON.parse(savedClients) : [],
      evaluations: savedEvals ? JSON.parse(savedEvals) : [],
      payments: savedPayments ? JSON.parse(savedPayments) : [],
      trainingPrograms: savedTraining ? JSON.parse(savedTraining) : [],
      workoutLogs: savedLogs ? JSON.parse(savedLogs) : [],
      exerciseTemplates: savedTemplates ? JSON.parse(savedTemplates) : [],
      profile: savedProfile ? JSON.parse(savedProfile) : {
        name: 'Marcos Silva',
        cref: '123456-G/SP',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        bio: 'Especialista em Fisiologia do Exercício e Treinamento de Alta Performance.',
        email: 'contato@vitalmetric.pro',
        phone: '(11) 99999-9999'
      }
    };
  });

  const { clients, evaluations, payments, trainingPrograms, workoutLogs, exerciseTemplates, profile } = state;

  useEffect(() => {
    localStorage.setItem('fitcheck_clients', JSON.stringify(clients));
    localStorage.setItem('fitcheck_evaluations', JSON.stringify(evaluations));
    localStorage.setItem('fitcheck_payments', JSON.stringify(payments));
    localStorage.setItem('fitcheck_training', JSON.stringify(trainingPrograms));
    localStorage.setItem('fitcheck_workout_logs', JSON.stringify(workoutLogs));
    localStorage.setItem('fitcheck_exercise_templates', JSON.stringify(exerciseTemplates));
    localStorage.setItem('fitcheck_profile', JSON.stringify(profile));
  }, [state]);

  const handleUpdateWorkoutLog = (log: WorkoutLog) => {
    setState(prev => {
      const filtered = prev.workoutLogs.filter(l => !(l.date === log.date && l.clientId === log.clientId));
      return { ...prev, workoutLogs: [...filtered, log] };
    });
  };

  const handleBulkAddWorkoutLogs = (newLogs: WorkoutLog[]) => {
    if (newLogs.length === 0) return;
    setState(prev => {
      const clientId = newLogs[0].clientId;
      const dates = newLogs.map(l => l.date);
      const filtered = prev.workoutLogs.filter(l => !(l.clientId === clientId && dates.includes(l.date)));
      return { ...prev, workoutLogs: [...filtered, ...newLogs] };
    });
  };

  const handleDeleteWorkoutLog = (id: string) => {
    setState(prev => ({ ...prev, workoutLogs: prev.workoutLogs.filter(l => l.id !== id) }));
  };

  const handleLoadDemo = () => {
    const demoClientId1 = 'client-1';
    const demoClientId2 = 'client-2';
    
    const demoClients: Client[] = [
      {
        id: demoClientId1,
        name: 'Ana Oliveira',
        email: 'ana.oliveira@email.com',
        phone: '(11) 98888-7777',
        birthDate: '1995-05-15',
        gender: 'F',
        active: true,
        createdAt: new Date().toISOString(),
        trainingFrequency: 4,
        targetSplit: 'ABC',
        currentPlan: 'Semestral'
      },
      {
        id: demoClientId2,
        name: 'Carlos Mendes',
        email: 'carlos.mendes@email.com',
        phone: '(11) 97777-6666',
        birthDate: '1988-11-20',
        gender: 'M',
        active: true,
        createdAt: new Date().toISOString(),
        trainingFrequency: 5,
        targetSplit: 'ABCDE',
        currentPlan: 'Mensal'
      }
    ];

    const demoEvaluations: Evaluation[] = [
      {
        id: 'eval-1',
        clientId: demoClientId1,
        date: new Date().toISOString().split('T')[0],
        ageAtEvaluation: 29,
        protocol: 'Pollock7',
        weight: 65,
        height: 168,
        perimeters: { waist: 70, hips: 98, abdomen: 75, chest: 88, arm: 28, armFlexed: 30, forearm: 24, neck: 32, shoulders: 102, thigh: 55, thighProximal: 58, calf: 36 },
        skinfolds: { triceps: 12, biceps: 8, subscapular: 14, suprailiac: 16, abdominal: 18, chest: 10, thigh: 22, midaxillary: 12, calf: 14 },
        anamnesis: { medicalHistory: 'Nenhuma', medications: 'Nenhuma', allergies: 'Nenhuma', sleepQuality: 'Boa', waterIntake: 2.5, isSmoker: false, alcoholConsumption: 'Ocasional', lifestyle: 'Ativo', injuries: 'Leve desconforto no joelho esquerdo' },
        clinical: {
          bloodPressure: '110/70',
          restingHR: 62,
          riskFactors: [],
          acsmRiskStratification: 'Baixo'
        },
        functional: {
          vo2Max: 45.2,
          vo2Classification: 'Excelente',
          vo2Protocol: 'Cooper',
          testValue: 2400
        },
        somatotype: {
          endomorphy: 3.2,
          mesomorphy: 4.5,
          ectomorphy: 2.8,
          classification: 'Mesomorfo'
        },
        bodyFat: 19.5,
        leanMass: 52.3,
        fatMass: 12.7,
        bmr: 1450,
        tdee: 2200,
        aiInsight: 'Ana apresenta excelente resposta hipertrófica. Focar em fortalecer vasto medial para estabilidade do joelho.',
        notes: 'Avaliação inicial positiva.'
      }
    ];

    const demoPayments: Payment[] = [
      {
        id: 'pay-1',
        clientId: demoClientId1,
        clientName: 'Ana Oliveira',
        amount: 850.00,
        dueDate: new Date().toISOString().split('T')[0],
        status: PaymentStatus.PAID,
        planType: 'Semestral',
        description: 'Plano Semestral - Parcela 01/06'
      },
      {
        id: 'pay-2',
        clientId: demoClientId2,
        clientName: 'Carlos Mendes',
        amount: 250.00,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: PaymentStatus.PENDING,
        planType: 'Mensal',
        description: 'Mensalidade Novembro'
      }
    ];

    const demoTraining: TrainingProgram[] = [
      {
        id: 'train-1',
        clientId: demoClientId1,
        clientName: 'Ana Oliveira',
        level: 'Intermediário',
        splitLetter: 'A',
        title: 'Inferiores - Foco Quadríceps',
        description: 'Ênfase em força e estabilidade articular.',
        exercises: [
          { id: 'ex-1', name: 'Agachamento Livre', sets: '4', reps: '10', rest: '90s', stage: 'Principal' },
          { id: 'ex-2', name: 'Leg Press 45', sets: '3', reps: '12', rest: '60s', stage: 'Principal' }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    setState(prev => ({
      ...prev,
      clients: demoClients,
      evaluations: demoEvaluations,
      payments: demoPayments,
      trainingPrograms: demoTraining
    }));
    
    alert('Ambiente de teste carregado com sucesso!');
  };

  const updateState = useCallback((newPartialState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newPartialState }));
  }, []);

  const handleUpdateProfile = (newProfile: ProfessionalProfile) => updateState({ profile: newProfile });
  const handleAddClient = (client: Client) => setState(prev => ({ ...prev, clients: [...prev.clients, client] }));
  const handleUpdateClient = (updated: Client) => setState(prev => ({ ...prev, clients: prev.clients.map(c => c.id === updated.id ? updated : c) }));
  const handleDeleteClient = (id: string) => {
    if (window.confirm('Excluir aluno e todo seu histórico?')) {
      setState(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
        evaluations: prev.evaluations.filter(e => e.clientId !== id),
        trainingPrograms: prev.trainingPrograms.filter(p => p.clientId !== id),
        workoutLogs: prev.workoutLogs.filter(l => l.clientId !== id)
      }));
    }
  };

  const handleAddEvaluation = (ev: Evaluation) => setState(prev => ({ ...prev, evaluations: [ev, ...prev.evaluations] }));
  const handleUpdateEvaluation = (updated: Evaluation) => setState(prev => ({ ...prev, evaluations: prev.evaluations.map(e => e.id === updated.id ? updated : e) }));
  const handleDeleteEvaluation = (id: string) => {
    if (window.confirm('Excluir avaliação?')) {
      setState(prev => ({ ...prev, evaluations: prev.evaluations.filter(e => e.id !== id) }));
    }
  };

  const handleAddPayment = (p: Payment) => setState(prev => ({ ...prev, payments: [p, ...prev.payments] }));
  const handleUpdatePaymentStatus = (id: string, status: PaymentStatus) => setState(prev => ({ ...prev, payments: prev.payments.map(p => p.id === id ? { ...p, status } : p) }));
  const handleAddTrainingProgram = (tp: TrainingProgram) => setState(prev => ({ ...prev, trainingPrograms: [tp, ...prev.trainingPrograms] }));
  const handleUpdateTrainingProgram = (updated: TrainingProgram) => setState(prev => ({ ...prev, trainingPrograms: prev.trainingPrograms.map(p => p.id === updated.id ? updated : p) }));
  const handleDeleteTrainingProgram = (id: string) => {
    if (window.confirm('Excluir programa de treino?')) {
      setState(prev => ({ ...prev, trainingPrograms: prev.trainingPrograms.filter(tp => tp.id !== id) }));
    }
  };
  const handleAddExerciseTemplate = (template: ExerciseTemplate) => setState(prev => ({ ...prev, exerciseTemplates: [...prev.exerciseTemplates, template] }));
  const handleDeleteExerciseTemplate = (id: string) => setState(prev => ({ ...prev, exerciseTemplates: prev.exerciseTemplates.filter(t => t.id !== id) }));

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard clients={clients} evaluations={evaluations} payments={payments} onLoadDemo={handleLoadDemo} />;
      case 'clients': return <ClientManagement clients={clients} evaluations={evaluations} trainingPrograms={trainingPrograms} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} onViewTraining={(id) => { setPreSelectedTrainingClientId(id); setActiveView('training'); }} />;
      case 'evaluations': return <EvaluationSystem clients={clients} evaluations={evaluations} profile={profile} onAddEvaluation={handleAddEvaluation} onUpdateEvaluation={handleUpdateEvaluation} onDeleteEvaluation={handleDeleteEvaluation} onAddTrainingProgram={handleAddTrainingProgram} />;
      case 'training': return <TrainingPrograms clients={clients} evaluations={evaluations} programs={trainingPrograms} workoutLogs={workoutLogs} exerciseTemplates={exerciseTemplates} onAddProgram={handleAddTrainingProgram} onUpdateProgram={handleUpdateTrainingProgram} onDeleteProgram={handleDeleteTrainingProgram} onUpdateLog={handleUpdateWorkoutLog} onBulkAddLogs={handleBulkAddWorkoutLogs} onDeleteLog={handleDeleteWorkoutLog} onAddTemplate={handleAddExerciseTemplate} onDeleteTemplate={handleDeleteExerciseTemplate} initialClientId={preSelectedTrainingClientId} />;
      case 'financial': return <FinancialManagement clients={clients} payments={payments} onAddPayment={handleAddPayment} onUpdateStatus={handleUpdatePaymentStatus} />;
      case 'settings': return <Settings profile={profile} onUpdateProfile={handleUpdateProfile} />;
      default: return <Dashboard clients={clients} evaluations={evaluations} payments={payments} onLoadDemo={handleLoadDemo} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={(v) => { setActiveView(v); setPreSelectedTrainingClientId(null); }} profile={profile}>
      {renderView()}
    </Layout>
  );
};

export default App;

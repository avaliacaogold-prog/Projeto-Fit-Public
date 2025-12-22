
export type PlanType = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' | 'VIP / Consultoria';

export interface ProfessionalProfile {
  name: string;
  cref: string;
  address: string;
  bio: string;
  logoUrl?: string;
  email: string;
  phone: string;
}

export interface Somatotype {
  endomorphy: number;
  mesomorphy: number;
  ectomorphy: number;
  classification: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  active: boolean;
  createdAt: string;
  trainingFrequency?: number;
  targetSplit?: TrainingSplit;
  currentPlan?: PlanType;
}

export interface ClinicalData {
  bloodPressure: string;
  restingHR: number;
  fastingGlucose?: number;
  totalCholesterol?: number;
  riskFactors: string[];
  acsmRiskStratification: 'Baixo' | 'Moderado' | 'Alto';
}

export interface FunctionalData {
  vo2Max?: number;
  vo2Classification?: string;
  vo2Protocol?: 'Cooper' | 'Rockport' | 'YMCA';
  testValue?: number; // Metros ou Minutos dependendo do protocolo
  hrFinal?: number;
  flexibilityTest?: string;
  pushUpTest?: number;
}

export type EvaluationProtocol = 'Pollock3' | 'Pollock7' | 'Guedes' | 'Petroski' | 'Faulkner' | 'Weltman' | 'Bioimpedance';

export interface Perimeters {
  waist: number;
  hips: number;
  abdomen: number;
  chest: number;
  arm: number;
  armFlexed: number;
  forearm: number;
  neck: number;
  shoulders: number;
  thigh: number;
  thighProximal: number;
  calf: number;
}

export interface Skinfolds {
  triceps: number;
  biceps: number;
  subscapular: number;
  suprailiac: number;
  abdominal: number;
  chest: number;
  thigh: number;
  midaxillary: number;
  calf: number;
}

export interface Evaluation {
  id: string;
  clientId: string;
  date: string;
  ageAtEvaluation: number;
  protocol: EvaluationProtocol;
  weight: number;
  height: number;
  perimeters: Perimeters;
  skinfolds?: Skinfolds;
  anamnesis: {
    medicalHistory: string;
    medications: string;
    allergies: string;
    sleepQuality: string;
    waterIntake: number;
    isSmoker: boolean;
    alcoholConsumption: string;
    lifestyle: string;
    injuries: string;
  };
  clinical: ClinicalData;
  functional: FunctionalData;
  somatotype: Somatotype;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  bmr: number;
  tdee: number;
  aiInsight?: string;
  notes: string;
}

export type ExerciseStage = 'Preparação' | 'Principal' | 'Finalização';

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  stage?: ExerciseStage;
}

export type TrainingLevel = 'Iniciante' | 'Intermediário' | 'Avançado';
export type TrainingSplit = 'Full Body' | 'AB' | 'ABC' | 'ABCD' | 'ABCDE' | 'ABCDEF';

export interface TrainingProgram {
  id: string;
  clientId: string;
  clientName: string;
  level: TrainingLevel;
  splitType?: TrainingSplit;
  splitLetter?: string;
  title: string;
  description: string;
  exercises: Exercise[];
  createdAt: string;
}

export type ViewType = 'dashboard' | 'clients' | 'evaluations' | 'financial' | 'training' | 'settings';
export type WorkoutStatus = 'done' | 'scheduled' | 'canceled';

export interface WorkoutLog {
  id: string;
  clientId: string;
  programId: string;
  programTitle: string;
  date: string;
  status: WorkoutStatus;
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED'
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  planType: PlanType;
  description: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: string;
}

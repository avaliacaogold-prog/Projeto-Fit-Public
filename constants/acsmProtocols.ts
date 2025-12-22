
import { TrainingLevel, Exercise, ExerciseStage } from '../types';

export interface TrainingProtocol {
  id: string;
  name: string;
  level: TrainingLevel;
  category: 'Hipertrofia' | 'Força' | 'Metabólico' | 'Funcional' | 'Flexibilidade' | 'Reabilitação' | 'Estética';
  goal: string;
  frequency: string;
  intensity: string;
  exercises: Omit<Exercise, 'id'>[];
  description: string;
}

export const TRAINING_METHODOLOGIES: TrainingProtocol[] = [
  {
    id: 'strength_max_power',
    name: 'Protocolo: Força Máxima (Basistas)',
    level: 'Avançado',
    category: 'Força',
    goal: 'Aumento de 1RM e Recrutamento Neural',
    frequency: '3x/semana',
    intensity: 'Muito Alta (85-95% 1RM)',
    description: 'Foco em grandes levantamentos com descanso longo para recuperação total do SNC.',
    exercises: [
      { name: 'Mobilidade Escapular', sets: '2', reps: '15', rest: '30s', stage: 'Preparação' },
      { name: 'Levantamento Terra (Deadlift)', sets: '5', reps: '3-5', rest: '180s', stage: 'Principal' },
      { name: 'Agachamento Livre', sets: '5', reps: '5', rest: '180s', stage: 'Principal' },
      { name: 'Desenvolvimento Militar (OHP)', sets: '4', reps: '6', rest: '120s', stage: 'Principal' }
    ]
  },
  {
    id: 'aesthetic_sculpt',
    name: 'Estética: Detail & Definition',
    level: 'Intermediário',
    category: 'Estética',
    goal: 'Simetria e Definição Muscular',
    frequency: '5x/semana',
    intensity: 'Moderada-Alta (RPE 8-9)',
    description: 'Mix de exercícios compostos e isoladores para maximizar o detalhamento muscular.',
    exercises: [
      { name: 'Elevação Lateral', sets: '4', reps: '15', rest: '45s', stage: 'Principal' },
      { name: 'Crossover Polia Alta', sets: '4', reps: '12-15', rest: '60s', stage: 'Principal' },
      { name: 'Extensora', sets: '3', reps: '20', rest: '45s', stage: 'Principal' },
      { name: 'Rosca Martelo', sets: '3', reps: '12', rest: '60s', stage: 'Principal' }
    ]
  },
  {
    id: 'rehab_posture_core',
    name: 'Reabilitação: Estabilidade & Postura',
    level: 'Iniciante',
    category: 'Reabilitação',
    goal: 'Fortalecimento de Core e Corretivos',
    frequency: 'Diário ou 3x/semana',
    intensity: 'Baixa (Foco em Controle)',
    description: 'Exercícios de baixa carga focados em ativação muscular profunda e estabilidade articular.',
    exercises: [
      { name: 'Gato-Camelo (Coluna)', sets: '3', reps: '10', rest: '0s', stage: 'Preparação' },
      { name: 'Adução Escapular (Elástico)', sets: '3', reps: '15', rest: '30s', stage: 'Principal' },
      { name: 'Ponte de Glúteo Isométrica', sets: '3', reps: '45s', rest: '30s', stage: 'Principal' },
      { name: 'Prancha com Toque no Ombro', sets: '3', reps: '12 (total)', rest: '45s', stage: 'Principal' }
    ]
  },
  {
    id: 'fat_burn_extreme',
    name: 'Emagrecimento: Circuito HIIT',
    level: 'Iniciante',
    category: 'Metabólico',
    goal: 'EPOC e Gasto Calórico Elevado',
    frequency: '3-4x/semana',
    intensity: 'Alta (Sem descanso entre ex.)',
    description: 'Circuito metabólico para maximizar a queima de gordura em tempo reduzido.',
    exercises: [
      { name: 'Polichinelos (Jumping Jacks)', sets: '3', reps: '45s', rest: '15s', stage: 'Preparação' },
      { name: 'Burpees Metabólicos', sets: '4', reps: '12', rest: '0s', stage: 'Principal' },
      { name: 'Kettlebell Swing', sets: '4', reps: '20', rest: '0s', stage: 'Principal' },
      { name: 'Mountain Climbers', sets: '4', reps: '30s', rest: '60s', stage: 'Principal' }
    ]
  }
];

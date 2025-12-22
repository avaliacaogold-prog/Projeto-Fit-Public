
import { ExerciseStage, TrainingLevel } from '../types';

export interface LibraryExercise {
  name: string;
  category: 'Peitoral' | 'Dorsal' | 'Pernas' | 'Ombros' | 'Braços' | 'Core' | 'Cardio' | 'Resistência' | 'Flexibilidade' | 'Mobilidade' | 'Reabilitação';
  defaultStage: ExerciseStage;
  recommendedLevels: TrainingLevel[];
  icon: string;
  description?: string;
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // --- ETAPA: PREPARAÇÃO (MOBILIDADE & ESTABILIDADE) ---
  { 
    name: 'Mobilidade de Tornozelo (Parede)', 
    category: 'Mobilidade', 
    defaultStage: 'Preparação', 
    recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], 
    icon: '🦶',
    description: 'Melhora a dorsiflexão para agachamentos profundos.'
  },
  { 
    name: 'Gato-Camelo (Cat-Cow)', 
    category: 'Mobilidade', 
    defaultStage: 'Preparação', 
    recommendedLevels: ['Iniciante', 'Intermediário'], 
    icon: '🐈',
    description: 'Mobilização da coluna vertebral e controle de core.'
  },
  { 
    name: 'Liberação Miofascial (Foam Roller)', 
    category: 'Mobilidade', 
    defaultStage: 'Preparação', 
    recommendedLevels: ['Intermediário', 'Avançado'], 
    icon: '🗞️',
    description: 'Redução de pontos de tensão pré-treino.'
  },
  { 
    name: 'Ativação de Glúteo (Band Walk)', 
    category: 'Resistência', 
    defaultStage: 'Preparação', 
    recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], 
    icon: '🎗️',
    description: 'Despertar neuromuscular do glúteo médio.'
  },

  // --- ETAPA: PRINCIPAL (FORÇA & HIPERTROFIA) ---
  // Iniciantes
  { 
    name: 'Agachamento Goblet (Halter)', 
    category: 'Pernas', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Iniciante'], 
    icon: '🏺',
    description: 'Base técnica para o agachamento livre.'
  },
  { 
    name: 'Supino Reto (Halteres)', 
    category: 'Peitoral', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Iniciante', 'Intermediário'], 
    icon: '⚖️',
    description: 'Maior liberdade articular que a barra.'
  },
  { 
    name: 'Puxada Alta Pronada', 
    category: 'Dorsal', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Iniciante', 'Intermediário'], 
    icon: '⬇️',
    description: 'Construção de força para barra fixa.'
  },

  // Intermediários
  { 
    name: 'Agachamento Livre (Barra)', 
    category: 'Pernas', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Intermediário', 'Avançado'], 
    icon: '🏋️',
    description: 'Exercício rei para membros inferiores.'
  },
  { 
    name: 'Levantamento Terra Romeno (Stiff)', 
    category: 'Pernas', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Intermediário', 'Avançado'], 
    icon: '🏗️',
    description: 'Foco em cadeia posterior e glúteos.'
  },
  { 
    name: 'Desenvolvimento Militar (Barra)', 
    category: 'Ombros', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Intermediário', 'Avançado'], 
    icon: '🎖️',
    description: 'Força bruta de empurrar vertical.'
  },

  // Avançados
  { 
    name: 'Barra Fixa (Pull-up)', 
    category: 'Dorsal', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Avançado'], 
    icon: '🧗',
    description: 'Máximo recrutamento de dorsais e bíceps.'
  },
  { 
    name: 'Agachamento Búlgaro', 
    category: 'Pernas', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Intermediário', 'Avançado'], 
    icon: '🇧🇬',
    description: 'Exercício unilateral de alta demanda metabólica.'
  },
  { 
    name: 'Afundo com Halteres (Walking Lunges)', 
    category: 'Pernas', 
    defaultStage: 'Principal', 
    recommendedLevels: ['Avançado'], 
    icon: '🚶',
    description: 'Dinâmico, foco em estabilidade e força.'
  },

  // --- ETAPA: FINALIZAÇÃO (METABÓLICO & RECOVERY) ---
  { 
    name: 'HIIT na Esteira (Sprints)', 
    category: 'Cardio', 
    defaultStage: 'Finalização', 
    recommendedLevels: ['Intermediário', 'Avançado'], 
    icon: '🏃',
    description: 'Maximização do EPOC pós-treino.'
  },
  { 
    name: 'Alongamento Estático Global', 
    category: 'Flexibilidade', 
    defaultStage: 'Finalização', 
    recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], 
    icon: '🧘',
    description: 'Relaxamento muscular e retorno à calma.'
  },
  { 
    name: 'Prancha Abdominal (Plank)', 
    category: 'Core', 
    defaultStage: 'Finalização', 
    recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], 
    icon: '🪵',
    description: 'Estabilidade final de core.'
  }
];

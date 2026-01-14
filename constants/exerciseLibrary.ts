
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
  // --- MOBILIDADE & PREPARAÇÃO ---
  { name: 'Mobilidade de Tornozelo (Cápsula)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🦶' },
  { name: 'Liberação de Grande Dorsal (Rolo)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🗞️' },
  { name: 'World Greatest Stretch', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Avançado'], icon: '🦎' },
  { name: 'Ativação de Core (Deadbug)', category: 'Core', defaultStage: 'Preparação', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🐜' },
  { name: 'Cat-Cow (Mobilidade Torácica)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Iniciante'], icon: '🐈' },
  { name: 'Mobilidade 90/90 para Quadril', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🧘' },
  { name: 'Facepull de Ativação (Cabo)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🏹' },

  // --- PEITORAL (CONVERGENTES & CABOS) ---
  { name: 'Supino Reto Convergente (Articulado)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🚜' },
  { name: 'Supino Inclinado Convergente (Hammer Style)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '📈' },
  { name: 'Supino Declinado Articulado', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '📉' },
  { name: 'Chest Press Horizontal (LifeFitness)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Iniciante'], icon: '💺' },
  { name: 'Fly na Polia (Ajuste Médio)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '❌' },
  { name: 'Fly na Polia de Baixo para Cima (Clavicular)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🔼' },
  { name: 'Fly na Polia de Cima para Baixo (Costal)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🔽' },
  { name: 'Pec Deck (Foco em Encurtamento)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🦋' },
  { name: 'Supino com Halteres (Banco Inclinado)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🏋️' },
  { name: 'Press no Cabo Unilateral (Iso-Lateral)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '🔀' },

  // --- DORSAL (VETORES VERTICAIS E HORIZONTAIS) ---
  { name: 'Puxada Unilateral na Polia (Frontal)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '💪' },
  { name: 'Puxada Alta Articulada (Vertical)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '⬇️' },
  { name: 'Diverging Lat Pulldown', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '📂' },
  { name: 'Remada Unilateral Articulada (High Row)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🧩' },
  { name: 'Remada Unilateral Articulada (Low Row)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🧱' },
  { name: 'Remada Cavalinho (Suporte de Peito)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🐎' },
  { name: 'Pullover no Cabo (Barra Reta)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🌊' },
  { name: 'Puxada Frontal com Triângulo', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🔻' },
  { name: 'Kayak Row (Remada Caiaque no Cabo)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '🚣' },
  { name: 'Barra Fixa (Assistida por Gravitron)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Iniciante'], icon: '🪜' },

  // --- MEMBROS INFERIORES (CADEIA POSTERIOR E ANTERIOR) ---
  { name: 'Hack Squat (Linear)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '⚔️' },
  { name: 'Agachamento Pendulum (Articulado)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '⛓️' },
  { name: 'Belt Squat (Agachamento com Cinturão)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '🎗️' },
  { name: 'Agachamento Smith (Pés à Frente)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🏛️' },
  { name: 'Agachamento Sissy (Máquina)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🪑' },
  { name: 'Leg Press 45 (Unilateral)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '📐' },
  { name: 'Leg Press Horizontal (Plataforma)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante'], icon: '➖' },
  { name: 'Cadeira Extensora (Série Drop-Set)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🦵' },
  { name: 'Mesa Flexora (Cúbito Ventral)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🛏️' },
  { name: 'Cadeira Flexora (Foco em Alongamento)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '💺' },
  { name: 'Glúteo Kickback na Polia Baixa', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🍑' },
  { name: 'Cadeira Adutora (Foco em Base)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante'], icon: '👐' },
  { name: 'Cadeira Abdutora (Tronco Inclinado)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '👐' },
  { name: 'Elevação Pélvica (Máquina)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🍑' },
  { name: 'Stiff com Barra (Peso Livre)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🏗️' },
  { name: 'Tibialis Raise (Elevação de Tibial)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🦴' },

  // --- OMBROS ---
  { name: 'Shoulder Press Articulado (Pegada Neutra)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🚀' },
  { name: 'Elevação Lateral Articulada', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🦅' },
  { name: 'Elevação Lateral na Polia (Baixa)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '➰' },
  { name: 'Elevação Lateral Y na Polia (Dual)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '✌️' },
  { name: 'Desenvolvimento Smith (Frente)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🏗️' },
  { name: 'Rear Delt (Pec Deck Inverso)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🔙' },
  { name: 'Facepull com Corda (Delt. Posterior)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Intermediário'], icon: '🔼' },

  // --- BRAÇOS ---
  { name: 'Rosca Scott (Máquina)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🦾' },
  { name: 'Bíceps Dual Cable (High Pulley)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '💪' },
  { name: 'Rosca Inversa na Polia (Braquial)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Intermediário'], icon: '↩️' },
  { name: 'Tríceps Pulley (Barra V)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '⬇️' },
  { name: 'Tríceps Katana (Cabo por trás da cabeça)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '⚔️' },
  { name: 'Tríceps Unilateral (Cabo - Sem pegador)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🧶' },
  { name: 'Tríceps Dip Machine (Paralela Guiada)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🪑' },

  // --- CORE & ABDOMINAIS ---
  { name: 'Abdominal Crunch na Polia (Corda)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🥨' },
  { name: 'Pallof Press (Anti-Rotação Cabo)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🛡️' },
  { name: 'Rotação de Tronco (Máquina Torso)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🔄' },
  { name: 'Woodchop na Polia (Diagonal)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🪓' },
  { name: 'Prancha Isométrica (Frontal)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🛡️' },

  // --- CARDIO & PERFORMANCE ---
  { name: 'Escada (Stairmaster)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🪜' },
  { name: 'Air Bike (Assault)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Avançado'], icon: '🚲' },
  { name: 'Esteira Skillmill (Curva)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Avançado'], icon: '🎢' },
  { name: 'Esteira (HIIT Sprints)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🏃' },
  { name: 'Remo (Concept 2)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🚣' }
];

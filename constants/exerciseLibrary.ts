
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
  { name: 'Mobilidade de Tornozelo (Parede)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🦶', description: 'Melhora a dorsiflexão para agachamentos profundos.' },
  { name: 'Gato-Camelo (Cat-Cow)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🐈', description: 'Mobilização da coluna vertebral e controle de core.' },
  { name: 'Liberação Miofascial (Foam Roller)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🗞️', description: 'Redução de pontos de tensão pré-treino.' },
  { name: 'Ativação de Glúteo (Band Walk)', category: 'Resistência', defaultStage: 'Preparação', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🎗️', description: 'Despertar neuromuscular do glúteo médio.' },
  { name: 'YTWL (Manguito Rotador)', category: 'Mobilidade', defaultStage: 'Preparação', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🙆', description: 'Estabilização escapular e saúde do ombro.' },

  // --- PEITORAL (MÁQUINAS & ARTICULADOS) ---
  { name: 'Supino Reto Articulado (Convergente)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🚜', description: 'Máquina convergente para maior recrutamento de fibras centrais.' },
  { name: 'Chest Press Horizontal (Máquina)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Iniciante'], icon: '💺', description: 'Estabilidade máxima para iniciantes desenvolverem força de base.' },
  { name: 'Supino Inclinado Articulado', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '📈', description: 'Foco na porção clavicular do peitoral maior.' },
  { name: 'Pec Deck (Voador)', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🦋', description: 'Isolamento em adução horizontal.' },
  { name: 'Cross Over Polia Alta', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '❌', description: 'Trabalho de cabos focado na porção inferior e definição.' },
  { name: 'Cross Over Polia Baixa', category: 'Peitoral', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🔝', description: 'Foco em fibras superiores com tração ascendente.' },

  // --- DORSAL (MÁQUINAS & ARTICULADOS) ---
  { name: 'Puxada Alta (Lat Pulldown) Aberta', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '⬇️', description: 'Clássico para largura das costas.' },
  { name: 'Puxada Unilateral Convergente', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🧩', description: 'Correção de assimetrias e maior amplitude de movimento.' },
  { name: 'Remada Baixa (Triângulo)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🚣', description: 'Foco em espessura do dorso e romboides.' },
  { name: 'Remada Cavalinho Articulada (T-Bar)', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🐎', description: 'Carga elevada com suporte para o tronco.' },
  { name: 'Pullover na Polia Alta', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🌊', description: 'Isolamento do latíssimo sem auxílio excessivo do bíceps.' },
  { name: 'Low Row Articulado', category: 'Dorsal', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '📉', description: 'Remada baixa convergente focada em grande dorsal inferior.' },

  // --- PERNAS (COMPLEXO INFERIOR) ---
  { name: 'Leg Press 45 Graus', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '📐', description: 'Base para hipertrofia de quadríceps e glúteos.' },
  { name: 'Leg Press Horizontal (Plataforma)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante'], icon: '➖', description: 'Ideal para reabilitação e controle de carga.' },
  { name: 'Hack Squat (Máquina)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '⚔️', description: 'Estabilidade total para foco em quadríceps profundo.' },
  { name: 'Cadeira Extensora (Iso-lateral)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🦵', description: 'Isolamento total de quadríceps.' },
  { name: 'Mesa Flexora (Lying Leg Curl)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🛏️', description: 'Foco em isquiotibiais.' },
  { name: 'Cadeira Flexora (Seated Leg Curl)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '💺', description: 'Conforto e eficiência para posteriores.' },
  { name: 'Cadeira Adutora', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '👐', description: 'Fortalecimento de adutores da coxa.' },
  { name: 'Cadeira Abdutora', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '👐', description: 'Foco em glúteo médio e estabilidade lateral.' },
  { name: 'Gêmeos Sentado (Calf Press)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🦶', description: 'Foco no músculo sóleo.' },
  { name: 'Gêmeos em Pé (Smith ou Máquina)', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🧍', description: 'Foco no gastrocnêmio.' },
  { name: 'Agachamento Pendulum', category: 'Pernas', defaultStage: 'Principal', recommendedLevels: ['Avançado'], icon: '⛓️', description: 'Máquina avançada com curva de força otimizada.' },

  // --- OMBROS ---
  { name: 'Desenvolvimento de Ombros (Shoulder Press) Máquina', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🚀', description: 'Força vertical estável.' },
  { name: 'Elevação Lateral na Polia', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🦅', description: 'Tensão constante no deltoide lateral.' },
  { name: 'Elevação Lateral (Máquina)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🔩', description: 'Isolamento mecânico sem "roubo".' },
  { name: 'Crucifixo Inverso (Pec Deck Invertido)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🔙', description: 'Foco no deltoide posterior.' },
  { name: 'Face Pull (Corda na Polia Alta)', category: 'Ombros', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🎭', description: 'Saúde do ombro e deltoide posterior.' },

  // --- BRAÇOS (BÍCEPS & TRÍCEPS) ---
  { name: 'Rosca Scott (Preacher Curl) Máquina', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🦾', description: 'Isolamento extremo do bíceps.' },
  { name: 'Rosca Direta na Polia (Barra W)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '➰', description: 'Tensão constante durante toda a fase.' },
  { name: 'Tríceps Pulley (Corda)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🧶', description: 'Foco em cabeça lateral do tríceps.' },
  { name: 'Tríceps Testa na Polia (Barra Reta)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🤯', description: 'Extensão de cotovelo com torque estável.' },
  { name: 'Tríceps Máquina (Dips)', category: 'Braços', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🪑', description: 'Versão segura e guiada das paralelas.' },

  // --- CORE & ABDOMINAIS ---
  { name: 'Abdominal Infra na Paralela (Capitão)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🪜', description: 'Foco em porção inferior do reto abdominal.' },
  { name: 'Abdominal Máquina (Crunch Machine)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🥨', description: 'Flexão de tronco com carga progressiva.' },
  { name: 'Rotação de Tronco (Rotary Torso)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '🔄', description: 'Foco em oblíquos internos e externos.' },
  { name: 'Extensão de Lombar (Máquina)', category: 'Core', defaultStage: 'Principal', recommendedLevels: ['Iniciante', 'Intermediário'], icon: '⚓', description: 'Fortalecimento de eretores da espinha.' },

  // --- CARDIO & RESISTÊNCIA ---
  { name: 'Simulador de Escada (Stairmaster)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🪜', description: 'Alto gasto calórico e ativação de glúteos.' },
  { name: 'Bicicleta Ergométrica (Air Bike)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Intermediário', 'Avançado'], icon: '🚲', description: 'Resistência metabólica de corpo inteiro.' },
  { name: 'Remo Seco (Indoor Rower)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Iniciante', 'Intermediário', 'Avançado'], icon: '🚣', description: 'Cardio de baixo impacto e alta eficiência.' },
  { name: 'Elíptico (Cross Trainer)', category: 'Cardio', defaultStage: 'Finalização', recommendedLevels: ['Iniciante'], icon: '🎿', description: 'Preservação articular com movimento fluido.' }
];


export interface PeriodizationPhase {
  name: string;
  durationWeeks: number;
  objective: string;
  intensityRange: string;
  detailedDescription: string;
  focusCategories: string[];
  color: string;
}

export interface PeriodizationModel {
  id: string;
  author: string;
  name: string;
  description: string;
  theory: string;
  differentials: string[];
  phases: PeriodizationPhase[];
}

export const PERIODIZATION_MODELS: PeriodizationModel[] = [
  {
    id: 'bompa_linear',
    author: 'Tudor Bompa',
    name: 'Periodização Clássica Linear',
    description: 'A base da musculação moderna. Progressão constante de volume para intensidade.',
    theory: 'Prioriza a integridade estrutural antes de cargas máximas. Ideal para quem busca hipertrofia estética e saúde a longo prazo.',
    differentials: [
      'Segurança articular elevada',
      'Excelente para hipertrofia crônica',
      'Fácil monitoramento de carga'
    ],
    phases: [
      { 
        name: 'Adaptação Anatômica', 
        durationWeeks: 3, 
        objective: 'Resistência Muscular Localizada', 
        intensityRange: '40-60% 1RM',
        detailedDescription: 'Foco em recrutar o maior número de fibras e fortalecer tendões. Cadência controlada.',
        focusCategories: ['Mobilidade', 'Reabilitação', 'Core', 'Resistência'],
        color: 'bg-blue-500' 
      },
      { 
        name: 'Hipertrofia', 
        durationWeeks: 5, 
        objective: 'Aumento de Volume Muscular', 
        intensityRange: '60-80% 1RM',
        detailedDescription: 'Estresse metabólico e tensão mecânica. Foco em falha concêntrica ou próxima dela.',
        focusCategories: ['Peitoral', 'Dorsal', 'Pernas', 'Braços'],
        color: 'bg-purple-600' 
      },
      { 
        name: 'Força Máxima', 
        durationWeeks: 4, 
        objective: 'Recrutamento de Unidades Motoras', 
        intensityRange: '85-90% 1RM',
        detailedDescription: 'Baixas repetições, foco em força pura e coordenação intramuscular.',
        focusCategories: ['Peitoral', 'Dorsal', 'Pernas'], // Foco em multiarticulares
        color: 'bg-rose-600' 
      }
    ]
  },
  {
    id: 'verkhoshansky_blocks',
    author: 'Yuri Verkhoshansky',
    name: 'Treinamento em Bloco (Carga Concentrada)',
    description: 'Sistema avançado para atletas que precisam de picos de performance específicos.',
    theory: 'Usa o Efeito de Treinamento Residual. Concentra uma carga enorme de um único tipo em um bloco para "saturar" o sistema.',
    differentials: [
      'Maior transferência para esportes',
      'Evita a monotonia do treinamento',
      'Picos de performance muito acentuados'
    ],
    phases: [
      { 
        name: 'Bloco A (Acumulação)', 
        durationWeeks: 4, 
        objective: 'Potencial Motor', 
        intensityRange: '75-85% 1RM',
        detailedDescription: 'Volume alto de exercícios básicos para criar uma base de força absoluta.',
        focusCategories: ['Pernas', 'Dorsal', 'Peitoral', 'Core'],
        color: 'bg-indigo-600' 
      },
      { 
        name: 'Bloco B (Transmutação)', 
        durationWeeks: 4, 
        objective: 'Conversão Técnica', 
        intensityRange: '85-95% 1RM',
        detailedDescription: 'Exercícios específicos do esporte ou pliometria para converter força em potência.',
        focusCategories: ['Resistência', 'Pernas', 'Ombros'], // Foco em explosão
        color: 'bg-amber-600' 
      },
      { 
        name: 'Bloco C (Realização)', 
        durationWeeks: 2, 
        objective: 'Supercompensação', 
        intensityRange: 'Tapering',
        detailedDescription: 'Redução drástica de volume para permitir a recuperação total e o pico de força.',
        focusCategories: ['Mobilidade', 'Flexibilidade', 'Cardio'],
        color: 'bg-emerald-500' 
      }
    ]
  },
  {
    id: 'matveev_traditional',
    author: 'Leo Matveev',
    name: 'Periodização Tradicional (Modelagem Anual)',
    description: 'O modelo "pai" de todos. Excelente para iniciantes e atletas de base.',
    theory: 'Mudança gradual de caráter geral para específico. Baseada nos ciclos biológicos de adaptação.',
    differentials: [
      'Versatilidade total',
      'Progressão muito segura',
      'Fácil compreensão para o aluno'
    ],
    phases: [
      { 
        name: 'Preparatório Geral', 
        durationWeeks: 6, 
        objective: 'Condicionamento de Base', 
        intensityRange: '50-70%',
        detailedDescription: 'Grande variedade de exercícios para evitar desequilíbrios musculares.',
        focusCategories: ['Cardio', 'Resistência', 'Mobilidade', 'Core'],
        color: 'bg-slate-600' 
      },
      { 
        name: 'Preparatório Especial', 
        durationWeeks: 4, 
        objective: 'Especificidade do Gesto', 
        intensityRange: '70-85%',
        detailedDescription: 'Aproximação dos exercícios com a meta final do aluno.',
        focusCategories: ['Peitoral', 'Dorsal', 'Pernas', 'Ombros'],
        color: 'bg-sky-600' 
      },
      { 
        name: 'Competitivo/Manutenção', 
        durationWeeks: 2, 
        objective: 'Performance Máxima', 
        intensityRange: '90-100%',
        detailedDescription: 'Foco total no objetivo principal com o máximo de intensidade possível.',
        focusCategories: ['Peitoral', 'Dorsal', 'Pernas'],
        color: 'bg-orange-600' 
      }
    ]
  }
];

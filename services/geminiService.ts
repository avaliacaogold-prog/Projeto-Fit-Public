
// @google/genai Senior Frontend Engineer: Enhanced physical & health analysis
import { GoogleGenAI, Type } from "@google/genai";
import { Evaluation, Client, TrainingProgram } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIInsights = async (current: Evaluation, client: Client, history: Evaluation[]) => {
  const previous = history.length > 0 ? history[0] : null;
  
  const prompt = `
    Analise o prontuário físico e de saúde deste cliente:
    
    PERFIL: ${client.name}, ${client.gender}, Idade: ${current.ageAtEvaluation} anos
    ANAMNESE:
    - Estilo de Vida: ${current.anamnesis.lifestyle}
    - Qualidade Sono: ${current.anamnesis.sleepQuality}
    - Hidratação: ${current.anamnesis.waterIntake}L/dia
    - Histórico Médico: ${current.anamnesis.medicalHistory}
    - Lesões: ${current.anamnesis.injuries}
    
    DADOS ATUAIS (${current.date}):
    - Peso: ${current.weight}kg, Gordura: ${current.bodyFat.toFixed(1)}%
    - VO2 Max: ${current.functional?.vo2Max?.toFixed(1) || 'N/A'} (${current.functional?.vo2Classification || 'N/A'})
    - Massa Magra: ${current.leanMass.toFixed(1)}kg
    - TDEE: ${current.tdee.toFixed(0)} kcal
    
    Por favor, forneça uma análise de especialista resumida em português sobre o estado atual do cliente e recomendações imediatas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "Análise indisponível no momento.";
  } catch (error) {
    return "Erro ao processar análise evolutiva via IA.";
  }
};

export const getSuggestedTraining = async (evaluation: Evaluation, client: Client, splitLetter: string = 'A') => {
  const prompt = `
    Como um Personal Trainer de elite, crie um programa de treinamento personalizado para a FICHA ${splitLetter} de um split ${client.targetSplit || 'ABC'}.
    O programa deve obrigatoriamente ser dividido em 3 ETAPAS: 'Preparação', 'Principal' e 'Finalização'.
    
    CLIENTE: ${client.name}, ${client.gender}, ${evaluation.ageAtEvaluation} anos
    DIVISÃO ALVO: Ficha ${splitLetter} de um programa ${client.targetSplit || 'ABC'}.
    OBJETIVO: Baseado no BF de ${evaluation.bodyFat.toFixed(1)}% e VO2 de ${evaluation.functional?.vo2Max?.toFixed(1)}.
    LIMITAÇÕES: ${evaluation.anamnesis.injuries || 'Nenhuma'}
    
    Exemplo: Se for ficha A de um ABC, foque em um agrupamento específico (ex: Peito/Tríceps ou Pernas).
    
    O JSON deve seguir este formato estrito:
    {
      "title": "Nome Sugerido para esta Ficha (ex: Peitoral e Deltoides)",
      "level": "Iniciante" | "Intermediário" | "Avançado",
      "description": "Justificativa curta da escolha dos exercícios para a Ficha ${splitLetter}",
      "exercises": [
        {"name": "Exercício", "sets": "3", "reps": "12", "rest": "60s", "stage": "Preparação" | "Principal" | "Finalização"}
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            level: { type: Type.STRING, enum: ['Iniciante', 'Intermediário', 'Avançado'] },
            description: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  rest: { type: Type.STRING },
                  stage: { type: Type.STRING, enum: ['Preparação', 'Principal', 'Finalização'] }
                }
              }
            }
          },
          required: ["title", "level", "description", "exercises"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao gerar treino via IA:", error);
    return null;
  }
};

export const auditTrainingProgram = async (program: Partial<TrainingProgram>, client: Client) => {
  const prompt = `
    Como um auditor técnico de educação física (ACSM), analise este treino e identifique erros ou pontos de melhoria.
    
    ALUNO: ${client.name}, Nível: ${program.level}, Split: ${program.splitType} - Letra ${program.splitLetter}
    TREINO: ${program.title}
    EXERCÍCIOS: ${JSON.stringify(program.exercises?.map(e => ({ name: e.name, stage: e.stage, sets: e.sets, reps: e.reps })))}
    
    Verifique se os exercícios condizem com a letra ${program.splitLetter} (Ex: Peito no treino A, Perna no C) considerando o split ${program.splitType}.
    
    Responda em um formato de tópicos curto e direto em português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.3 }
    });
    return response.text;
  } catch (error) {
    return "Falha na auditoria inteligente.";
  }
};

export const generateEvolutionEmail = async (client: Client, lastEval: Evaluation, training: TrainingProgram[]) => {
  const prompt = `
    Como um Personal Trainer profissional e atencioso, escreva um rascunho de e-mail para o aluno ${client.name} resumindo o progresso dele.
    
    DADOS DA ÚLTIMA AVALIAÇÃO:
    - Peso: ${lastEval.weight}kg
    - Gordura Corporal: ${lastEval.bodyFat.toFixed(1)}%
    
    TREINOS ATIVOS:
    ${training.map(t => `- Ficha ${t.splitLetter}: ${t.title}`).join('\n')}
    
    O e-mail deve ser motivador. Não use Markdown complexo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    return "Erro ao gerar rascunho de e-mail.";
  }
};

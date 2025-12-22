
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

export const getSuggestedTraining = async (evaluation: Evaluation, client: Client) => {
  const prompt = `
    Como um Personal Trainer de elite, crie um programa de treinamento personalizado em JSON para este cliente.
    O programa deve obrigatoriamente ser dividido em 3 ETAPAS: 'Preparação' (aquecimento/mobilidade), 'Principal' (força/foco) e 'Finalização' (cardio/flexibilidade).
    
    CLIENTE: ${client.name}, ${client.gender}, ${evaluation.ageAtEvaluation} anos
    OBJETIVO: Perda de peso e melhora do condicionamento (VO2: ${evaluation.functional?.vo2Max?.toFixed(1)}).
    FAT MASS: ${evaluation.bodyFat.toFixed(1)}%
    LIMITAÇÕES: ${evaluation.anamnesis.injuries || 'Nenhuma'}
    
    O JSON deve seguir este formato estrito:
    {
      "title": "Nome do Programa",
      "level": "Iniciante" | "Intermediário" | "Avançado",
      "description": "Justificativa curta baseada nos dados",
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
    
    Verifique:
    1. O volume de séries é adequado para o nível ${program.level}?
    2. Os exercícios condizem com a letra ${program.splitLetter} (Ex: Peito no treino A, Perna no C)?
    3. Existem fases de Preparação e Finalização?
    4. Há algum risco biomecânico óbvio?
    
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

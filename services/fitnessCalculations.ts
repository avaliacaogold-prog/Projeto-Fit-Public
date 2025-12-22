
import { Skinfolds, EvaluationProtocol, VO2ProtocolType, Perimeters } from '../types';

export const validateSanity = (value: number, min: number, max: number): number => {
  if (isNaN(value) || value === null || value === 0) return 0;
  return Math.min(Math.max(value, min), max);
};

export const getIMCClassification = (weight: number, height: number) => {
  const imc = weight / (Math.pow(height / 100, 2));
  let status = "Normal";
  let color = "#10b981"; // emerald-500

  if (imc < 18.5) { status = "Abaixo do Peso"; color = "#f59e0b"; }
  else if (imc >= 25 && imc < 30) { status = "Sobrepeso"; color = "#f59e0b"; }
  else if (imc >= 30) { status = "Obesidade"; color = "#ef4444"; }

  return { value: imc, status, color };
};

export const getBFClassification = (bf: number, gender: 'M' | 'F' | 'O') => {
  const isMale = gender === 'M';
  if (isMale) {
    if (bf < 10) return { status: "Atleta", color: "#10b981" };
    if (bf < 15) return { status: "Excelente", color: "#10b981" };
    if (bf < 20) return { status: "Bom/Normal", color: "#10b981" };
    if (bf < 25) return { status: "Elevado", color: "#f59e0b" };
    return { status: "Muito Elevado", color: "#ef4444" };
  } else {
    if (bf < 15) return { status: "Atleta", color: "#10b981" };
    if (bf < 22) return { status: "Excelente", color: "#10b981" };
    if (bf < 28) return { status: "Bom/Normal", color: "#10b981" };
    if (bf < 32) return { status: "Elevado", color: "#f59e0b" };
    return { status: "Muito Elevado", color: "#ef4444" };
  }
};

export const getRCQ = (waist: number, hips: number, gender: 'M' | 'F' | 'O') => {
  if (!waist || !hips) return null;
  const rcq = waist / hips;
  const isMale = gender === 'M';
  let status = "Baixo Risco";
  let color = "#10b981";

  const threshold = isMale ? 0.95 : 0.85;
  if (rcq > threshold) { status = "Risco Elevado"; color = "#ef4444"; }

  return { value: rcq, status, color };
};

export const calculateBodyFat = (
  protocol: EvaluationProtocol,
  skinfolds: Skinfolds,
  age: number,
  gender: 'M' | 'F' | 'O',
  weight: number,
  height: number,
  perimeters?: Perimeters
): number => {
  const isMale = gender === 'M';
  const sf = {
    triceps: skinfolds?.triceps || 0,
    biceps: skinfolds?.biceps || 0,
    subscapular: skinfolds?.subscapular || 0,
    suprailiac: skinfolds?.suprailiac || 0,
    abdominal: skinfolds?.abdominal || 0,
    chest: skinfolds?.chest || 0,
    thigh: skinfolds?.thigh || 0,
    midaxillary: skinfolds?.midaxillary || 0,
    calf: skinfolds?.calf || 0,
  };

  try {
    switch (protocol) {
      case 'Pollock3': {
        const sum = isMale ? (sf.chest + sf.abdominal + sf.thigh) : (sf.triceps + sf.suprailiac + sf.thigh);
        if (sum === 0) return 0;
        const density = isMale
          ? 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age)
          : 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
        return validateSanity(((4.95 / density) - 4.50) * 100, 2, 60);
      }
      case 'Pollock7': {
        const sum = sf.chest + sf.midaxillary + sf.triceps + sf.subscapular + sf.abdominal + sf.suprailiac + sf.thigh;
        if (sum === 0) return 0;
        const density = isMale
          ? 1.112 - (0.00043499 * sum) + (0.00000055 * Math.pow(sum, 2)) - (0.00028826 * age)
          : 1.097 - (0.00046971 * sum) + (0.00000056 * Math.pow(sum, 2)) - (0.00012828 * age);
        return validateSanity(((4.95 / density) - 4.50) * 100, 2, 60);
      }
      case 'Guedes': {
        const sum = sf.triceps + sf.suprailiac + sf.abdominal;
        if (sum === 0) return 0;
        const density = isMale ? 1.17136 - (0.06706 * Math.log10(sum)) : 1.16650 - (0.07063 * Math.log10(sum));
        return validateSanity(((4.95 / density) - 4.50) * 100, 2, 60);
      }
      case 'Petroski': {
        const sum = sf.subscapular + sf.triceps + sf.suprailiac + sf.calf;
        if (sum === 0) return 0;
        const density = isMale
          ? 1.10726863 - (0.00081201 * sum) + (0.00000212 * Math.pow(sum, 2)) - (0.00041761 * age)
          : 1.05481122 - (0.00082334 * sum) + (0.000003 * Math.pow(sum, 2)) - (0.0001392 * age);
        return validateSanity(((4.95 / density) - 4.50) * 100, 2, 60);
      }
      case 'Faulkner': {
        const sum = sf.triceps + sf.subscapular + sf.suprailiac + sf.abdominal;
        if (sum === 0) return 0;
        return validateSanity((sum * 0.153) + 5.783, 3, 60);
      }
      case 'Weltman': {
        const abd = perimeters?.abdomen || perimeters?.waist || 0;
        if (abd === 0) return 0;
        return isMale 
          ? validateSanity((0.31457 * abd) - (0.10969 * weight) + 10.8336, 5, 65)
          : validateSanity((0.11077 * abd) - (0.17666 * height) + (0.14354 * weight) + 29.7403, 8, 70);
      }
      case 'Slaughter': {
        const sum = sf.triceps + sf.subscapular;
        if (sum === 0) return 0;
        let bf = isMale 
          ? (sum > 35 ? (0.783 * sum + 1.6) : (1.21 * sum - 0.008 * Math.pow(sum, 2) - 1.7))
          : (sum > 35 ? (0.546 * sum + 9.7) : (1.33 * sum - 0.013 * Math.pow(sum, 2) - 2.5));
        return validateSanity(bf, 3, 50);
      }
      default: return 0;
    }
  } catch (e) { return 0; }
};

export const calculateMetabolism = (weight: number, height: number, age: number, gender: 'M' | 'F' | 'O', leanMass: number) => {
  if (leanMass <= 0) return { bmr: 0, tdee: 0 };
  const bmr = 370 + (21.6 * leanMass);
  const tdee = bmr * 1.55; 
  return { bmr, tdee };
};

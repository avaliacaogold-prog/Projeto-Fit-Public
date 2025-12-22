
import { Skinfolds, EvaluationProtocol, Perimeters, Somatotype } from '../types';

export const calculateAge = (birthDate: string, referenceDate: string = new Date().toISOString()): number => {
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getIMCClassification = (weight: number, height: number) => {
  const imc = weight / (Math.pow(height / 100, 2));
  let status = "Eutrófico";
  let color = "#10b981";

  if (imc < 18.5) { status = "Abaixo do Peso"; color = "#f59e0b"; }
  else if (imc >= 25 && imc < 30) { status = "Sobrepeso"; color = "#f59e0b"; }
  else if (imc >= 30 && imc < 35) { status = "Obesidade G1"; color = "#ef4444"; }
  else if (imc >= 35) { status = "Obesidade G2/G3"; color = "#b91c1c"; }

  return { value: imc, status, color };
};

// Fix: Updated signature to include 'YMCA' to match FunctionalData definition in types.ts
export const calculateVO2Max = (protocol: 'Cooper' | 'Rockport' | 'YMCA', testValue: number, age: number, weight: number, gender: 'M' | 'F' | 'O', hrFinal?: number) => {
  if (protocol === 'Cooper') {
    // testValue = distância em metros
    if (!testValue) return 0;
    return (testValue - 504.9) / 44.73;
  }
  
  if (protocol === 'Rockport') {
    // testValue = tempo em minutos (ex: 12.5 para 12min30s)
    const weightLb = weight * 2.20462;
    const genderCode = gender === 'M' ? 1 : 0;
    const hr = hrFinal || 120;
    if (!testValue) return 0;
    return 132.853 - (0.0769 * weightLb) - (0.3877 * age) + (6.315 * genderCode) - (3.2649 * testValue) - (0.1565 * hr);
  }

  return 0;
};

export const calculateSomatotype = (skinfolds: Skinfolds, perimeters: Perimeters, height: number, weight: number): Somatotype => {
  // Heath-Carter Simplified Formula
  const sum3 = skinfolds.triceps + skinfolds.subscapular + skinfolds.suprailiac;
  const hCorrected = sum3 * (170.18 / height);
  
  // Endomorphy
  const endo = -0.7182 + (0.1451 * hCorrected) - (0.00068 * Math.pow(hCorrected, 2)) + (0.0000014 * Math.pow(hCorrected, 3));
  
  // Mesomorphy (Simplified for web app - requires femur/humerus diameters for full accuracy)
  // Here we use a ratio of corrected arm/calf girth to height
  const armCorr = perimeters.armFlexed - (skinfolds.triceps / 10);
  const calfCorr = perimeters.calf - (skinfolds.calf / 10);
  const meso = (0.85 * 5.5) + (0.601 * 7.5) + (0.188 * armCorr) + (0.161 * calfCorr) - (0.131 * height) + 4.5;
  
  // Ectomorphy
  const hwr = height / Math.pow(weight, 1/3);
  let ecto = 0;
  if (hwr >= 40.75) ecto = (hwr * 0.732) - 28.58;
  else if (hwr < 40.75 && hwr > 38.25) ecto = (hwr * 0.463) - 17.63;
  else ecto = 0.1;

  let classification = "Central";
  if (endo > meso + 1 && endo > ecto + 1) classification = "Endomorfo";
  else if (meso > endo + 1 && meso > ecto + 1) classification = "Mesomorfo";
  else if (ecto > endo + 1 && ecto > meso + 1) classification = "Ectomorfo";

  return {
    endomorphy: parseFloat(endo.toFixed(1)),
    mesomorphy: parseFloat(meso.toFixed(1)),
    ectomorphy: parseFloat(ecto.toFixed(1)),
    classification
  };
};

export const getVO2Classification = (vo2: number, age: number, gender: 'M' | 'F' | 'O') => {
  if (vo2 <= 0) return { status: 'N/A', color: '#cbd5e1' };
  const isMale = gender === 'M';
  
  if (isMale) {
    if (vo2 > 50) return { status: 'Excelente', color: '#10b981' };
    if (vo2 > 40) return { status: 'Bom', color: '#6366f1' };
    if (vo2 > 30) return { status: 'Médio', color: '#f59e0b' };
    return { status: 'Fraco', color: '#ef4444' };
  } else {
    if (vo2 > 42) return { status: 'Excelente', color: '#10b981' };
    if (vo2 > 33) return { status: 'Bom', color: '#6366f1' };
    if (vo2 > 25) return { status: 'Médio', color: '#f59e0b' };
    return { status: 'Fraco', color: '#ef4444' };
  }
};

export const calculateBodyFat = (
  protocol: EvaluationProtocol,
  skinfolds: Skinfolds,
  age: number,
  gender: 'M' | 'F' | 'O',
  weight: number,
  height: number,
  perimeters: Perimeters
): number => {
  const isMale = gender === 'M';
  const sf = skinfolds;

  try {
    if (protocol === 'Pollock7') {
      const sum = sf.chest + sf.midaxillary + sf.triceps + sf.subscapular + sf.abdominal + sf.suprailiac + sf.thigh;
      if (sum === 0) return 0;
      const density = isMale
        ? 1.112 - (0.00043499 * sum) + (0.00000055 * Math.pow(sum, 2)) - (0.00028826 * age)
        : 1.097 - (0.00046971 * sum) + (0.00000056 * Math.pow(sum, 2)) - (0.00012828 * age);
      return ((4.95 / density) - 4.50) * 100;
    }
    
    if (protocol === 'Pollock3') {
      const sum = isMale 
        ? (sf.chest + sf.abdominal + sf.thigh)
        : (sf.triceps + sf.suprailiac + sf.thigh);
      
      const density = isMale
        ? 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age)
        : 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
      return ((4.95 / density) - 4.50) * 100;
    }

    return 15; // Fallback
  } catch (e) { return 0; }
};

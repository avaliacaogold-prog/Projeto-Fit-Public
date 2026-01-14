
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

export const getActivityFactor = (lifestyle: string): number => {
  const map: Record<string, number> = {
    'sedentário': 1.2,
    'levemente ativo': 1.375,
    'moderado': 1.55,
    'ativo': 1.725,
    'muito ativo': 1.9
  };
  return map[lifestyle.toLowerCase()] || 1.55;
};

export const calculateTDEE = (bmr: number, lifestyle: string): number => {
  return bmr * getActivityFactor(lifestyle);
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
      return Math.max(3, ((4.95 / density) - 4.50) * 100);
    }
    
    if (protocol === 'Pollock3') {
      const sum = isMale 
        ? (sf.chest + sf.abdominal + sf.thigh)
        : (sf.triceps + sf.suprailiac + sf.thigh);
      const density = isMale
        ? 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age)
        : 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
      return Math.max(3, ((4.95 / density) - 4.50) * 100);
    }

    if (protocol === 'Faulkner') {
      const sum = sf.triceps + sf.subscapular + sf.suprailiac + sf.abdominal;
      return (sum * 0.153) + 5.783;
    }

    if (protocol === 'Guedes') {
      const sum = isMale 
        ? (sf.triceps + sf.suprailiac + sf.abdominal)
        : (sf.triceps + sf.suprailiac + sf.thigh);
      const density = isMale 
        ? 1.1714 - (0.063 * Math.log10(sum))
        : 1.1665 - (0.0706 * Math.log10(sum));
      return ((4.95 / density) - 4.50) * 100;
    }

    if (protocol === 'Petroski') {
      // Petroski (1995) uses: Subscapular, Triceps, Suprailiac, and Calf (Panturrilha) for both genders
      const sum = sf.subscapular + sf.triceps + sf.suprailiac + sf.calf;
      if (sum === 0) return 0;
      const density = isMale 
        ? 1.10726863 - (0.0012836 * sum) + (0.00000168 * Math.pow(sum, 2)) - (0.00012873 * age)
        : 1.1954713 - (0.07513507 * Math.log10(sum)) - (0.00041072 * age);
      return ((4.95 / density) - 4.50) * 100;
    }

    return 15;
  } catch (e) { return 0; }
};

export const calculateVO2Max = (protocol: 'Cooper' | 'Rockport' | 'YMCA', testValue: number, age: number, weight: number, gender: 'M' | 'F' | 'O', hrFinal?: number) => {
  if (protocol === 'Cooper') {
    if (!testValue || testValue < 505) return 0;
    return (testValue - 504.9) / 44.73;
  }
  
  if (protocol === 'Rockport') {
    if (!testValue || testValue <= 0) return 0;
    const weightLb = weight * 2.20462;
    const genderCode = gender === 'M' ? 1 : 0;
    const hr = hrFinal || 120;
    const vo2 = 132.853 - (0.0769 * weightLb) - (0.3877 * age) + (6.315 * genderCode) - (3.2649 * testValue) - (0.1565 * hr);
    return Math.max(5, vo2);
  }

  return 0;
};

export const calculateSomatotype = (skinfolds: Skinfolds, perimeters: Perimeters, height: number, weight: number): Somatotype => {
  const sum3 = skinfolds.triceps + skinfolds.subscapular + skinfolds.suprailiac;
  const hCorrected = sum3 * (170.18 / height);
  const endo = -0.7182 + (0.1451 * hCorrected) - (0.00068 * Math.pow(hCorrected, 2)) + (0.0000014 * Math.pow(hCorrected, 3));
  
  const armCorr = perimeters.armFlexed - (skinfolds.triceps / 10);
  const calfCorr = perimeters.calf - (skinfolds.calf / 10);
  const meso = (0.85 * 5.5) + (0.601 * 7.5) + (0.188 * armCorr) + (0.161 * calfCorr) - (0.131 * height) + 4.5;
  
  const hwr = height / Math.pow(weight, 1/3);
  let ecto = 0.1;
  if (hwr >= 40.75) ecto = (hwr * 0.732) - 28.58;
  else if (hwr < 40.75 && hwr > 38.25) ecto = (hwr * 0.463) - 17.63;

  let classification = "Central";
  if (endo > meso + 0.5 && endo > ecto + 0.5) classification = "Endomorfo";
  else if (meso > endo + 0.5 && meso > ecto + 0.5) classification = "Mesomorfo";
  else if (ecto > endo + 0.5 && ecto > meso + 0.5) classification = "Ectomorfo";

  return {
    endomorphy: parseFloat(Math.max(0.1, endo).toFixed(1)),
    mesomorphy: parseFloat(Math.max(0.1, meso).toFixed(1)),
    ectomorphy: parseFloat(Math.max(0.1, ecto).toFixed(1)),
    classification
  };
};

export const getVO2Classification = (vo2: number, age: number, gender: 'M' | 'F' | 'O') => {
  if (vo2 <= 0) return { status: 'N/A', color: '#cbd5e1' };
  const isMale = gender === 'M';
  
  if (isMale) {
    if (vo2 > 52) return { status: 'Excelente', color: '#10b981' };
    if (vo2 > 42) return { status: 'Bom', color: '#6366f1' };
    if (vo2 > 33) return { status: 'Médio', color: '#f59e0b' };
    return { status: 'Fraco', color: '#ef4444' };
  } else {
    if (vo2 > 45) return { status: 'Excelente', color: '#10b981' };
    if (vo2 > 35) return { status: 'Bom', color: '#6366f1' };
    if (vo2 > 28) return { status: 'Médio', color: '#f59e0b' };
    return { status: 'Fraco', color: '#ef4444' };
  }
};

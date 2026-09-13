import { ExerciseStep, Quest, TrainingVector, UserProfile, BenchmarkDiscipline } from '../types';

/**
 * Coeficiente de impacto articular y muscular según tipo de regresión
 */
export function getRegressionWeight(equipment: ExerciseStep['equipment'], isAssisted: boolean): number {
  if (isAssisted || equipment === 'bandas') return 0.55;
  if (equipment === 'suelo' || equipment === 'parcela') return 0.75;
  if (equipment === 'barra' || equipment === 'paralelas') return 1.0;
  return 0.7;
}

/**
 * Calcula las Unidades de Carga Efectiva (UCE) de una lista de ejercicios
 */
export function calculateUCE(exercises: ExerciseStep[]): number {
  return exercises.reduce((acc, ex) => {
    const isAssisted = ex.regressionTip.toLowerCase().includes('apoyo') || ex.regressionTip.toLowerCase().includes('banda');
    const omega = getRegressionWeight(ex.equipment, isAssisted);
    const volume = ex.sets * (ex.isDuration ? ex.repsOrDuration / 10 : ex.repsOrDuration);
    const intensity = Math.min(10, Math.max(1, ex.targetRPE)) / 10;
    return acc + Math.round(volume * intensity * omega * 2.5);
  }, 0);
}

/**
 * Algoritmo biomatemático de dilución progresiva del déficit.
 * PROHIBICIÓN ESTRICTA: El déficit NO se acumula en la semana o mes actual.
 * Se amortiza de manera infinitesimal a lo largo de TODAS las semanas restantes.
 */
export function calculateDilution(
  accumulatedDeficitUCE: number,
  weeksRemaining: number,
  baseWeeklyUCE: number
): { bonusPerWeek: number; safeWeeklyTarget: number; explanation: string } {
  if (accumulatedDeficitUCE <= 0 || weeksRemaining <= 0) {
    return {
      bonusPerWeek: 0,
      safeWeeklyTarget: baseWeeklyUCE,
      explanation: 'Sin déficit pendiente. Carga basal equilibrada.',
    };
  }

  // Factor de seguridad K_buffer = 1.25 para evitar picos de sobreuso tendinoso
  const K_buffer = 1.25;
  const rawBonus = accumulatedDeficitUCE / (weeksRemaining * K_buffer);

  // Límite de seguridad ACWR (Acute:Chronic Workload Ratio) <= +6% semanal
  const maxWeeklyIncrease = baseWeeklyUCE * 0.06;
  const safeBonus = Math.min(rawBonus, maxWeeklyIncrease);

  const safeWeeklyTarget = Math.round(baseWeeklyUCE + safeBonus);

  const explanation = `Déficit de ${Math.round(
    accumulatedDeficitUCE
  )} UCE diluido entre las ${weeksRemaining} semanas restantes (+${safeBonus.toFixed(
    1
  )} UCE/sem, máx +6% de seguridad ACWR). Cero sobrecarga en la semana actual.`;

  return {
    bonusPerWeek: Number(safeBonus.toFixed(1)),
    safeWeeklyTarget,
    explanation,
  };
}

/**
 * Curva sigmoidea para la progresión adaptativa
 */
export function getSigmoidalFactor(currentWeek: number, totalWeeks: number): number {
  if (totalWeeks <= 0) return 0;
  const t = (currentWeek / totalWeeks) * 10 - 5; // Mapeado de -5 a +5
  return 1 / (1 + Math.exp(-t));
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function getScheduledDaysForAvailability(daysPerWeek: number): number[] {
  if (daysPerWeek === 2) return [1, 4]; // Martes, Viernes
  if (daysPerWeek === 3) return [0, 2, 4]; // Lunes, Miércoles, Viernes
  if (daysPerWeek === 4) return [0, 1, 3, 5]; // Lunes, Martes, Jueves, Sábado
  if (daysPerWeek === 5) return [0, 1, 2, 3, 4]; // Lunes a Viernes
  return [0, 1, 2, 3, 4, 5]; // Lunes a Sábado
}

/**
 * Generador de misiones semanales adaptadas al punto de partida (sedentarismo extremo)
 * y al equipamiento disponible en parcela.
 */
export function generateAdaptiveWeeklyQuests(
  profile: UserProfile,
  benchmarks: BenchmarkDiscipline[]
): Quest[] {
  const { currentWeek, totalWeeks, weeklyAvailability, targetExam, level } = profile;
  const weeksRemaining = Math.max(1, totalWeeks - currentWeek);
  
  // Base UCE según nivel de acondicionamiento actual
  const baseUCEPerSession = Math.round(25 + Math.min(level * 4, 30));
  const { bonusPerWeek } = calculateDilution(profile.accumulatedDeficitUCE, weeksRemaining, baseUCEPerSession * weeklyAvailability.daysPerWeek);
  const sessionBonus = Math.round(bonusPerWeek / Math.max(1, weeklyAvailability.daysPerWeek));

  const quests: Quest[] = [];
  const scheduledDays = getScheduledDaysForAvailability(weeklyAvailability.daysPerWeek);

  // Vectores según días disponibles (respetando descanso de 48h entre mismo grupo)
  const sessionVectors: TrainingVector[] = [];
  if (weeklyAvailability.daysPerWeek === 2) {
    sessionVectors.push('trac', 'emp');
  } else if (weeklyAvailability.daysPerWeek === 3) {
    sessionVectors.push('trac', 'res', 'emp');
  } else if (weeklyAvailability.daysPerWeek === 4) {
    sessionVectors.push('trac', 'res', 'emp', 'agi');
  } else if (weeklyAvailability.daysPerWeek === 5) {
    sessionVectors.push('trac', 'res', 'emp', 'trac', 'res');
  } else {
    sessionVectors.push('trac', 'res', 'emp', 'agi', 'trac', 'res');
  }

  // Crear misiones para los días activos
  sessionVectors.forEach((vec, idx) => {
    const dayNumber = idx + 1;
    const sessionTargetUCE = baseUCEPerSession + sessionBonus;
    const scheduledDayOfWeek = scheduledDays[idx] !== undefined ? scheduledDays[idx] : (idx % 7);
    const scheduledDayName = DAYS_OF_WEEK[scheduledDayOfWeek] || 'Lunes';

    if (vec === 'trac') {
      quests.push({
        id: `quest-w${currentWeek}-d${dayNumber}-trac`,
        title: `Misión ${dayNumber}: Adaptación de Tracción (${scheduledDayName})`,
        subtitle: targetExam === 'policia_nacional' ? 'Base para Suspensión en Barra' : 'Base para Dominadas y Agarre',
        category: 'daily',
        vector: 'trac',
        targetUCE: sessionTargetUCE,
        durationMinutes: weeklyAvailability.minutesPerSession,
        rewardXP: 120 + level * 10,
        unlocked: true,
        completed: false,
        missed: false,
        status: 'pending',
        scheduledDayOfWeek,
        scheduledDayName,
        exercises: [
          {
            id: `ex-t1-${dayNumber}`,
            name: 'Suspensión Isométrica con Apoyo Parcial de Pies en Banco',
            equipment: 'barra',
            sets: 3,
            repsOrDuration: Math.min(10 + level * 2, 25),
            isDuration: true,
            regressionTip: 'Coloca los pies en un banco o silla bajo la barra. Sujeta con palmas hacia ti (supino) y descarga el 40% del peso en los pies. Cuello relajado.',
            targetRPE: 4,
            completed: false,
          },
          {
            id: `ex-t2-${dayNumber}`,
            name: 'Remo Horizontal Asistido con Bandas Elásticas en Parcela',
            equipment: 'bandas',
            sets: 3,
            repsOrDuration: 10,
            isDuration: false,
            regressionTip: 'Ancla la banda gruesa a un poste o reja de la parcela. Retrae escápulas sin encoger hombros.',
            targetRPE: 4,
            completed: false,
          },
          {
            id: `ex-t3-${dayNumber}`,
            name: 'Paseo del Granjero Ligero con Pesas en Parcela',
            equipment: 'pesas',
            sets: 2,
            repsOrDuration: 40,
            isDuration: true,
            regressionTip: 'Camina por la parcela sosteniendo 2 pesas ligeras (2-5 kg). Postura erguida para fortalecer antebrazos y trapecios sin impacto articular.',
            targetRPE: 3,
            completed: false,
          },
        ],
      });
    } else if (vec === 'emp') {
      quests.push({
        id: `quest-w${currentWeek}-d${dayNumber}-emp`,
        title: `Misión ${dayNumber}: Empuje Seguro (${scheduledDayName})`,
        subtitle: targetExam === 'guardia_civil' ? 'Fundamentos para Flexiones Reglamentarias' : 'Fondos y Empuje Progresivo',
        category: 'daily',
        vector: 'emp',
        targetUCE: sessionTargetUCE,
        durationMinutes: weeklyAvailability.minutesPerSession,
        rewardXP: 110 + level * 10,
        unlocked: true,
        completed: false,
        missed: false,
        status: 'pending',
        scheduledDayOfWeek,
        scheduledDayName,
        exercises: [
          {
            id: `ex-e1-${dayNumber}`,
            name: 'Flexiones Inclinadas en Barras Paralelas o Banco Alto',
            equipment: 'paralelas',
            sets: 3,
            repsOrDuration: 8,
            isDuration: false,
            regressionTip: 'Manos apoyadas en la barra paralela o un banco estable a la altura de la cintura. Cuanto más inclinada, menor carga en muñecas y hombros.',
            targetRPE: 4,
            completed: false,
          },
          {
            id: `ex-e2-${dayNumber}`,
            name: 'Fondo de Tríceps en Banco con Pies en Suelo y Rodillas a 90°',
            equipment: 'suelo',
            sets: 2,
            repsOrDuration: 8,
            isDuration: false,
            regressionTip: 'Baja solo unos centímetros sin forzar la cápsula anterior del hombro. Apóyate firmemente con los pies en la parcela.',
            targetRPE: 4,
            completed: false,
          },
          {
            id: `ex-e3-${dayNumber}`,
            name: 'Press de Hombros Sentada con Mancuernas Ligeras',
            equipment: 'pesas',
            sets: 3,
            repsOrDuration: 10,
            isDuration: false,
            regressionTip: 'Usa mancuernas de 1.5 a 3 kg. Movimiento fluido expulsando aire al subir. Protege zona lumbar apoyando bien la espalda.',
            targetRPE: 3,
            completed: false,
          },
        ],
      });
    } else if (vec === 'res') {
      quests.push({
        id: `quest-w${currentWeek}-d${dayNumber}-res`,
        title: `Misión ${dayNumber}: Capacidad Aeróbica (${scheduledDayName})`,
        subtitle: 'Caminar - Correr Fraccionado Sin Fatiga Central',
        category: 'daily',
        vector: 'res',
        targetUCE: sessionTargetUCE,
        durationMinutes: weeklyAvailability.minutesPerSession,
        rewardXP: 130 + level * 10,
        unlocked: true,
        completed: false,
        missed: false,
        status: 'pending',
        scheduledDayOfWeek,
        scheduledDayName,
        exercises: [
          {
            id: `ex-r1-${dayNumber}`,
            name: 'Bloques CACO: Caminar - Trotar Suave (Campo / Caminos o Parcela)',
            equipment: 'parcela',
            sets: Math.min(3 + Math.floor(level / 2), 5),
            repsOrDuration: 240, // 4 min por bloque
            isDuration: true,
            regressionTip: 'Ideal en campo abierto o caminos de tierra (terreno blando que amortigua el impacto en tibias y rodillas): 3 min de marcha rápida + 1 min de trote muy suave. Si entrenas en la parcela: 2 vueltas caminando (~140m) + 1 vuelta trote (~70m). Si notas falta de aire, mantén marcha continua.',
            targetRPE: 4,
            completed: false,
          },
          {
            id: `ex-r2-${dayNumber}`,
            name: 'Movilidad de Tobillos y Gemelos Post-Carrera',
            equipment: 'suelo',
            sets: 2,
            repsOrDuration: 45,
            isDuration: true,
            regressionTip: 'Estiramientos dinámicos apoyada en una pared o reja para prevenir la periostitis tibial.',
            targetRPE: 2,
            completed: false,
          },
        ],
      });
    } else {
      quests.push({
        id: `quest-w${currentWeek}-d${dayNumber}-agi`,
        title: `Misión ${dayNumber}: Agilidad & Core (${scheduledDayName})`,
        subtitle: 'Preparación de Agilidad y Esquemas Motores',
        category: 'daily',
        vector: 'agi',
        targetUCE: sessionTargetUCE,
        durationMinutes: weeklyAvailability.minutesPerSession,
        rewardXP: 115 + level * 10,
        unlocked: true,
        completed: false,
        missed: false,
        status: 'pending',
        scheduledDayOfWeek,
        scheduledDayName,
        exercises: [
          {
            id: `ex-a1-${dayNumber}`,
            name: 'Circuito en "8" Alrededor de Dos Conos/Botellas en Parcela',
            equipment: 'parcela',
            sets: 3,
            repsOrDuration: 30,
            isDuration: true,
            regressionTip: 'Coloca dos referencias a 4 metros. Trota dibujando un 8 con giros suaves y controlados para acostumbrar los ligamentos de rodilla.',
            targetRPE: 4,
            completed: false,
          },
          {
            id: `ex-a2-${dayNumber}`,
            name: 'Plancha Frontal Apoyando Antebrazos y Rodillas en Esterilla',
            equipment: 'suelo',
            sets: 3,
            repsOrDuration: 20,
            isDuration: true,
            regressionTip: 'Apoya las rodillas en el suelo para anular la tensión lumbar. Mantén el abdomen contraído suavemente.',
            targetRPE: 4,
            completed: false,
          },
        ],
      });
    }
  });

  // Si hay alguna prueba oficial con aprobación superada (>= 5 puntos), generar Quest Heroica Extra
  benchmarks.forEach((bm) => {
    if (bm.isUnlockedHeroic) {
      quests.push({
        id: `quest-heroic-${bm.id}`,
        title: `★ Misión Heroica Extra: Maestría en ${bm.name}`,
        subtitle: 'Optimización de Puntuación (Objetivo: 8 - 10 Puntos)',
        category: 'heroic_extra',
        vector: bm.vector,
        targetUCE: 65,
        durationMinutes: 20,
        rewardXP: 300,
        unlocked: true,
        completed: false,
        missed: false,
        status: 'pending',
        scheduledDayOfWeek: 6, // Domingo o disponible
        scheduledDayName: 'Fin de Semana',
        isHeroicExtra: true,
        notes: '¡Desbloqueada tras superar la marca de Aprobado Oficial! Sesión de alta especificidad para maximizar tu nota.',
        exercises: [
          {
            id: `ex-heroic-${bm.id}-1`,
            name: `Series Específicas de Calidad para ${bm.name}`,
            equipment: bm.vector === 'trac' ? 'barra' : bm.vector === 'emp' ? 'suelo' : 'parcela',
            sets: 3,
            repsOrDuration: bm.vector === 'trac' ? 15 : 12,
            isDuration: bm.vector === 'trac',
            regressionTip: 'Trabajo técnico estricto en el rango de fatiga controlada (RPE 7-8).',
            targetRPE: 7,
            completed: false,
          },
        ],
      });
    }
  });

  return quests;
}

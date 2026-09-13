export type OposicionType = 'policia_nacional' | 'guardia_civil' | 'bomberos_madrid';

export type TrainingVector = 'trac' | 'emp' | 'res' | 'agi';

export type QuestCategory = 'main' | 'daily' | 'trial_boss' | 'heroic_extra';

export type QuestStatus = 'pending' | 'completed' | 'missed';

export interface ExerciseStep {
  id: string;
  name: string;
  equipment: 'barra' | 'paralelas' | 'pesas' | 'bandas' | 'parcela' | 'suelo';
  sets: number;
  repsOrDuration: number;
  isDuration: boolean; // true if seconds, false if repetitions
  regressionTip: string; // Instrucción detallada de acondicionamiento suave para sedentarismo
  targetRPE: number; // 1-10 (Foster scale)
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  category: QuestCategory;
  vector: TrainingVector;
  targetUCE: number;
  durationMinutes: number;
  exercises: ExerciseStep[];
  rewardXP: number;
  unlocked: boolean;
  completed: boolean;
  missed?: boolean;
  status: QuestStatus;
  scheduledDayOfWeek: number; // 0=Lunes, 1=Martes, ..., 6=Domingo
  scheduledDayName: string; // 'Lunes', 'Martes', etc.
  dateStr?: string; // YYYY-MM-DD
  notes?: string;
  isHeroicExtra?: boolean;
}

export interface WeeklyAvailability {
  daysPerWeek: number; // 2 to 6
  minutesPerSession: number; // 15 to 60
  preferredDays: number[]; // 0=Dom, 1=Lun, ..., 6=Sab
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'female';
  targetExam: OposicionType;
  commitmentMonths: number;
  startDate: string;
  currentWeek: number;
  totalWeeks: number;
  currentDayOfWeek: number; // 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  weeklyAvailability: WeeklyAvailability;
  accumulatedDeficitUCE: number; // Total déficit acumulado pendiente de dilución
  dilutedBonusPerWeekUCE: number; // Adición semanal marginal segura
}

export interface OfficialBenchmarkItem {
  points: number; // 1 to 10
  markText: string;
  value: number; // valor numérico (segundos o repeticiones o minutos)
}

export interface BenchmarkDiscipline {
  id: string;
  name: string;
  targetExam: OposicionType;
  vector: TrainingVector;
  unit: string;
  description: string;
  higherIsBetter: boolean;
  officialTableFemale: OfficialBenchmarkItem[];
  currentMark: number | null;
  passScoreCutoff: number; // Typically 5 points
  isUnlockedHeroic: boolean;
  history: {
    date: string;
    value: number;
    points: number;
  }[];
}

export interface DayPlan {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 to 6
  isRestDay: boolean;
  quest?: Quest;
  completed: boolean;
  missed: boolean;
}

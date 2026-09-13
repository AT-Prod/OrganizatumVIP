import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  Quest,
  BenchmarkDiscipline,
  OposicionType,
  WeeklyAvailability,
} from '../types';
import { OFFICIAL_BENCHMARKS } from '../engine/officialBenchmarks';
import {
  generateAdaptiveWeeklyQuests,
  calculateDilution,
  calculateUCE,
} from '../engine/mathEngine';
import { sounds } from '../utils/audio';

interface DilutionNotification {
  deficitAmount: number;
  bonusPerWeek: number;
  weeksRemaining: number;
  explanation: string;
}

interface TrainingContextType {
  profile: UserProfile;
  benchmarks: BenchmarkDiscipline[];
  quests: Quest[];
  activeQuestId: string;
  dilutionNotice: DilutionNotification | null;
  setActiveQuestId: (id: string) => void;
  toggleExercise: (questId: string, exerciseId: string) => void;
  completeQuest: (questId: string) => boolean;
  undoCompleteQuest: (questId: string) => void;
  markQuestMissed: (questId: string) => void;
  undoMissedQuest: (questId: string) => void;
  setCurrentDayOfWeek: (dayIndex: number) => void;
  updateWeeklyAvailability: (availability: WeeklyAvailability) => void;
  updateCommitmentMonths: (months: number) => void;
  setTargetExam: (exam: OposicionType) => void;
  registerBenchmarkMark: (disciplineId: string, value: number) => void;
  advanceWeek: () => void;
  dismissDilutionNotice: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetData: () => void;
}

const STORAGE_KEY = 'opos_quest_fitness_v1';

// Día de la semana actual (0=Lunes, ..., 6=Domingo)
const todayDayIndex = (new Date().getDay() + 6) % 7;

const initialProfile: UserProfile = {
  name: 'Aspirante',
  age: 33,
  gender: 'female',
  targetExam: 'policia_nacional',
  commitmentMonths: 12,
  startDate: new Date().toISOString().split('T')[0],
  currentWeek: 1,
  totalWeeks: 52,
  currentDayOfWeek: todayDayIndex,
  level: 1,
  xp: 140,
  xpToNextLevel: 450,
  streakDays: 3,
  weeklyAvailability: {
    daysPerWeek: 3,
    minutesPerSession: 25,
    preferredDays: [1, 3, 5],
  },
  accumulatedDeficitUCE: 0,
  dilutedBonusPerWeekUCE: 0,
};

const TrainingContext = createContext<TrainingContextType | null>(null);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return initialProfile;
  });

  const [benchmarks, setBenchmarks] = useState<BenchmarkDiscipline[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_benchmarks`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return OFFICIAL_BENCHMARKS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return generateAdaptiveWeeklyQuests(initialProfile, OFFICIAL_BENCHMARKS);
  });

  const [activeQuestId, setActiveQuestId] = useState<string>(() => {
    return quests[0]?.id || '';
  });

  const [dilutionNotice, setDilutionNotice] = useState<DilutionNotification | null>(null);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY}_benchmarks`, JSON.stringify(benchmarks));
      localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
    } catch {
      // Ignore
    }
  }, [profile, benchmarks, quests]);

  // Si cambia la oposición seleccionada, regenerar quests
  const setTargetExam = (exam: OposicionType) => {
    const updatedProfile = { ...profile, targetExam: exam };
    setProfile(updatedProfile);
    const newQuests = generateAdaptiveWeeklyQuests(updatedProfile, benchmarks);
    setQuests(newQuests);
    if (newQuests.length > 0) {
      setActiveQuestId(newQuests[0].id);
    }
  };

  // Ajuste de compromiso en meses
  const updateCommitmentMonths = (months: number) => {
    const totalWeeks = Math.max(12, Math.round(months * 4.33));
    const updated = { ...profile, commitmentMonths: months, totalWeeks };
    setProfile(updated);
    recalculateRoutineWithDilution(updated, benchmarks, updated.accumulatedDeficitUCE);
  };

  // Reajuste de disponibilidad semanal (Check-in dominical)
  const updateWeeklyAvailability = (availability: WeeklyAvailability) => {
    const updated = { ...profile, weeklyAvailability: availability };
    setProfile(updated);
    recalculateRoutineWithDilution(updated, benchmarks, updated.accumulatedDeficitUCE);
  };

  // Función central de recálculo biomatemático
  const recalculateRoutineWithDilution = (
    currProfile: UserProfile,
    currBenchmarks: BenchmarkDiscipline[],
    deficitToAdd: number
  ) => {
    const weeksRemaining = Math.max(1, currProfile.totalWeeks - currProfile.currentWeek);
    const newAccumulatedDeficit = currProfile.accumulatedDeficitUCE + deficitToAdd;
    const baseWeekly = currProfile.weeklyAvailability.daysPerWeek * 30;

    const { bonusPerWeek, explanation } = calculateDilution(
      newAccumulatedDeficit,
      weeksRemaining,
      baseWeekly
    );

    const updatedProfile = {
      ...currProfile,
      accumulatedDeficitUCE: newAccumulatedDeficit,
      dilutedBonusPerWeekUCE: bonusPerWeek,
    };

    setProfile(updatedProfile);
    const freshQuests = generateAdaptiveWeeklyQuests(updatedProfile, currBenchmarks);
    setQuests(freshQuests);

    if (freshQuests.length > 0 && !freshQuests.some((q) => q.id === activeQuestId)) {
      setActiveQuestId(freshQuests[0].id);
    }

    if (deficitToAdd > 0) {
      sounds.playDilution();
      setDilutionNotice({
        deficitAmount: deficitToAdd,
        bonusPerWeek,
        weeksRemaining,
        explanation,
      });
    }
  };

  // Completar o desmarcar ejercicio individual
  const toggleExercise = (questId: string, exerciseId: string) => {
    sounds.playStepCheck();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        const updatedSteps = q.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
        );
        const allCompleted = updatedSteps.every((ex) => ex.completed);
        return {
          ...q,
          exercises: updatedSteps,
          completed: allCompleted,
        };
      })
    );
  };

  // Marcar una misión como completada
  const completeQuest = (questId: string): boolean => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completed) return false;

    // Regla estricta: No se pueden completar misiones con fecha posterior al día actual
    if (!quest.isHeroicExtra && quest.scheduledDayOfWeek > profile.currentDayOfWeek) {
      return false;
    }

    sounds.playQuestComplete();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Safe fallback
    }

    // Calcular ganancia de XP y posible level up
    let newXp = profile.xp + quest.rewardXP;
    let newLevel = profile.level;
    let newXpToNext = profile.xpToNextLevel;

    if (newXp >= newXpToNext) {
      newLevel += 1;
      newXp = newXp - newXpToNext;
      newXpToNext = Math.round(newXpToNext * 1.35);
      setTimeout(() => {
        sounds.playLevelUp();
      }, 500);
    }

    setProfile((p) => ({
      ...p,
      level: newLevel,
      xp: newXp,
      xpToNextLevel: newXpToNext,
      streakDays: p.streakDays + 1,
    }));

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        return {
          ...q,
          completed: true,
          missed: false,
          status: 'completed',
          exercises: q.exercises.map((ex) => ({ ...ex, completed: true })),
        };
      })
    );

    return true;
  };

  // Deshacer misión completada (por si se marcó por error)
  const undoCompleteQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed) return;

    sounds.playStepCheck();

    // Revertir XP y racha
    setProfile((p) => {
      let restoredXp = p.xp - quest.rewardXP;
      let restoredLevel = p.level;
      let restoredXpToNext = p.xpToNextLevel;

      if (restoredXp < 0) {
        if (restoredLevel > 1) {
          restoredLevel -= 1;
          restoredXpToNext = Math.round(restoredXpToNext / 1.35);
          restoredXp = Math.max(0, restoredXpToNext + restoredXp);
        } else {
          restoredXp = 0;
        }
      }

      return {
        ...p,
        level: restoredLevel,
        xp: restoredXp,
        xpToNextLevel: restoredXpToNext,
        streakDays: Math.max(0, p.streakDays - 1),
      };
    });

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        return {
          ...q,
          completed: false,
          missed: false,
          status: 'pending',
          exercises: q.exercises.map((ex) => ({ ...ex, completed: false })),
        };
      })
    );
  };

  // Botón "Misión no completada" -> marca como fallo y diluye el déficit
  const markQuestMissed = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.status === 'missed') return;

    // Si estaba completada antes, primero revertir la recompensa
    if (quest.completed) {
      undoCompleteQuest(questId);
    }

    const deficitUCE = quest.targetUCE || calculateUCE(quest.exercises);
    recalculateRoutineWithDilution(profile, benchmarks, deficitUCE);

    // Marcar misión como no completada (conservándola en la lista con su estado)
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        return {
          ...q,
          completed: false,
          missed: true,
          status: 'missed',
        };
      })
    );
  };

  // Deshacer "Misión no completada" (por si se pulsó por error)
  const undoMissedQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.status !== 'missed') return;

    sounds.playStepCheck();
    const deficitUCE = quest.targetUCE || calculateUCE(quest.exercises);
    const newAccumulated = Math.max(0, profile.accumulatedDeficitUCE - deficitUCE);
    const weeksRemaining = Math.max(1, profile.totalWeeks - profile.currentWeek);
    const baseWeekly = profile.weeklyAvailability.daysPerWeek * 30;

    const { bonusPerWeek } = calculateDilution(newAccumulated, weeksRemaining, baseWeekly);

    setProfile((p) => ({
      ...p,
      accumulatedDeficitUCE: newAccumulated,
      dilutedBonusPerWeekUCE: bonusPerWeek,
    }));

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        return {
          ...q,
          completed: false,
          missed: false,
          status: 'pending',
        };
      })
    );
  };

  // Cambiar el día actual de la semana (para simulación y control temporal)
  const setCurrentDayOfWeek = (dayIndex: number) => {
    setProfile((p) => ({
      ...p,
      currentDayOfWeek: dayIndex,
    }));
  };

  // Registro oficial de marcas (Trial Boss)
  const registerBenchmarkMark = (disciplineId: string, value: number) => {
    setBenchmarks((prev) =>
      prev.map((bm) => {
        if (bm.id !== disciplineId) return bm;

        // Buscar puntos en la tabla oficial
        let calculatedPoints = 0;
        if (bm.higherIsBetter) {
          // Mayor o igual
          for (let i = bm.officialTableFemale.length - 1; i >= 0; i--) {
            if (value >= bm.officialTableFemale[i].value) {
              calculatedPoints = bm.officialTableFemale[i].points;
              break;
            }
          }
        } else {
          // Menor o igual (carrera / agilidad)
          for (let i = bm.officialTableFemale.length - 1; i >= 0; i--) {
            if (value <= bm.officialTableFemale[i].value) {
              calculatedPoints = bm.officialTableFemale[i].points;
              break;
            }
          }
        }

        const isApto = calculatedPoints >= bm.passScoreCutoff;
        const newHistory = [
          ...bm.history,
          {
            date: new Date().toISOString().split('T')[0],
            value,
            points: calculatedPoints,
          },
        ];

        if (isApto && !bm.isUnlockedHeroic) {
          sounds.playLevelUp();
          try {
            confetti({
              particleCount: 100,
              spread: 90,
              origin: { y: 0.6 },
            });
          } catch {
            // Fallback
          }
        }

        return {
          ...bm,
          currentMark: value,
          isUnlockedHeroic: isApto || bm.isUnlockedHeroic,
          history: newHistory,
        };
      })
    );

    // Otorgar XP de Trial Boss
    setProfile((p) => ({
      ...p,
      xp: p.xp + 250,
    }));
  };

  const advanceWeek = () => {
    if (profile.currentWeek < profile.totalWeeks) {
      const nextWeek = profile.currentWeek + 1;
      const updatedProfile = { ...profile, currentWeek: nextWeek };
      setProfile(updatedProfile);
      const newQuests = generateAdaptiveWeeklyQuests(updatedProfile, benchmarks);
      setQuests(newQuests);
      if (newQuests.length > 0) setActiveQuestId(newQuests[0].id);
    }
  };

  const dismissDilutionNotice = () => {
    setDilutionNotice(null);
  };

  const exportData = (): string => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      profile,
      benchmarks,
      quests,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data && data.profile && data.benchmarks && data.quests) {
        setProfile(data.profile);
        setBenchmarks(data.benchmarks);
        setQuests(data.quests);
        if (data.quests[0]) setActiveQuestId(data.quests[0].id);
        sounds.playQuestComplete();
        return true;
      }
    } catch {
      // JSON parse error
    }
    return false;
  };

  const resetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_profile`);
    localStorage.removeItem(`${STORAGE_KEY}_benchmarks`);
    localStorage.removeItem(`${STORAGE_KEY}_quests`);
    setProfile(initialProfile);
    setBenchmarks(OFFICIAL_BENCHMARKS);
    const freshQuests = generateAdaptiveWeeklyQuests(initialProfile, OFFICIAL_BENCHMARKS);
    setQuests(freshQuests);
    if (freshQuests[0]) setActiveQuestId(freshQuests[0].id);
    sounds.playDilution();
  };

  return (
    <TrainingContext.Provider
      value={{
        profile,
        benchmarks,
        quests,
        activeQuestId,
        dilutionNotice,
        setActiveQuestId,
        toggleExercise,
        completeQuest,
        undoCompleteQuest,
        markQuestMissed,
        undoMissedQuest,
        setCurrentDayOfWeek,
        updateWeeklyAvailability,
        updateCommitmentMonths,
        setTargetExam,
        registerBenchmarkMark,
        advanceWeek,
        dismissDilutionNotice,
        exportData,
        importData,
        resetData,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) throw new Error('useTraining must be used within TrainingProvider');
  return context;
};

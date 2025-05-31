
export interface SleepScheduleData {
  childAge: number;
  currentBedtime: string;
  currentWakeTime: string;
  napFrequency: 'none' | 'one' | 'two' | 'three-plus';
  sleepChallenges: string[];
}

export interface Nap {
  name: string;
  startTime: string;
  duration: number; // duration in minutes
  [key: string]: any; // Add index signature for Json compatibility
}

export interface ScheduleRecommendation {
  bedtime: string;
  wakeTime: string;
  naps: Nap[];
  totalSleepHours: number;
}

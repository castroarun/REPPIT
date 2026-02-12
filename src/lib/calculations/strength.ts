import {
  Exercise,
  Level,
  BodyPart,
  ExerciseInfo,
  ExerciseRatings,
  CalculatedStrength,
  Badge,
  BadgeId,
  ALL_LEVELS,
  LEVEL_VALUES,
  Sex
} from '@/types'

// All exercises with their multipliers from DEVELOPMENT-PLAN v2.0
// Female multipliers are approximately 60-70% of male multipliers based on StrengthLevel.com
export const EXERCISES: ExerciseInfo[] = [
  // CHEST
  {
    id: 'benchPress', name: 'Bench Press', bodyPart: 'chest',
    multipliers: { beginner: 0.59, novice: 0.82, intermediate: 1.06, advanced: 1.29 },
    femaleMultipliers: { beginner: 0.35, novice: 0.50, intermediate: 0.65, advanced: 0.85 }
  },
  {
    id: 'inclineBench', name: 'Incline Bench', bodyPart: 'chest',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.90, advanced: 1.10 },
    femaleMultipliers: { beginner: 0.30, novice: 0.43, intermediate: 0.55, advanced: 0.72 }
  },
  {
    id: 'dumbbellPress', name: 'Dumbbell Press', bodyPart: 'chest',
    multipliers: { beginner: 0.25, novice: 0.35, intermediate: 0.45, advanced: 0.55 },
    femaleMultipliers: { beginner: 0.15, novice: 0.22, intermediate: 0.28, advanced: 0.36 },
    isDumbbell: true
  },
  {
    id: 'cableFly', name: 'Cable Fly', bodyPart: 'chest',
    multipliers: { beginner: 0.15, novice: 0.22, intermediate: 0.30, advanced: 0.40 },
    femaleMultipliers: { beginner: 0.10, novice: 0.14, intermediate: 0.19, advanced: 0.26 }
  },
  {
    id: 'chestPressMachine', name: 'Chest Press (Machine)', bodyPart: 'chest',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.95, advanced: 1.20 },
    femaleMultipliers: { beginner: 0.30, novice: 0.43, intermediate: 0.58, advanced: 0.78 }
  },
  {
    id: 'pecDeck', name: 'Pec Deck', bodyPart: 'chest',
    multipliers: { beginner: 0.25, novice: 0.40, intermediate: 0.55, advanced: 0.70 },
    femaleMultipliers: { beginner: 0.16, novice: 0.26, intermediate: 0.36, advanced: 0.46 }
  },
  {
    id: 'declineBench', name: 'Decline Bench Press', bodyPart: 'chest',
    multipliers: { beginner: 0.55, novice: 0.78, intermediate: 1.00, advanced: 1.22 },
    femaleMultipliers: { beginner: 0.33, novice: 0.48, intermediate: 0.61, advanced: 0.79 }
  },
  {
    id: 'dumbbellFly', name: 'Dumbbell Fly', bodyPart: 'chest',
    multipliers: { beginner: 0.12, novice: 0.18, intermediate: 0.25, advanced: 0.33 },
    femaleMultipliers: { beginner: 0.08, novice: 0.12, intermediate: 0.17, advanced: 0.22 },
    isDumbbell: true
  },
  {
    id: 'pushUps', name: 'Push-ups', bodyPart: 'chest',
    multipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 },
    femaleMultipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 }
  },
  {
    id: 'inclineDumbbellFly', name: 'Incline Dumbbell Fly', bodyPart: 'chest',
    multipliers: { beginner: 0.10, novice: 0.16, intermediate: 0.22, advanced: 0.30 },
    femaleMultipliers: { beginner: 0.07, novice: 0.11, intermediate: 0.15, advanced: 0.20 },
    isDumbbell: true
  },

  // BACK
  {
    id: 'deadlift', name: 'Deadlift', bodyPart: 'back',
    multipliers: { beginner: 0.94, novice: 1.29, intermediate: 1.71, advanced: 2.18 },
    femaleMultipliers: { beginner: 0.66, novice: 0.90, intermediate: 1.20, advanced: 1.53 }
  },
  {
    id: 'barbellRow', name: 'Barbell Row', bodyPart: 'back',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.90, advanced: 1.15 },
    femaleMultipliers: { beginner: 0.33, novice: 0.46, intermediate: 0.59, advanced: 0.76 }
  },
  {
    id: 'latPulldown', name: 'Lat Pulldown', bodyPart: 'back',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.90, advanced: 1.10 },
    femaleMultipliers: { beginner: 0.35, novice: 0.49, intermediate: 0.63, advanced: 0.77 }
  },
  {
    id: 'pullUps', name: 'Pull-ups', bodyPart: 'back',
    multipliers: { beginner: 0.50, novice: 0.80, intermediate: 1.00, advanced: 1.30 },
    femaleMultipliers: { beginner: 0.00, novice: 0.50, intermediate: 0.70, advanced: 1.00 }
  },
  {
    id: 'cableRow', name: 'Cable Row', bodyPart: 'back',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.90, advanced: 1.10 },
    femaleMultipliers: { beginner: 0.35, novice: 0.49, intermediate: 0.63, advanced: 0.77 }
  },
  {
    id: 'tBarRow', name: 'T-Bar Row', bodyPart: 'back',
    multipliers: { beginner: 0.45, novice: 0.65, intermediate: 0.85, advanced: 1.10 },
    femaleMultipliers: { beginner: 0.30, novice: 0.43, intermediate: 0.56, advanced: 0.73 }
  },
  {
    id: 'dumbbellRow', name: 'Dumbbell Row', bodyPart: 'back',
    multipliers: { beginner: 0.22, novice: 0.32, intermediate: 0.42, advanced: 0.55 },
    femaleMultipliers: { beginner: 0.14, novice: 0.21, intermediate: 0.28, advanced: 0.36 },
    isDumbbell: true
  },
  {
    id: 'seatedRow', name: 'Seated Row (Machine)', bodyPart: 'back',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.90, advanced: 1.15 },
    femaleMultipliers: { beginner: 0.35, novice: 0.49, intermediate: 0.63, advanced: 0.81 }
  },
  {
    id: 'chinUps', name: 'Chin-ups', bodyPart: 'back',
    multipliers: { beginner: 0.50, novice: 0.80, intermediate: 1.05, advanced: 1.35 },
    femaleMultipliers: { beginner: 0.00, novice: 0.45, intermediate: 0.65, advanced: 0.95 }
  },
  {
    id: 'pendlayRow', name: 'Pendlay Row', bodyPart: 'back',
    multipliers: { beginner: 0.45, novice: 0.65, intermediate: 0.85, advanced: 1.10 },
    femaleMultipliers: { beginner: 0.30, novice: 0.43, intermediate: 0.56, advanced: 0.73 }
  },
  {
    id: 'singleArmCablePulldown', name: 'Single-Arm Cable Pulldown', bodyPart: 'back',
    multipliers: { beginner: 0.20, novice: 0.30, intermediate: 0.40, advanced: 0.52 },
    femaleMultipliers: { beginner: 0.14, novice: 0.21, intermediate: 0.28, advanced: 0.36 }
  },

  // SHOULDERS
  {
    id: 'shoulderPressBarbell', name: 'Shoulder Press (Barbell)', bodyPart: 'shoulders',
    multipliers: { beginner: 0.41, novice: 0.59, intermediate: 0.76, advanced: 1.00 },
    femaleMultipliers: { beginner: 0.29, novice: 0.41, intermediate: 0.53, advanced: 0.70 }
  },
  {
    id: 'shoulderPressMachine', name: 'Shoulder Press (Machine)', bodyPart: 'shoulders',
    multipliers: { beginner: 0.35, novice: 0.50, intermediate: 0.65, advanced: 0.85 },
    femaleMultipliers: { beginner: 0.24, novice: 0.35, intermediate: 0.45, advanced: 0.60 }
  },
  {
    id: 'shoulderPressDumbbell', name: 'Shoulder Press (Dumbbell)', bodyPart: 'shoulders',
    multipliers: { beginner: 0.18, novice: 0.26, intermediate: 0.35, advanced: 0.45 },
    femaleMultipliers: { beginner: 0.12, novice: 0.18, intermediate: 0.24, advanced: 0.31 },
    isDumbbell: true
  },
  {
    id: 'sideLateralDumbbell', name: 'Side Lateral (Dumbbell)', bodyPart: 'shoulders',
    multipliers: { beginner: 0.08, novice: 0.12, intermediate: 0.16, advanced: 0.22 },
    femaleMultipliers: { beginner: 0.05, novice: 0.08, intermediate: 0.11, advanced: 0.15 },
    isDumbbell: true
  },
  {
    id: 'sideLateralCable', name: 'Side Lateral (Cable)', bodyPart: 'shoulders',
    multipliers: { beginner: 0.06, novice: 0.10, intermediate: 0.14, advanced: 0.20 },
    femaleMultipliers: { beginner: 0.04, novice: 0.07, intermediate: 0.10, advanced: 0.14 }
  },
  {
    id: 'frontRaise', name: 'Front Raise', bodyPart: 'shoulders',
    multipliers: { beginner: 0.10, novice: 0.15, intermediate: 0.20, advanced: 0.28 },
    femaleMultipliers: { beginner: 0.07, novice: 0.10, intermediate: 0.14, advanced: 0.19 }
  },
  {
    id: 'rearDeltFly', name: 'Rear Delt Fly', bodyPart: 'shoulders',
    multipliers: { beginner: 0.08, novice: 0.12, intermediate: 0.16, advanced: 0.22 },
    femaleMultipliers: { beginner: 0.05, novice: 0.08, intermediate: 0.11, advanced: 0.15 },
    isDumbbell: true
  },
  {
    id: 'facePull', name: 'Face Pull', bodyPart: 'shoulders',
    multipliers: { beginner: 0.15, novice: 0.25, intermediate: 0.35, advanced: 0.45 },
    femaleMultipliers: { beginner: 0.10, novice: 0.17, intermediate: 0.24, advanced: 0.31 }
  },
  {
    id: 'arnoldPress', name: 'Arnold Press', bodyPart: 'shoulders',
    multipliers: { beginner: 0.15, novice: 0.23, intermediate: 0.32, advanced: 0.42 },
    femaleMultipliers: { beginner: 0.10, novice: 0.16, intermediate: 0.22, advanced: 0.29 },
    isDumbbell: true
  },
  {
    id: 'uprightRow', name: 'Upright Row', bodyPart: 'shoulders',
    multipliers: { beginner: 0.25, novice: 0.38, intermediate: 0.50, advanced: 0.65 },
    femaleMultipliers: { beginner: 0.17, novice: 0.26, intermediate: 0.35, advanced: 0.45 }
  },
  {
    id: 'dumbbellShrug', name: 'Dumbbell Shrug', bodyPart: 'shoulders',
    multipliers: { beginner: 0.25, novice: 0.38, intermediate: 0.50, advanced: 0.65 },
    femaleMultipliers: { beginner: 0.17, novice: 0.26, intermediate: 0.35, advanced: 0.45 },
    isDumbbell: true
  },
  {
    id: 'barbellShrug', name: 'Barbell Shrug', bodyPart: 'shoulders',
    multipliers: { beginner: 0.60, novice: 0.90, intermediate: 1.20, advanced: 1.55 },
    femaleMultipliers: { beginner: 0.42, novice: 0.63, intermediate: 0.84, advanced: 1.09 }
  },
  {
    id: 'reversePecDeck', name: 'Reverse Pec Deck', bodyPart: 'shoulders',
    multipliers: { beginner: 0.15, novice: 0.25, intermediate: 0.35, advanced: 0.45 },
    femaleMultipliers: { beginner: 0.10, novice: 0.17, intermediate: 0.24, advanced: 0.31 }
  },

  // LEGS
  {
    id: 'squat', name: 'Squat', bodyPart: 'legs',
    multipliers: { beginner: 0.76, novice: 1.12, intermediate: 1.47, advanced: 1.88 },
    femaleMultipliers: { beginner: 0.53, novice: 0.78, intermediate: 1.03, advanced: 1.32 }
  },
  {
    id: 'legPress', name: 'Leg Press', bodyPart: 'legs',
    multipliers: { beginner: 1.50, novice: 2.20, intermediate: 3.00, advanced: 3.80 },
    femaleMultipliers: { beginner: 1.05, novice: 1.54, intermediate: 2.10, advanced: 2.66 }
  },
  {
    id: 'romanianDeadlift', name: 'Romanian Deadlift', bodyPart: 'legs',
    multipliers: { beginner: 0.60, novice: 0.85, intermediate: 1.10, advanced: 1.40 },
    femaleMultipliers: { beginner: 0.42, novice: 0.60, intermediate: 0.77, advanced: 0.98 }
  },
  {
    id: 'legCurl', name: 'Leg Curl', bodyPart: 'legs',
    multipliers: { beginner: 0.30, novice: 0.45, intermediate: 0.60, advanced: 0.80 },
    femaleMultipliers: { beginner: 0.21, novice: 0.32, intermediate: 0.42, advanced: 0.56 }
  },
  {
    id: 'legExtension', name: 'Leg Extension', bodyPart: 'legs',
    multipliers: { beginner: 0.40, novice: 0.55, intermediate: 0.75, advanced: 0.95 },
    femaleMultipliers: { beginner: 0.28, novice: 0.39, intermediate: 0.53, advanced: 0.67 }
  },
  {
    id: 'calfRaise', name: 'Calf Raise', bodyPart: 'legs',
    multipliers: { beginner: 0.80, novice: 1.20, intermediate: 1.60, advanced: 2.00 },
    femaleMultipliers: { beginner: 0.56, novice: 0.84, intermediate: 1.12, advanced: 1.40 }
  },
  {
    id: 'hipThrust', name: 'Hip Thrust', bodyPart: 'legs',
    multipliers: { beginner: 0.80, novice: 1.20, intermediate: 1.60, advanced: 2.10 },
    femaleMultipliers: { beginner: 0.70, novice: 1.05, intermediate: 1.40, advanced: 1.85 }
  },
  {
    id: 'bulgarianSplitSquat', name: 'Bulgarian Split Squat', bodyPart: 'legs',
    multipliers: { beginner: 0.20, novice: 0.30, intermediate: 0.40, advanced: 0.55 },
    femaleMultipliers: { beginner: 0.14, novice: 0.21, intermediate: 0.28, advanced: 0.39 },
    isDumbbell: true
  },
  {
    id: 'gobletSquat', name: 'Goblet Squat', bodyPart: 'legs',
    multipliers: { beginner: 0.25, novice: 0.40, intermediate: 0.55, advanced: 0.70 },
    femaleMultipliers: { beginner: 0.18, novice: 0.28, intermediate: 0.39, advanced: 0.49 }
  },
  {
    id: 'hackSquat', name: 'Hack Squat', bodyPart: 'legs',
    multipliers: { beginner: 0.80, novice: 1.20, intermediate: 1.60, advanced: 2.00 },
    femaleMultipliers: { beginner: 0.56, novice: 0.84, intermediate: 1.12, advanced: 1.40 }
  },
  {
    id: 'walkingLunge', name: 'Walking Lunge', bodyPart: 'legs',
    multipliers: { beginner: 0.18, novice: 0.28, intermediate: 0.38, advanced: 0.50 },
    femaleMultipliers: { beginner: 0.13, novice: 0.20, intermediate: 0.27, advanced: 0.35 },
    isDumbbell: true
  },
  {
    id: 'sumoDeadlift', name: 'Sumo Deadlift', bodyPart: 'legs',
    multipliers: { beginner: 0.90, novice: 1.25, intermediate: 1.65, advanced: 2.10 },
    femaleMultipliers: { beginner: 0.63, novice: 0.88, intermediate: 1.16, advanced: 1.47 }
  },
  {
    id: 'seatedCalfRaise', name: 'Seated Calf Raise', bodyPart: 'legs',
    multipliers: { beginner: 0.40, novice: 0.65, intermediate: 0.90, advanced: 1.20 },
    femaleMultipliers: { beginner: 0.28, novice: 0.46, intermediate: 0.63, advanced: 0.84 }
  },
  {
    id: 'adductorMachine', name: 'Adductor Machine', bodyPart: 'legs',
    multipliers: { beginner: 0.50, novice: 0.75, intermediate: 1.00, advanced: 1.30 },
    femaleMultipliers: { beginner: 0.40, novice: 0.60, intermediate: 0.80, advanced: 1.04 }
  },
  {
    id: 'abductorMachine', name: 'Abductor Machine', bodyPart: 'legs',
    multipliers: { beginner: 0.40, novice: 0.60, intermediate: 0.80, advanced: 1.05 },
    femaleMultipliers: { beginner: 0.32, novice: 0.48, intermediate: 0.64, advanced: 0.84 }
  },
  {
    id: 'frontSquat', name: 'Front Squat', bodyPart: 'legs',
    multipliers: { beginner: 0.60, novice: 0.90, intermediate: 1.20, advanced: 1.55 },
    femaleMultipliers: { beginner: 0.42, novice: 0.63, intermediate: 0.84, advanced: 1.09 }
  },

  // ARMS
  {
    id: 'bicepCurlBarbell', name: 'Bicep Curl (Barbell)', bodyPart: 'arms',
    multipliers: { beginner: 0.25, novice: 0.38, intermediate: 0.50, advanced: 0.65 },
    femaleMultipliers: { beginner: 0.18, novice: 0.27, intermediate: 0.35, advanced: 0.46 }
  },
  {
    id: 'bicepCurlDumbbell', name: 'Bicep Curl (Dumbbell)', bodyPart: 'arms',
    multipliers: { beginner: 0.12, novice: 0.18, intermediate: 0.25, advanced: 0.32 },
    femaleMultipliers: { beginner: 0.08, novice: 0.13, intermediate: 0.18, advanced: 0.22 },
    isDumbbell: true
  },
  {
    id: 'tricepPushdown', name: 'Tricep Pushdown', bodyPart: 'arms',
    multipliers: { beginner: 0.25, novice: 0.38, intermediate: 0.50, advanced: 0.65 },
    femaleMultipliers: { beginner: 0.18, novice: 0.27, intermediate: 0.35, advanced: 0.46 }
  },
  {
    id: 'skullCrushers', name: 'Skull Crushers', bodyPart: 'arms',
    multipliers: { beginner: 0.20, novice: 0.30, intermediate: 0.40, advanced: 0.50 },
    femaleMultipliers: { beginner: 0.14, novice: 0.21, intermediate: 0.28, advanced: 0.35 }
  },
  {
    id: 'hammerCurl', name: 'Hammer Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.12, novice: 0.18, intermediate: 0.25, advanced: 0.33 },
    femaleMultipliers: { beginner: 0.08, novice: 0.12, intermediate: 0.17, advanced: 0.23 },
    isDumbbell: true
  },
  {
    id: 'tricepDip', name: 'Tricep Dip', bodyPart: 'arms',
    multipliers: { beginner: 0.50, novice: 0.80, intermediate: 1.00, advanced: 1.25 },
    femaleMultipliers: { beginner: 0.00, novice: 0.50, intermediate: 0.70, advanced: 0.95 }
  },
  {
    id: 'overheadTricepExtension', name: 'Overhead Tricep Extension', bodyPart: 'arms',
    multipliers: { beginner: 0.18, novice: 0.28, intermediate: 0.38, advanced: 0.48 },
    femaleMultipliers: { beginner: 0.12, novice: 0.19, intermediate: 0.26, advanced: 0.33 }
  },
  {
    id: 'preacherCurl', name: 'Preacher Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.22, novice: 0.33, intermediate: 0.44, advanced: 0.58 },
    femaleMultipliers: { beginner: 0.15, novice: 0.23, intermediate: 0.31, advanced: 0.41 }
  },
  {
    id: 'cableCurl', name: 'Cable Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.20, novice: 0.32, intermediate: 0.44, advanced: 0.56 },
    femaleMultipliers: { beginner: 0.14, novice: 0.22, intermediate: 0.31, advanced: 0.39 }
  },
  {
    id: 'closeGripBenchPress', name: 'Close-Grip Bench Press', bodyPart: 'arms',
    multipliers: { beginner: 0.50, novice: 0.70, intermediate: 0.90, advanced: 1.15 },
    femaleMultipliers: { beginner: 0.30, novice: 0.43, intermediate: 0.55, advanced: 0.72 }
  },
  {
    id: 'concentrationCurl', name: 'Concentration Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.10, novice: 0.15, intermediate: 0.22, advanced: 0.28 },
    femaleMultipliers: { beginner: 0.07, novice: 0.10, intermediate: 0.15, advanced: 0.19 },
    isDumbbell: true
  },
  {
    id: 'tricepKickback', name: 'Tricep Kickback', bodyPart: 'arms',
    multipliers: { beginner: 0.08, novice: 0.13, intermediate: 0.18, advanced: 0.25 },
    femaleMultipliers: { beginner: 0.05, novice: 0.09, intermediate: 0.12, advanced: 0.17 },
    isDumbbell: true
  },
  {
    id: 'inclineDumbbellCurl', name: 'Incline Dumbbell Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.10, novice: 0.15, intermediate: 0.22, advanced: 0.28 },
    femaleMultipliers: { beginner: 0.07, novice: 0.10, intermediate: 0.15, advanced: 0.19 },
    isDumbbell: true
  },
  {
    id: 'reverseCurl', name: 'Reverse Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.18, novice: 0.28, intermediate: 0.38, advanced: 0.48 },
    femaleMultipliers: { beginner: 0.12, novice: 0.19, intermediate: 0.26, advanced: 0.33 }
  },
  {
    id: 'wristCurl', name: 'Wrist Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.15, novice: 0.25, intermediate: 0.35, advanced: 0.45 },
    femaleMultipliers: { beginner: 0.10, novice: 0.17, intermediate: 0.24, advanced: 0.31 }
  },
  {
    id: 'ezBarCurl', name: 'EZ Bar Curl', bodyPart: 'arms',
    multipliers: { beginner: 0.22, novice: 0.35, intermediate: 0.47, advanced: 0.60 },
    femaleMultipliers: { beginner: 0.15, novice: 0.24, intermediate: 0.33, advanced: 0.42 }
  },

  // CORE
  {
    id: 'abCrunchMachine', name: 'Ab Crunch (Machine)', bodyPart: 'core',
    multipliers: { beginner: 0.40, novice: 0.60, intermediate: 0.80, advanced: 1.00 },
    femaleMultipliers: { beginner: 0.28, novice: 0.42, intermediate: 0.56, advanced: 0.70 }
  },
  {
    id: 'abCrunchCable', name: 'Ab Crunch (Cable)', bodyPart: 'core',
    multipliers: { beginner: 0.30, novice: 0.45, intermediate: 0.60, advanced: 0.75 },
    femaleMultipliers: { beginner: 0.21, novice: 0.32, intermediate: 0.42, advanced: 0.53 }
  },
  {
    id: 'hangingLegRaise', name: 'Hanging Leg Raise', bodyPart: 'core',
    multipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 },
    femaleMultipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 }
  },
  {
    id: 'cableWoodchop', name: 'Cable Woodchop', bodyPart: 'core',
    multipliers: { beginner: 0.15, novice: 0.25, intermediate: 0.35, advanced: 0.45 },
    femaleMultipliers: { beginner: 0.10, novice: 0.17, intermediate: 0.24, advanced: 0.31 }
  },
  {
    id: 'russianTwist', name: 'Russian Twist', bodyPart: 'core',
    multipliers: { beginner: 0.10, novice: 0.18, intermediate: 0.26, advanced: 0.34 },
    femaleMultipliers: { beginner: 0.07, novice: 0.13, intermediate: 0.18, advanced: 0.24 }
  },
  {
    id: 'legRaise', name: 'Leg Raise', bodyPart: 'core',
    multipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 },
    femaleMultipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 }
  },
  {
    id: 'declineSitUp', name: 'Decline Sit-up', bodyPart: 'core',
    multipliers: { beginner: 0.10, novice: 0.18, intermediate: 0.28, advanced: 0.38 },
    femaleMultipliers: { beginner: 0.07, novice: 0.13, intermediate: 0.20, advanced: 0.27 }
  },
  {
    id: 'pallofPress', name: 'Pallof Press', bodyPart: 'core',
    multipliers: { beginner: 0.10, novice: 0.18, intermediate: 0.26, advanced: 0.35 },
    femaleMultipliers: { beginner: 0.07, novice: 0.13, intermediate: 0.18, advanced: 0.25 }
  },
  {
    id: 'cableCrunchKneeling', name: 'Kneeling Cable Crunch', bodyPart: 'core',
    multipliers: { beginner: 0.30, novice: 0.45, intermediate: 0.60, advanced: 0.80 },
    femaleMultipliers: { beginner: 0.21, novice: 0.32, intermediate: 0.42, advanced: 0.56 }
  },
  {
    id: 'abRollout', name: 'Ab Rollout', bodyPart: 'core',
    multipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 },
    femaleMultipliers: { beginner: 0.00, novice: 0.00, intermediate: 0.00, advanced: 0.00 }
  },
]

/**
 * Get exercise info by ID
 */
export function getExerciseById(exerciseId: Exercise): ExerciseInfo | undefined {
  return EXERCISES.find(e => e.id === exerciseId)
}

/**
 * Get exercises by body part
 */
export function getExercisesByBodyPart(bodyPart: BodyPart): ExerciseInfo[] {
  return EXERCISES.filter(e => e.bodyPart === bodyPart)
}

/**
 * Calculate strength standard for a specific exercise and level
 * Uses female multipliers if sex is 'female' and femaleMultipliers exist
 */
export function calculateStrength(
  bodyWeight: number,
  exercise: ExerciseInfo,
  level: Level,
  sex?: Sex
): number {
  const multipliers = (sex === 'female' && exercise.femaleMultipliers)
    ? exercise.femaleMultipliers
    : exercise.multipliers
  const multiplier = multipliers[level]
  return Math.round(bodyWeight * multiplier)
}

/**
 * Calculate strength for a single exercise with all levels
 */
export function calculateExerciseStrength(
  bodyWeight: number,
  exercise: ExerciseInfo,
  selectedLevel?: Level,
  sex?: Sex
): CalculatedStrength {
  return {
    exercise: exercise.id,
    exerciseName: exercise.name,
    bodyPart: exercise.bodyPart,
    isDumbbell: exercise.isDumbbell,
    levels: ALL_LEVELS.map(level => ({
      level,
      weight: calculateStrength(bodyWeight, exercise, level, sex),
      isSelected: selectedLevel === level
    }))
  }
}

/**
 * Calculate all strengths, optionally filtered by body part
 */
export function calculateAllStrengths(
  bodyWeight: number,
  ratings: ExerciseRatings,
  bodyPartFilter?: BodyPart | 'all',
  sex?: Sex
): CalculatedStrength[] {
  let exercises = EXERCISES

  if (bodyPartFilter && bodyPartFilter !== 'all') {
    exercises = exercises.filter(e => e.bodyPart === bodyPartFilter)
  }

  return exercises.map(exercise =>
    calculateExerciseStrength(bodyWeight, exercise, ratings[exercise.id], sex)
  )
}

/**
 * Get rated exercises (user has selected a level)
 */
export function getRatedExercises(
  bodyWeight: number,
  ratings: ExerciseRatings,
  bodyPartFilter?: BodyPart | 'all',
  sex?: Sex
): CalculatedStrength[] {
  return calculateAllStrengths(bodyWeight, ratings, bodyPartFilter, sex)
    .filter(s => s.levels.some(l => l.isSelected))
}

/**
 * Get unrated exercises (user hasn't selected a level yet)
 */
export function getUnratedExercises(
  bodyWeight: number,
  ratings: ExerciseRatings,
  bodyPartFilter?: BodyPart | 'all',
  sex?: Sex
): CalculatedStrength[] {
  return calculateAllStrengths(bodyWeight, ratings, bodyPartFilter, sex)
    .filter(s => !s.levels.some(l => l.isSelected))
}

/**
 * Calculate overall profile level based on rated exercises
 * Returns the average level rounded to nearest level
 */
export function calculateOverallLevel(ratings: ExerciseRatings): Level | null {
  const ratedLevels = Object.values(ratings).filter((l): l is Level => l !== undefined)

  if (ratedLevels.length === 0) return null

  const sum = ratedLevels.reduce((acc, level) => acc + LEVEL_VALUES[level], 0)
  const average = sum / ratedLevels.length

  // Convert average back to level
  if (average < 1.5) return 'beginner'
  if (average < 2.5) return 'novice'
  if (average < 3.5) return 'intermediate'
  return 'advanced'
}

/**
 * Get count of rated exercises
 */
export function getRatedCount(ratings: ExerciseRatings): number {
  return Object.values(ratings).filter(l => l !== undefined).length
}

/**
 * Get total exercises count
 */
export function getTotalExercisesCount(): number {
  return EXERCISES.length
}

/**
 * Calculate Strength Score (0-100)
 * Formula: Average Level × 25
 * - Beginner (1) × 25 = 25
 * - Novice (2) × 25 = 50
 * - Intermediate (3) × 25 = 75
 * - Advanced (4) × 25 = 100
 *
 * Number of exercises doesn't affect the score - only the quality matters.
 * A user with 4 Advanced exercises gets 100, same as 25 Advanced exercises.
 */
export function calculateStrengthScore(ratings: ExerciseRatings): number {
  const ratedLevels = Object.values(ratings).filter((l): l is Level => l !== undefined)

  if (ratedLevels.length === 0) return 0

  const sum = ratedLevels.reduce((acc, level) => acc + LEVEL_VALUES[level], 0)
  const average = sum / ratedLevels.length

  return Math.round(average * 25)
}

// Badge definitions
const BADGE_DEFINITIONS: Omit<Badge, 'earned'>[] = [
  {
    id: 'firstStep',
    name: 'First Step',
    description: 'Rate your first exercise',
    icon: '🎯'
  },
  {
    id: 'gettingStarted',
    name: 'Getting Started',
    description: 'Rate 5 exercises',
    icon: '🌱'
  },
  {
    id: 'dedicatedTrainer',
    name: 'Dedicated Trainer',
    description: 'Rate 10 exercises',
    icon: '💪'
  },
  {
    id: 'fullAssessment',
    name: 'Full Assessment',
    description: 'Rate all exercises',
    icon: '🏆'
  },
  {
    id: 'noviceMilestone',
    name: 'Novice Milestone',
    description: 'Reach Novice level on any exercise',
    icon: '⭐'
  },
  {
    id: 'breakingIntermediate',
    name: 'Breaking Intermediate',
    description: 'Reach Intermediate level on any exercise',
    icon: '🔥'
  },
  {
    id: 'advancedLifter',
    name: 'Advanced Lifter',
    description: 'Reach Advanced level on any exercise',
    icon: '🚀'
  },
  {
    id: 'eliteStatus',
    name: 'Elite Status',
    description: 'Reach 100 Strength Score',
    icon: '👑'
  }
]

/**
 * Calculate earned badges based on ratings
 * Quality over quantity - number of exercises doesn't gate achievements
 */
export function calculateBadges(ratings: ExerciseRatings): Badge[] {
  const ratedLevels = Object.values(ratings).filter((l): l is Level => l !== undefined)
  const ratedCount = ratedLevels.length
  const strengthScore = calculateStrengthScore(ratings)

  const hasLevel = (level: Level) => ratedLevels.includes(level)

  const checkBadge = (id: BadgeId): boolean => {
    switch (id) {
      case 'firstStep':
        return ratedCount >= 1
      case 'gettingStarted':
        return ratedCount >= 5
      case 'dedicatedTrainer':
        return ratedCount >= 10
      case 'fullAssessment':
        return ratedCount >= EXERCISES.length
      case 'noviceMilestone':
        return hasLevel('novice') || hasLevel('intermediate') || hasLevel('advanced')
      case 'breakingIntermediate':
        return hasLevel('intermediate') || hasLevel('advanced')
      case 'advancedLifter':
        return hasLevel('advanced')
      case 'eliteStatus':
        return strengthScore === 100
      default:
        return false
    }
  }

  return BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    earned: checkBadge(badge.id)
  }))
}

/**
 * Get count of earned badges
 */
export function getEarnedBadgesCount(ratings: ExerciseRatings): number {
  return calculateBadges(ratings).filter(b => b.earned).length
}

// AI Coach Tip type
export interface CoachTip {
  type: 'encouragement' | 'progress' | 'balance' | 'achievement'
  message: string
  icon: string
}

/**
 * Calculate body part level averages for balance analysis
 */
export function calculateBodyPartLevels(ratings: ExerciseRatings): Record<BodyPart, number> {
  const bodyPartLevels: Record<BodyPart, number[]> = {
    chest: [], back: [], shoulders: [], legs: [], arms: [], core: []
  }

  Object.entries(ratings).forEach(([exerciseId, level]) => {
    if (level) {
      const exercise = EXERCISES.find(e => e.id === exerciseId)
      if (exercise) {
        bodyPartLevels[exercise.bodyPart].push(LEVEL_VALUES[level])
      }
    }
  })

  const averages: Record<BodyPart, number> = {
    chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0
  }

  Object.entries(bodyPartLevels).forEach(([bp, levels]) => {
    if (levels.length > 0) {
      averages[bp as BodyPart] = levels.reduce((a, b) => a + b, 0) / levels.length
    }
  })

  return averages
}

/**
 * Find weak body parts (below average level)
 */
export function findWeakBodyParts(ratings: ExerciseRatings): { name: string; level: number; avgLevel: number }[] {
  const bodyPartLevels = calculateBodyPartLevels(ratings)
  const mainBodyParts: BodyPart[] = ['chest', 'back', 'shoulders', 'legs', 'arms']

  // Get body parts that have been rated
  const ratedBodyParts = mainBodyParts.filter(bp => bodyPartLevels[bp] > 0)
  if (ratedBodyParts.length < 2) return [] // Need at least 2 body parts to compare

  // Calculate average across all rated body parts
  const totalLevel = ratedBodyParts.reduce((sum, bp) => sum + bodyPartLevels[bp], 0)
  const avgLevel = totalLevel / ratedBodyParts.length

  // Find body parts significantly below average (more than 0.5 level difference)
  const weakParts = ratedBodyParts
    .filter(bp => bodyPartLevels[bp] < avgLevel - 0.3)
    .map(bp => ({
      name: bp.charAt(0).toUpperCase() + bp.slice(1),
      level: bodyPartLevels[bp],
      avgLevel
    }))
    .sort((a, b) => a.level - b.level) // Weakest first

  return weakParts
}

/**
 * Generate contextual AI Coach tips based on user's ratings
 * PRIORITY: Body part imbalances > Progress advice > Generic encouragement
 */
export function generateCoachTips(ratings: ExerciseRatings): CoachTip[] {
  const tips: CoachTip[] = []
  const ratedLevels = Object.values(ratings).filter((l): l is Level => l !== undefined)
  const ratedCount = ratedLevels.length
  const strengthScore = calculateStrengthScore(ratings)

  // Tip 1: New user encouragement (highest priority for new users)
  if (ratedCount === 0) {
    tips.push({
      type: 'encouragement',
      message: "Welcome! Start by rating a few exercises you regularly perform. Even 4-5 exercises is a great start!",
      icon: '👋'
    })
    return tips
  }

  // PRIORITY TIP: Body part imbalances (weak body parts)
  const weakBodyParts = findWeakBodyParts(ratings)
  if (weakBodyParts.length > 0) {
    const weakest = weakBodyParts[0]
    const levelName = weakest.level <= 1.5 ? 'beginner' : weakest.level <= 2.5 ? 'novice' : 'intermediate'
    tips.push({
      type: 'balance',
      message: `Weak ${weakest.name.toLowerCase()}: Focus on ${weakest.name.toLowerCase()} exercises to balance your strength profile.`,
      icon: '⚖️'
    })
  }

  // Count levels
  const levelCounts = {
    beginner: ratedLevels.filter(l => l === 'beginner').length,
    novice: ratedLevels.filter(l => l === 'novice').length,
    intermediate: ratedLevels.filter(l => l === 'intermediate').length,
    advanced: ratedLevels.filter(l => l === 'advanced').length
  }

  // Get rated exercises by body part
  const ratedByBodyPart: Record<BodyPart, number> = {
    chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0
  }

  Object.entries(ratings).forEach(([exerciseId, level]) => {
    if (level) {
      const exercise = EXERCISES.find(e => e.id === exerciseId)
      if (exercise) {
        ratedByBodyPart[exercise.bodyPart]++
      }
    }
  })

  // Tip 2: First achievement (if only 1 exercise rated)
  if (ratedCount === 1) {
    tips.push({
      type: 'achievement',
      message: "Great first step! You've started your strength journey. Keep adding exercises as you train.",
      icon: '🎯'
    })
  }

  // Tip 3: Progress advice based on majority level
  if (levelCounts.beginner > 0 && levelCounts.beginner >= ratedCount * 0.5) {
    tips.push({
      type: 'progress',
      message: "Focus on progressive overload - add small amounts of weight each week to move towards Novice level.",
      icon: '📈'
    })
  } else if (levelCounts.novice > 0 && levelCounts.novice >= ratedCount * 0.5) {
    tips.push({
      type: 'progress',
      message: "You're building a solid foundation! Consider adding compound movements to accelerate strength gains.",
      icon: '💪'
    })
  } else if (levelCounts.intermediate > 0 && levelCounts.intermediate >= ratedCount * 0.5) {
    tips.push({
      type: 'progress',
      message: "Impressive progress! To reach Advanced, focus on periodization and ensure adequate recovery.",
      icon: '🔥'
    })
  } else if (levelCounts.advanced > 0 && tips.length === 0) {
    tips.push({
      type: 'achievement',
      message: "Elite performance! Maintain your strength with consistent training and prioritize injury prevention.",
      icon: '🏆'
    })
  }

  // Tip 4: Balance advice - check if any body part is completely neglected
  const bodyPartsWithExercises = Object.entries(ratedByBodyPart)
    .filter(([, count]) => count > 0)

  if (bodyPartsWithExercises.length > 0 && tips.length < 2) {
    const exercisesPerBodyPart: Record<BodyPart, number> = {
      chest: 10, back: 11, shoulders: 13, legs: 16, arms: 17, core: 10
    }

    // Find most neglected body part that has exercises in our list
    const neglectedParts = (['chest', 'back', 'shoulders', 'legs', 'arms'] as BodyPart[])
      .filter(bp => ratedByBodyPart[bp] === 0 && exercisesPerBodyPart[bp] > 0)

    if (neglectedParts.length > 0 && ratedCount >= 3) {
      const partName = neglectedParts[0].charAt(0).toUpperCase() + neglectedParts[0].slice(1)
      tips.push({
        type: 'balance',
        message: `Consider adding some ${partName} exercises for balanced development.`,
        icon: '⚖️'
      })
    }
  }

  // Tip 5: Score milestone encouragement (lower priority)
  if (tips.length < 2) {
    if (strengthScore > 0 && strengthScore < 50) {
      tips.push({
        type: 'encouragement',
        message: `Score: ${strengthScore}/100. Keep training consistently and you'll see that number climb!`,
        icon: '📊'
      })
    } else if (strengthScore >= 50 && strengthScore < 75) {
      tips.push({
        type: 'encouragement',
        message: `Score: ${strengthScore}/100. You're past halfway! Strong foundation built.`,
        icon: '⭐'
      })
    } else if (strengthScore >= 75 && strengthScore < 100) {
      tips.push({
        type: 'encouragement',
        message: `Score: ${strengthScore}/100. Almost elite status! Keep pushing those limits.`,
        icon: '🚀'
      })
    } else if (strengthScore === 100) {
      tips.push({
        type: 'achievement',
        message: "Perfect 100! You've achieved Elite Status. You're in the top tier of strength!",
        icon: '👑'
      })
    }
  }

  // Return only first 2 tips to avoid overwhelming
  return tips.slice(0, 2)
}

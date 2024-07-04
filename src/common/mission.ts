export const missionRewards: {
    [key in MissionDifficulty]: number
} = {
    easy: 5,
    medium: 10,
    hard: 15,
    random: 20
};

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'random';

export const difficulties: MissionDifficulty[] = ['easy', 'medium', 'hard', 'random'];

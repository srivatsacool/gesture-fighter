export enum GameState {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

export enum GestureType {
  IDLE = 'IDLE',
  LEFT_PUNCH = 'LEFT_PUNCH',
  RIGHT_PUNCH = 'RIGHT_PUNCH',
  BLOCK = 'BLOCK'
}

export interface PlayerStats {
  health: number; // 0-100
  score: number;
  combo: number;
}

export interface GameResult {
  timeElapsed: number;
  damageDealt: number;
  finalHealth: number;
  maxCombo: number;
  aiCommentary?: string;
}

export enum FightingStyle {
  HAND = 'HAND',
  BODY = 'BODY'
}
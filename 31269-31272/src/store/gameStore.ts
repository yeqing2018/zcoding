import { create } from "zustand";

export type Choice = "rock" | "scissors" | "paper";
export type RoundResult = "win" | "lose" | "draw" | null;
export type GameMode = "single" | "bo3" | "bo5";
export type Theme = "dark" | "purple";
export type FontSize = "small" | "medium" | "large";
export type DrawHandling = "sudden" | "bothScore" | null;

interface GameState {
  totalRounds: number;
  playerWins: number;
  systemWins: number;
  currentPlayerChoice: Choice | null;
  currentSystemChoice: Choice | null;
  roundResult: RoundResult;
  roundId: number;
  isPlaying: boolean;
  isPaused: boolean;
  showExitConfirm: boolean;
  gameExited: boolean;

  gameMode: GameMode;
  matchPlayerWins: number;
  matchSystemWins: number;
  matchDraws: number;
  matchEnded: boolean;
  matchWinner: "player" | "system" | "draw" | null;

  playerHistory: Choice[];
  consecutiveDraws: number;
  showDrawModal: boolean;
  drawHandling: DrawHandling;

  theme: Theme;
  fontSize: FontSize;
  systemAnimating: boolean;

  playRound: (playerChoice: Choice) => void;
  resetGame: () => void;
  confirmExit: () => void;
  cancelExit: () => void;
  exitGame: () => void;

  setGameMode: (mode: GameMode) => void;
  switchGameMode: (mode: GameMode) => void;
  togglePause: () => void;

  handleDrawDecision: (decision: "sudden" | "bothScore") => void;

  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
}

let roundTimeout: ReturnType<typeof setTimeout> | null = null;
let systemAnimTimeout: ReturnType<typeof setTimeout> | null = null;

const CHOICE_EMOJIS: Record<Choice, string> = {
  rock: "✊",
  scissors: "✌️",
  paper: "🖐️",
};

const CHOICE_NAMES: Record<Choice, string> = {
  rock: "石头",
  scissors: "剪刀",
  paper: "布",
};

const WIN_MAP: Record<Choice, Choice> = {
  rock: "scissors",
  scissors: "paper",
  paper: "rock",
};

const MODE_REQUIRED_WINS: Record<GameMode, number> = {
  single: 1,
  bo3: 2,
  bo5: 3,
};

const getSystemChoice = (playerHistory: Choice[]): Choice => {
  const choices: Choice[] = ["rock", "scissors", "paper"];

  if (playerHistory.length < 2) {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const recentHistory = playerHistory.slice(-3);
  const counts: Record<Choice, number> = { rock: 0, scissors: 0, paper: 0 };
  recentHistory.forEach((c) => (counts[c] += 1));

  const mostUsed = (Object.keys(counts) as Choice[]).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );

  const counterChoice: Record<Choice, Choice> = {
    rock: "paper",
    scissors: "rock",
    paper: "scissors",
  };

  const random = Math.random();
  if (random < 0.35) {
    return counterChoice[mostUsed];
  } else if (random < 0.6) {
    return choices[Math.floor(Math.random() * choices.length)];
  } else {
    const leastUsed = (Object.keys(counts) as Choice[]).reduce((a, b) =>
      counts[a] < counts[b] ? a : b
    );
    return counterChoice[leastUsed];
  }
};

const determineWinner = (player: Choice, system: Choice): RoundResult => {
  if (player === system) return "draw";
  if (WIN_MAP[player] === system) return "win";
  return "lose";
};

const checkMatchEnd = (
  mode: GameMode,
  playerWins: number,
  systemWins: number
): { ended: boolean; winner: "player" | "system" | null } => {
  const required = MODE_REQUIRED_WINS[mode];
  if (playerWins >= required) return { ended: true, winner: "player" };
  if (systemWins >= required) return { ended: true, winner: "system" };
  return { ended: false, winner: null };
};

const clearAllTimeouts = () => {
  if (roundTimeout) {
    clearTimeout(roundTimeout);
    roundTimeout = null;
  }
  if (systemAnimTimeout) {
    clearTimeout(systemAnimTimeout);
    systemAnimTimeout = null;
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  totalRounds: 0,
  playerWins: 0,
  systemWins: 0,
  currentPlayerChoice: null,
  currentSystemChoice: null,
  roundResult: null,
  roundId: 0,
  isPlaying: false,
  isPaused: false,
  showExitConfirm: false,
  gameExited: false,

  gameMode: "single",
  matchPlayerWins: 0,
  matchSystemWins: 0,
  matchDraws: 0,
  matchEnded: false,
  matchWinner: null,

  playerHistory: [],
  consecutiveDraws: 0,
  showDrawModal: false,
  drawHandling: null,

  theme: "dark",
  fontSize: "medium",
  systemAnimating: false,

  playRound: (playerChoice: Choice) => {
    const state = get();
    if (state.isPlaying || state.isPaused || state.matchEnded) return;

    clearAllTimeouts();

    set({
      systemAnimating: true,
      currentPlayerChoice: playerChoice,
      currentSystemChoice: null,
      roundResult: null,
      isPlaying: true,
    });

    systemAnimTimeout = setTimeout(() => {
      const { playerHistory } = get();
      const systemChoice = getSystemChoice(playerHistory);
      const result = determineWinner(playerChoice, systemChoice);

      const newHistory = [...playerHistory, playerChoice].slice(-10);

      let newPlayerWins = get().matchPlayerWins;
      let newSystemWins = get().matchSystemWins;
      let newDraws = get().matchDraws;
      let newConsecutiveDraws = get().consecutiveDraws;
      let showModal = false;

      if (result === "win") {
        newPlayerWins += 1;
        newConsecutiveDraws = 0;
      } else if (result === "lose") {
        newSystemWins += 1;
        newConsecutiveDraws = 0;
      } else {
        newDraws += 1;
        newConsecutiveDraws += 1;
        if (newConsecutiveDraws >= 3) {
          showModal = true;
          newConsecutiveDraws = 0;
        }
      }

      const matchResult = checkMatchEnd(
        get().gameMode,
        newPlayerWins,
        newSystemWins
      );

      set((s) => ({
        totalRounds: s.totalRounds + 1,
        playerWins: result === "win" ? s.playerWins + 1 : s.playerWins,
        systemWins: result === "lose" ? s.systemWins + 1 : s.systemWins,
        currentSystemChoice: systemChoice,
        roundResult: result,
        roundId: s.roundId + 1,
        playerHistory: newHistory,
        matchPlayerWins: newPlayerWins,
        matchSystemWins: newSystemWins,
        matchDraws: newDraws,
        consecutiveDraws: newConsecutiveDraws,
        showDrawModal: showModal,
        systemAnimating: false,
        matchEnded: matchResult.ended,
        matchWinner: matchResult.winner,
      }));

      if (!showModal) {
        roundTimeout = setTimeout(() => {
          set({ isPlaying: false });
          roundTimeout = null;
        }, 1500);
      }
    }, 800);
  },

  resetGame: () => {
    clearAllTimeouts();
    set({
      totalRounds: 0,
      playerWins: 0,
      systemWins: 0,
      currentPlayerChoice: null,
      currentSystemChoice: null,
      roundResult: null,
      roundId: 0,
      isPlaying: false,
      isPaused: false,
      matchPlayerWins: 0,
      matchSystemWins: 0,
      matchDraws: 0,
      matchEnded: false,
      matchWinner: null,
      playerHistory: [],
      consecutiveDraws: 0,
      showDrawModal: false,
      drawHandling: null,
      systemAnimating: false,
    });
  },

  confirmExit: () => {
    set({ showExitConfirm: true });
  },

  cancelExit: () => {
    set({ showExitConfirm: false });
  },

  exitGame: () => {
    clearAllTimeouts();
    set({ gameExited: true, showExitConfirm: false });
  },

  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
  },

  switchGameMode: (mode: GameMode) => {
    clearAllTimeouts();
    set({
      gameMode: mode,
      matchPlayerWins: 0,
      matchSystemWins: 0,
      matchDraws: 0,
      matchEnded: false,
      matchWinner: null,
      currentPlayerChoice: null,
      currentSystemChoice: null,
      roundResult: null,
      isPlaying: false,
      isPaused: false,
      consecutiveDraws: 0,
      showDrawModal: false,
      drawHandling: null,
      systemAnimating: false,
    });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  handleDrawDecision: (decision: "sudden" | "bothScore") => {
    if (decision === "bothScore") {
      set((s) => ({
        matchPlayerWins: s.matchPlayerWins + 1,
        matchSystemWins: s.matchSystemWins + 1,
        playerWins: s.playerWins + 1,
        systemWins: s.systemWins + 1,
        totalRounds: s.totalRounds + 1,
        roundId: s.roundId + 1,
        showDrawModal: false,
        drawHandling: decision,
      }));
    } else {
      set({
        showDrawModal: false,
        drawHandling: decision,
      });
    }

    const state = get();
    const matchResult = checkMatchEnd(
      state.gameMode,
      state.matchPlayerWins,
      state.matchSystemWins
    );

    if (matchResult.ended) {
      clearAllTimeouts();
      set({
        matchEnded: true,
        matchWinner: matchResult.winner,
        isPlaying: false,
      });
    } else {
      clearAllTimeouts();
      roundTimeout = setTimeout(() => {
        set({ isPlaying: false });
        roundTimeout = null;
      }, 1000);
    }
  },

  setTheme: (theme: Theme) => {
    set({ theme });
  },

  setFontSize: (size: FontSize) => {
    set({ fontSize: size });
  },
}));

export { CHOICE_EMOJIS, CHOICE_NAMES, MODE_REQUIRED_WINS };

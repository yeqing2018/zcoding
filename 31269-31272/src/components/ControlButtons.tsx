import { useGameStore } from "@/store/gameStore";

export default function ControlButtons() {
  const { resetGame, confirmExit, isPlaying, isPaused, togglePause, matchEnded } =
    useGameStore();

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={togglePause}
        disabled={matchEnded}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
          isPaused
            ? "bg-win/20 border-2 border-win/50 text-win hover:bg-win/30"
            : "bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30"
        }`}
      >
        {isPaused ? "▶️ 继续" : "⏸️ 暂停"}
      </button>
      <button
        onClick={resetGame}
        disabled={isPlaying}
        className="px-5 py-2.5 rounded-xl bg-accent/20 border-2 border-accent/50 text-accent font-semibold transition-all duration-300 hover:bg-accent/30 hover:border-accent hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        🔄 重新开始
      </button>
      <button
        onClick={confirmExit}
        disabled={isPlaying}
        className="px-5 py-2.5 rounded-xl bg-lose/20 border-2 border-lose/50 text-lose font-semibold transition-all duration-300 hover:bg-lose/30 hover:border-lose hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        🚪 退出游戏
      </button>
    </div>
  );
}

import { useGameStore, CHOICE_EMOJIS, CHOICE_NAMES } from "@/store/gameStore";

export default function BattleArea() {
  const {
    currentPlayerChoice,
    currentSystemChoice,
    roundResult,
    isPlaying,
    isPaused,
    roundId,
    systemAnimating,
    gameMode,
    matchPlayerWins,
    matchSystemWins,
    matchEnded,
    matchWinner,
    resetGame,
  } = useGameStore();

  const getResultText = () => {
    if (matchEnded) {
      return matchWinner === "player"
        ? "🎉 恭喜你获胜！"
        : "😢 很遗憾，系统获胜！";
    }
    switch (roundResult) {
      case "win":
        return "🎉 你赢了！";
      case "lose":
        return "😢 你输了！";
      case "draw":
        return "🤝 平局！";
      default:
        return "请选择出拳";
    }
  };

  const getResultColor = () => {
    if (matchEnded) {
      return matchWinner === "player" ? "text-win" : "text-lose";
    }
    switch (roundResult) {
      case "win":
        return "text-win";
      case "lose":
        return "text-lose";
      case "draw":
        return "text-draw";
      default:
        return "text-gray-400";
    }
  };

  const getResultBg = () => {
    if (matchEnded) {
      return matchWinner === "player"
        ? "bg-win/20 border-win/50"
        : "bg-lose/20 border-lose/50";
    }
    switch (roundResult) {
      case "win":
        return "bg-win/20 border-win/50";
      case "lose":
        return "bg-lose/20 border-lose/50";
      case "draw":
        return "bg-draw/20 border-draw/50";
      default:
        return "bg-white/5 border-white/10";
    }
  };

  if (isPaused) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-8xl mb-4">⏸️</div>
        <h2 className="text-3xl font-bold text-white mb-2">游戏暂停</h2>
        <p className="text-gray-400">点击继续按钮恢复对战</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {gameMode !== "single" && (
        <div className="mb-6 px-6 py-2 bg-white/10 rounded-full border border-white/20">
          <span className="text-white font-semibold">
            比分：<span className="text-win">{matchPlayerWins}</span> -{" "}
            <span className="text-lose">{matchSystemWins}</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 md:gap-12 mb-8">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">玩家</div>
          <div key={`player-${roundId}`}>
            <div
              className={`battle-circle w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-5xl md:text-6xl transition-all duration-300 ${
                currentPlayerChoice ? "animate-pop-in" : ""
              } ${roundResult === "win" ? "animate-pulse-glow" : ""}`}
            >
              {currentPlayerChoice ? (
                CHOICE_EMOJIS[currentPlayerChoice]
              ) : (
                <span className="text-3xl md:text-4xl text-gray-600">?</span>
              )}
            </div>
            {currentPlayerChoice && (
              <div className="mt-2 text-white text-sm">
                {CHOICE_NAMES[currentPlayerChoice]}
              </div>
            )}
          </div>
        </div>

        <div className="text-3xl md:text-4xl font-bold text-accent">VS</div>

        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">系统</div>
          <div key={`system-${roundId}`}>
            <div
              className={`battle-circle w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-5xl md:text-6xl transition-all duration-300 ${
                systemAnimating ? "animate-shake-fast" : ""
              } ${
                currentSystemChoice && !systemAnimating ? "animate-pop-in" : ""
              } ${roundResult === "lose" ? "animate-pulse-glow" : ""}`}
            >
              {systemAnimating ? (
                <span className="text-3xl animate-spin">🎲</span>
              ) : currentSystemChoice ? (
                CHOICE_EMOJIS[currentSystemChoice]
              ) : (
                <span className="text-3xl md:text-4xl text-gray-600">?</span>
              )}
            </div>
            {currentSystemChoice && !systemAnimating && (
              <div className="mt-2 text-white text-sm">
                {CHOICE_NAMES[currentSystemChoice]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div key={`result-${roundId}`}>
        <div
          className={`px-8 md:px-12 py-3 md:py-4 rounded-2xl border-2 ${getResultBg()} transition-all duration-300 ${
            roundResult || matchEnded ? "animate-bounce-in" : ""
          }`}
        >
          <span className={`text-xl md:text-2xl font-bold ${getResultColor()}`}>
            {getResultText()}
          </span>
        </div>
      </div>

      {matchEnded && (
        <button
          onClick={resetGame}
          className="mt-6 px-8 py-3 rounded-xl bg-accent/20 border-2 border-accent/50 text-accent font-semibold transition-all duration-300 hover:bg-accent/30 hover:border-accent hover:scale-105 active:scale-95"
        >
          🔄 再来一局
        </button>
      )}

      {isPlaying && !systemAnimating && !matchEnded && (
        <div className="mt-4 text-gray-500 text-sm animate-pulse">
          等待下一轮...
        </div>
      )}
    </div>
  );
}

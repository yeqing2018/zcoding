import { useState } from "react";
import { useGameStore, type GameMode, MODE_REQUIRED_WINS } from "@/store/gameStore";

export default function GameModeSelector() {
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  const { gameMode, switchGameMode, isPlaying, matchEnded } = useGameStore();

  const modes: { value: GameMode; label: string; desc: string }[] = [
    { value: "single", label: "单局", desc: "1局定胜负" },
    { value: "bo3", label: "3局2胜", desc: "先赢2局获胜" },
    { value: "bo5", label: "5局3胜", desc: "先赢3局获胜" },
  ];

  const handleModeClick = (mode: GameMode) => {
    if (mode === gameMode) return;
    if (isPlaying) return;
    if (matchEnded) {
      switchGameMode(mode);
    } else {
      setPendingMode(mode);
      setShowSwitchConfirm(true);
    }
  };

  const confirmSwitch = () => {
    if (pendingMode) {
      switchGameMode(pendingMode);
    }
    setShowSwitchConfirm(false);
    setPendingMode(null);
  };

  const cancelSwitch = () => {
    setShowSwitchConfirm(false);
    setPendingMode(null);
  };

  return (
    <>
      <div className="flex justify-center gap-3 mb-6">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleModeClick(mode.value)}
            disabled={isPlaying}
            className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
              gameMode === mode.value
                ? "border-accent bg-accent/20 text-accent"
                : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="font-bold text-sm">{mode.label}</div>
            <div className="text-xs opacity-70">{mode.desc}</div>
          </button>
        ))}
      </div>

      {showSwitchConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 border border-white/20 animate-bounce-in">
            <h3 className="text-xl font-bold text-white mb-3">切换模式</h3>
            <p className="text-gray-400 mb-5">
              切换到 <span className="text-accent font-bold">{modes.find((m) => m.value === pendingMode)?.label}</span> 模式，当前对局进度将被清除，确定继续吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelSwitch}
                className="flex-1 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                取消
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 py-2 rounded-xl bg-accent/20 border-2 border-accent/50 text-accent font-semibold hover:bg-accent/30 transition-all"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

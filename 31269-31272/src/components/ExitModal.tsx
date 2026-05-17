import { useGameStore } from "@/store/gameStore";

export default function ExitModal() {
  const { showExitConfirm, cancelExit, exitGame } = useGameStore();

  if (!showExitConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 border border-white/20 animate-bounce-in">
        <h3 className="text-2xl font-bold text-white text-center mb-4">
          确认退出
        </h3>
        <p className="text-gray-400 text-center mb-6">
          确定要退出游戏吗？当前战绩将会被清除。
        </p>
        <div className="flex gap-4">
          <button
            onClick={cancelExit}
            className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            取消
          </button>
          <button
            onClick={exitGame}
            className="flex-1 px-6 py-3 rounded-xl bg-lose/20 border-2 border-lose/50 text-lose font-semibold transition-all duration-300 hover:bg-lose/30 hover:border-lose hover:scale-105 active:scale-95"
          >
            确认退出
          </button>
        </div>
      </div>
    </div>
  );
}

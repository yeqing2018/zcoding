import { useGameStore } from "@/store/gameStore";

export default function DrawModal() {
  const { showDrawModal, handleDrawDecision } = useGameStore();

  if (!showDrawModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 border border-draw/50 animate-bounce-in">
        <div className="text-center">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-2xl font-bold text-draw mb-2">连续3次平局！</h3>
          <p className="text-gray-400 mb-6">请选择处理方式：</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleDrawDecision("sudden")}
            className="w-full py-3 rounded-xl bg-accent/20 border-2 border-accent/50 text-accent font-semibold transition-all duration-300 hover:bg-accent/30 hover:border-accent hover:scale-105 active:scale-95"
          >
            ⚡ 加赛一局
            <div className="text-xs opacity-70 font-normal">继续对战，直到分出胜负</div>
          </button>
          <button
            onClick={() => handleDrawDecision("bothScore")}
            className="w-full py-3 rounded-xl bg-draw/20 border-2 border-draw/50 text-draw font-semibold transition-all duration-300 hover:bg-draw/30 hover:border-draw hover:scale-105 active:scale-95"
          >
            📊 双方各得1分
            <div className="text-xs opacity-70 font-normal">玩家和系统各增加1胜场</div>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useGameStore } from "@/store/gameStore";

export default function StatsCard() {
  const { totalRounds, playerWins, systemWins } = useGameStore();

  return (
    <div className="flex justify-center gap-4 md:gap-8 mb-8">
      <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl px-5 md:px-8 py-3 md:py-4 text-center border border-white/20">
        <div className="text-3xl md:text-4xl font-bold text-accent">{totalRounds}</div>
        <div className="text-xs md:text-sm text-gray-400 mt-1">总对战</div>
      </div>
      <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl px-5 md:px-8 py-3 md:py-4 text-center border border-white/20">
        <div className="text-3xl md:text-4xl font-bold text-win">{playerWins}</div>
        <div className="text-xs md:text-sm text-gray-400 mt-1">玩家胜</div>
      </div>
      <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl px-5 md:px-8 py-3 md:py-4 text-center border border-white/20">
        <div className="text-3xl md:text-4xl font-bold text-lose">{systemWins}</div>
        <div className="text-xs md:text-sm text-gray-400 mt-1">系统胜</div>
      </div>
    </div>
  );
}

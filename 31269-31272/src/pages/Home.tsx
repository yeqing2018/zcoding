import { useGameStore } from "@/store/gameStore";
import StatsCard from "@/components/StatsCard";
import BattleArea from "@/components/BattleArea";
import ChoiceButtons from "@/components/ChoiceButtons";
import ControlButtons from "@/components/ControlButtons";
import ExitModal from "@/components/ExitModal";
import ExitScreen from "@/components/ExitScreen";
import SettingsPanel from "@/components/SettingsPanel";
import GameModeSelector from "@/components/GameModeSelector";
import DrawModal from "@/components/DrawModal";

export default function Home() {
  const { gameExited, theme, fontSize } = useGameStore();

  if (gameExited) {
    return <ExitScreen />;
  }

  return (
    <div className={`min-h-screen theme-${theme} font-size-${fontSize}`}>
      <SettingsPanel />

      <div className="game-container min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight text-center">
          ✊ 石头剪刀布 ✌️
        </h1>
        <p className="text-gray-400 mb-6 text-center">与系统一决高下！</p>

        <GameModeSelector />

        <StatsCard />

        <div className="w-full max-w-xl bg-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-12 border border-white/10 mb-8">
          <BattleArea />
        </div>

        <ChoiceButtons />
        <ControlButtons />

        <ExitModal />
        <DrawModal />
      </div>
    </div>
  );
}
import { useGameStore, CHOICE_EMOJIS, CHOICE_NAMES, type Choice } from "@/store/gameStore";

interface ChoiceButtonProps {
  choice: Choice;
  disabled: boolean;
}

function ChoiceButton({ choice, disabled }: ChoiceButtonProps) {
  const playRound = useGameStore((state) => state.playRound);

  return (
    <button
      onClick={() => playRound(choice)}
      disabled={disabled}
      className={`choice-button group relative rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:bg-white/20 hover:border-accent hover:scale-105 hover:shadow-lg hover:shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/20 disabled:hover:shadow-none`}
    >
      <span className="text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-110">
        {CHOICE_EMOJIS[choice]}
      </span>
      <span className="text-xs md:text-sm text-gray-300">
        {CHOICE_NAMES[choice]}
      </span>
    </button>
  );
}

export default function ChoiceButtons() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const isPaused = useGameStore((state) => state.isPaused);
  const matchEnded = useGameStore((state) => state.matchEnded);

  const disabled = isPlaying || isPaused || matchEnded;

  return (
    <div className="flex justify-center gap-4 md:gap-6 mb-8">
      <ChoiceButton choice="rock" disabled={disabled} />
      <ChoiceButton choice="scissors" disabled={disabled} />
      <ChoiceButton choice="paper" disabled={disabled} />
    </div>
  );
}

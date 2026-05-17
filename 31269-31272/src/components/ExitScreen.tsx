export default function ExitScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center animate-bounce-in">
        <div className="text-8xl mb-6">👋</div>
        <h1 className="text-4xl font-bold text-white mb-4">游戏已结束</h1>
        <p className="text-gray-400 mb-8">感谢您的游玩！</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 rounded-xl bg-accent/20 border-2 border-accent/50 text-accent font-semibold text-lg transition-all duration-300 hover:bg-accent/30 hover:border-accent hover:scale-105 active:scale-95"
        >
          🎮 重新开始游戏
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useGameStore, type Theme, type FontSize } from "@/store/gameStore";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, fontSize, setTheme, setFontSize } = useGameStore();

  const themes: { value: Theme; label: string; color: string }[] = [
    { value: "dark", label: "深邃蓝", color: "bg-slate-800" },
    { value: "purple", label: "神秘紫", color: "bg-purple-700" },
  ];

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: "small", label: "小" },
    { value: "medium", label: "中" },
    { value: "large", label: "大" },
  ];

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 w-72 bg-gray-800/95 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl animate-bounce-in">
          <h3 className="text-lg font-bold text-white mb-4">界面设置</h3>

          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">背景主题</label>
            <div className="flex gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all duration-200 ${
                    theme === t.value
                      ? "border-accent bg-accent/20"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${t.color} mx-auto mb-1`} />
                  <span className="text-xs text-white">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">文字大小</label>
            <div className="flex gap-2">
              {fontSizes.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFontSize(f.value)}
                  className={`flex-1 py-2 rounded-xl border-2 text-white transition-all duration-200 ${
                    fontSize === f.value
                      ? "border-accent bg-accent/20"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

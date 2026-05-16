import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Palette, ChevronDown, Type } from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import { PRESET_COLORS, EMOJI_LIST, DanmakuType } from '../../types/danmaku';
import type { Danmaku } from '../../types/danmaku';

interface SendBarProps {
  onSend: (danmaku: Danmaku) => void;
}

const DANMAKU_TYPE_OPTIONS = [
  { value: DanmakuType.SCROLL, label: '滚动弹幕' },
  { value: DanmakuType.TOP, label: '顶部固定' },
  { value: DanmakuType.BOTTOM, label: '底部固定' },
  { value: DanmakuType.COLOR, label: '彩色弹幕' },
  { value: DanmakuType.SPECIAL, label: '特效弹幕' },
];

export const SendBar: React.FC<SendBarProps> = ({ onSend }) => {
  const {
    config,
    currentUser,
    createDanmaku,
    showEmojiPicker,
    showColorPicker,
    toggleEmojiPicker,
    toggleColorPicker,
    setShowEmojiPicker,
    setShowColorPicker,
  } = useDanmakuStore();

  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedType, setSelectedType] = useState<DanmakuType>(DanmakuType.SCROLL);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowEmojiPicker, setShowColorPicker]);

  const handleSend = () => {
    if (!text.trim()) return;

    const danmaku = createDanmaku(text.trim(), {
      type: selectedType,
      color: selectedColor,
      fontSize: config.display.fontSize,
    });

    onSend(danmaku);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const handleTypeSelect = (type: DanmakuType) => {
    setSelectedType(type);
    setShowTypeDropdown(false);
  };

  const selectedTypeLabel = DANMAKU_TYPE_OPTIONS.find(opt => opt.value === selectedType)?.label || '滚动弹幕';

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-game-dark-700/90 backdrop-blur-md text-white border border-neon-cyan/30 hover:border-neon-cyan/50 transition-all duration-200 text-sm font-jetbrains-mono"
          >
            <Type size={16} />
            <span>{selectedTypeLabel}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showTypeDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showTypeDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-36 rounded-xl bg-game-dark-800/95 backdrop-blur-md border border-neon-cyan/20 overflow-hidden animate-scale-in">
              {DANMAKU_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleTypeSelect(option.value as DanmakuType)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 ${
                    selectedType === option.value
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发送弹幕..."
            maxLength={100}
            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-game-dark-700/90 backdrop-blur-md text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 outline-none transition-all duration-200 font-jetbrains-mono"
            style={{ color: selectedColor }}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-xs text-gray-500 font-jetbrains-mono mr-2">
              {text.length}/100
            </span>
            
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={toggleColorPicker}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150"
                style={{ color: selectedColor }}
              >
                <Palette size={18} />
              </button>

              {showColorPicker && (
                <div className="absolute bottom-full right-0 mb-2 p-3 rounded-xl bg-game-dark-800/95 backdrop-blur-md border border-neon-cyan/20 animate-scale-in">
                  <div className="grid grid-cols-5 gap-2 w-52">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorClick(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          selectedColor === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={toggleEmojiPicker}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150 text-neon-yellow"
              >
                <Smile size={18} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 p-3 rounded-xl bg-game-dark-800/95 backdrop-blur-md border border-neon-cyan/20 animate-scale-in max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1 w-64">
                    {EMOJI_LIST.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition-colors duration-150"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium font-jetbrains-mono hover:shadow-lg hover:shadow-neon-cyan/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <Send size={18} />
          发送
        </button>
      </div>
    </div>
  );
};

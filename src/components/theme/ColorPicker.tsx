import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div ref={pickerRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-20 px-2 py-1 text-xs bg-background border border-border rounded text-foreground font-mono"
            placeholder="#000000"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-8 h-8 rounded-md border-2 border-border transition-all",
              "hover:scale-105 hover:border-primary/50",
              isOpen && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
      
      {isOpen && (
        <div className="p-3 bg-card border border-border rounded-lg shadow-lg">
          <input
            type="color"
            value={value}
            onChange={handleColorChange}
            className="w-full h-32 cursor-pointer rounded border-none"
            style={{ padding: 0 }}
          />
        </div>
      )}
    </div>
  );
}

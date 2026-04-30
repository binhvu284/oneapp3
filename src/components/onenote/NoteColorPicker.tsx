const NOTE_COLORS = [
  { name: "None", value: null },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Green", value: "#34d399" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Purple", value: "#a78bfa" },
  { name: "Pink", value: "#f472b6" },
  { name: "Orange", value: "#fb923c" },
  { name: "Red", value: "#f87171" },
];

interface NoteColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

export function NoteColorPicker({ value, onChange }: NoteColorPickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      {NOTE_COLORS.map((c) => (
        <button
          key={c.name}
          onClick={() => onChange(c.value)}
          className={`w-5 h-5 rounded-full border-2 transition-all ${
            value === c.value ? "border-primary scale-110" : "border-transparent hover:scale-105"
          } ${!c.value ? "bg-muted border-border" : ""}`}
          style={c.value ? { backgroundColor: c.value } : undefined}
          title={c.name}
        />
      ))}
    </div>
  );
}

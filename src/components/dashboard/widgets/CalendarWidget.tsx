import { useState } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarWidget() {
  const [date] = useState(new Date());
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = date.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-medium text-foreground mb-2 text-center">
        {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAYS.map((d) => (
          <span key={d} className="text-[9px] text-muted-foreground font-medium py-0.5">{d}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`text-[10px] py-0.5 rounded-sm ${
              day === today
                ? "bg-primary text-primary-foreground font-bold"
                : day
                ? "text-foreground"
                : ""
            }`}
          >
            {day ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

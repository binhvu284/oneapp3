import { lazy, ComponentType } from "react";
import {
  Clock, BarChart3, Grid3X3, Activity, TrendingUp,
  Calendar, Hand, Zap, StickyNote, CloudSun, Timer, CheckSquare,
} from "lucide-react";

const ClockWidget = lazy(() => import("./ClockWidget"));
const StatsWidget = lazy(() => import("./StatsWidget"));
const AppShortcutsWidget = lazy(() => import("./AppShortcutsWidget"));
const RecentActivityWidget = lazy(() => import("./RecentActivityWidget"));
const CryptoTickerWidget = lazy(() => import("./CryptoTickerWidget"));
const CalendarWidget = lazy(() => import("./CalendarWidget"));
const WelcomeWidget = lazy(() => import("./WelcomeWidget"));
const MiniFunctionWidget = lazy(() => import("./MiniFunctionWidget"));
const NotesWidget = lazy(() => import("./NotesWidget"));
const WeatherWidget = lazy(() => import("./WeatherWidget"));
const PomodoroWidget = lazy(() => import("./PomodoroWidget"));
const TodoWidget = lazy(() => import("./TodoWidget"));

export type WidgetType =
  | "clock"
  | "stats"
  | "app_shortcuts"
  | "recent_activity"
  | "crypto_ticker"
  | "calendar"
  | "welcome"
  | "mini_function"
  | "notes"
  | "weather"
  | "pomodoro"
  | "todo";

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<{ config?: Record<string, any>; onConfigChange?: (c: Record<string, any>) => void }>;
  defaultSize: { w: number; h: number; minW: number; minH: number };
  configFields?: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  welcome: {
    type: "welcome",
    label: "Welcome",
    description: "Greeting card with avatar & quote",
    icon: Hand,
    component: WelcomeWidget,
    defaultSize: { w: 6, h: 2, minW: 3, minH: 2 },
  },
  clock: {
    type: "clock",
    label: "Clock",
    description: "Digital or analog clock",
    icon: Clock,
    component: ClockWidget,
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    configFields: [
      {
        key: "mode",
        label: "Display",
        type: "select",
        options: [
          { label: "Digital", value: "digital" },
          { label: "Analog", value: "analog" },
        ],
      },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "e.g. Asia/Tokyo" },
    ],
  },
  stats: {
    type: "stats",
    label: "Quick Stats",
    description: "Animated app usage overview",
    icon: BarChart3,
    component: StatsWidget,
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
  },
  weather: {
    type: "weather",
    label: "Weather",
    description: "Current weather conditions",
    icon: CloudSun,
    component: WeatherWidget,
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    configFields: [
      { key: "city", label: "City", type: "text", placeholder: "Leave empty for auto-detect" },
    ],
  },
  app_shortcuts: {
    type: "app_shortcuts",
    label: "App Shortcuts",
    description: "Quick access to your apps",
    icon: Grid3X3,
    component: AppShortcutsWidget,
    defaultSize: { w: 6, h: 3, minW: 3, minH: 2 },
  },
  mini_function: {
    type: "mini_function",
    label: "Mini Function",
    description: "Quick action shortcuts",
    icon: Zap,
    component: MiniFunctionWidget,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
  },
  pomodoro: {
    type: "pomodoro",
    label: "Pomodoro",
    description: "Focus timer 25/5 min",
    icon: Timer,
    component: PomodoroWidget,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 3 },
  },
  crypto_ticker: {
    type: "crypto_ticker",
    label: "Crypto Ticker",
    description: "Live prices with sparkline",
    icon: TrendingUp,
    component: CryptoTickerWidget,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
  },
  todo: {
    type: "todo",
    label: "To-do",
    description: "Task list with check/uncheck",
    icon: CheckSquare,
    component: TodoWidget,
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
  },
  recent_activity: {
    type: "recent_activity",
    label: "Recent Activity",
    description: "Your recent actions",
    icon: Activity,
    component: RecentActivityWidget,
    defaultSize: { w: 6, h: 3, minW: 3, minH: 2 },
  },
  notes: {
    type: "notes",
    label: "Notes",
    description: "Quick sticky notes",
    icon: StickyNote,
    component: NotesWidget,
    defaultSize: { w: 6, h: 3, minW: 3, minH: 2 },
  },
  calendar: {
    type: "calendar",
    label: "Mini Calendar",
    description: "Monthly calendar view",
    icon: Calendar,
    component: CalendarWidget,
    defaultSize: { w: 3, h: 3, minW: 3, minH: 3 },
  },
};

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config?: Record<string, any>;
}

export interface DashboardSettings {
  layouts: {
    lg: any[];
    md: any[];
    sm: any[];
    xs: any[];
  };
  widgets: DashboardWidget[];
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "welcome-1", type: "welcome", title: "Welcome" },
  { id: "clock-1", type: "clock", title: "Clock" },
  { id: "stats-1", type: "stats", title: "Quick Stats" },
  { id: "weather-1", type: "weather", title: "Weather" },
  { id: "app_shortcuts-1", type: "app_shortcuts", title: "App Shortcuts" },
  { id: "mini_function-1", type: "mini_function", title: "Mini Function" },
  { id: "pomodoro-1", type: "pomodoro", title: "Pomodoro" },
  { id: "crypto_ticker-1", type: "crypto_ticker", title: "Crypto Ticker" },
  { id: "todo-1", type: "todo", title: "To-do" },
  { id: "recent_activity-1", type: "recent_activity", title: "Recent Activity" },
  { id: "notes-1", type: "notes", title: "Notes" },
];

export const DEFAULT_LAYOUTS = {
  lg: [
    { i: "welcome-1", x: 0, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { i: "clock-1", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "stats-1", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "weather-1", x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "app_shortcuts-1", x: 3, y: 2, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "mini_function-1", x: 9, y: 2, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "pomodoro-1", x: 0, y: 4, w: 3, h: 3, minW: 2, minH: 3 },
    { i: "crypto_ticker-1", x: 3, y: 5, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "todo-1", x: 6, y: 5, w: 3, h: 3, minW: 3, minH: 2 },
    { i: "recent_activity-1", x: 9, y: 5, w: 3, h: 3, minW: 3, minH: 2 },
    { i: "notes-1", x: 0, y: 8, w: 12, h: 3, minW: 3, minH: 2 },
  ],
  md: [
    { i: "welcome-1", x: 0, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { i: "clock-1", x: 6, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "stats-1", x: 0, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
    { i: "weather-1", x: 5, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
    { i: "app_shortcuts-1", x: 0, y: 4, w: 5, h: 3, minW: 3, minH: 2 },
    { i: "mini_function-1", x: 5, y: 4, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "pomodoro-1", x: 0, y: 7, w: 5, h: 3, minW: 2, minH: 3 },
    { i: "crypto_ticker-1", x: 5, y: 7, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "todo-1", x: 0, y: 10, w: 5, h: 3, minW: 3, minH: 2 },
    { i: "recent_activity-1", x: 5, y: 10, w: 5, h: 3, minW: 3, minH: 2 },
    { i: "notes-1", x: 0, y: 13, w: 10, h: 3, minW: 3, minH: 2 },
  ],
  sm: [
    { i: "welcome-1", x: 0, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { i: "clock-1", x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "stats-1", x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "weather-1", x: 0, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "pomodoro-1", x: 3, y: 4, w: 3, h: 3, minW: 2, minH: 3 },
    { i: "app_shortcuts-1", x: 0, y: 6, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "mini_function-1", x: 0, y: 9, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "crypto_ticker-1", x: 3, y: 9, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "todo-1", x: 0, y: 12, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "recent_activity-1", x: 0, y: 15, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "notes-1", x: 0, y: 18, w: 6, h: 3, minW: 3, minH: 2 },
  ],
  xs: [
    { i: "welcome-1", x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "clock-1", x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "stats-1", x: 0, y: 4, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "weather-1", x: 0, y: 6, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "pomodoro-1", x: 0, y: 8, w: 4, h: 3, minW: 2, minH: 3 },
    { i: "app_shortcuts-1", x: 0, y: 11, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "mini_function-1", x: 0, y: 14, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "crypto_ticker-1", x: 0, y: 17, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "todo-1", x: 0, y: 20, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "recent_activity-1", x: 0, y: 23, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "notes-1", x: 0, y: 26, w: 4, h: 3, minW: 2, minH: 2 },
  ],
};

export const DEFAULT_DASHBOARD: DashboardSettings = {
  layouts: DEFAULT_LAYOUTS,
  widgets: DEFAULT_WIDGETS,
};

import { cn } from "@/lib/utils";

interface ThemeColors {
  main: string;
  sidebar: string;
  header: string;
  card: string;
  primary: string;
  text: string;
  textMuted: string;
}

interface ThemePreviewPanelProps {
  colors: ThemeColors;
  className?: string;
}

export function ThemePreviewPanel({ colors, className }: ThemePreviewPanelProps) {
  return (
    <div 
      className={cn(
        "rounded-lg overflow-hidden border border-border shadow-lg",
        className
      )}
      style={{ backgroundColor: colors.main }}
    >
      {/* Layout container */}
      <div className="flex h-48">
        {/* Sidebar */}
        <div 
          className="w-1/4 flex flex-col p-3 gap-2 border-r"
          style={{ 
            backgroundColor: colors.sidebar,
            borderColor: `${colors.text}15`
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className="w-12 h-2 rounded"
              style={{ backgroundColor: colors.text, opacity: 0.8 }}
            />
          </div>
          
          {/* Nav items */}
          <div 
            className="w-full h-5 rounded flex items-center px-2"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <div 
              className="w-3/4 h-1.5 rounded"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
          <div 
            className="w-3/4 h-1.5 rounded ml-2"
            style={{ backgroundColor: colors.textMuted, opacity: 0.5 }}
          />
          <div 
            className="w-2/3 h-1.5 rounded ml-2"
            style={{ backgroundColor: colors.textMuted, opacity: 0.5 }}
          />
          
          {/* Section label */}
          <div 
            className="w-1/2 h-1 rounded mt-2"
            style={{ backgroundColor: colors.textMuted, opacity: 0.3 }}
          />
          <div 
            className="w-3/4 h-1.5 rounded ml-2"
            style={{ backgroundColor: colors.textMuted, opacity: 0.5 }}
          />
        </div>
        
        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div 
            className="h-8 flex items-center justify-between px-3 border-b"
            style={{ 
              backgroundColor: colors.header,
              borderColor: `${colors.text}15`
            }}
          >
            <div 
              className="w-16 h-2 rounded"
              style={{ backgroundColor: colors.text, opacity: 0.7 }}
            />
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
          
          {/* Content */}
          <div 
            className="flex-1 p-3"
            style={{ backgroundColor: colors.main }}
          >
            {/* Title */}
            <div 
              className="w-24 h-3 rounded mb-1"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className="w-32 h-1.5 rounded mb-4"
              style={{ backgroundColor: colors.textMuted, opacity: 0.5 }}
            />
            
            {/* Cards */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="flex-1 h-16 rounded-md p-2 border-l-2"
                  style={{ 
                    backgroundColor: colors.card,
                    borderLeftColor: i === 0 ? "#f59e0b" : i === 1 ? "#06b6d4" : "#10b981",
                    borderColor: `${colors.text}10`
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded mb-1"
                    style={{ 
                      backgroundColor: i === 0 ? "#f59e0b20" : i === 1 ? "#06b6d420" : "#10b98120"
                    }}
                  />
                  <div 
                    className="w-3/4 h-1.5 rounded mb-1"
                    style={{ backgroundColor: colors.text, opacity: 0.7 }}
                  />
                  <div 
                    className="w-full h-1 rounded"
                    style={{ backgroundColor: colors.textMuted, opacity: 0.4 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

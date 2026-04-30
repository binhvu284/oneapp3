import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  delay?: number;
}

export const NavigationCard = forwardRef<HTMLButtonElement, NavigationCardProps>(
  function NavigationCard({ title, description, icon: Icon, href, delay = 0 }, ref) {
    const navigate = useNavigate();

    return (
      <button
        ref={ref}
        onClick={() => navigate(href)}
        className="group relative w-full p-5 sm:p-8 text-left bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 active:scale-[0.98] hover:bg-white/[0.06] hover:border-cyan-500/30 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,240,255,0.1)] animate-card-reveal"
        style={{
          animationDelay: `${delay}ms`,
          animationFillMode: "backwards",
        }}
      >
        {/* Icon */}
        <div className="mb-4 sm:mb-6 text-cyan-400 transition-transform duration-300 group-hover:scale-110">
          <Icon size={32} strokeWidth={1.5} className="sm:hidden" />
          <Icon size={40} strokeWidth={1.5} className="hidden sm:block" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1.5 sm:mb-2 tracking-wide">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          {description}
        </p>

        {/* Hover arrow — desktop only */}
        <div className="hidden sm:block absolute bottom-8 right-8 opacity-0 translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Mobile tap indicator */}
        <div className="sm:hidden absolute bottom-5 right-5 text-cyan-400/40 group-active:text-cyan-400 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <style>{`
          @keyframes card-reveal {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-card-reveal {
            animation: card-reveal 0.6s ease-out forwards;
          }
        `}</style>
      </button>
    );
  }
);

import { Link } from "react-router-dom";
import oneappLogo from "@/assets/oneapp-logo.png";

const links = {
  product: [
    { label: "Explore", href: "/explore" },
    { label: "Ecosystem", href: "/ecosystem" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Journey", href: "/journey" },
    { label: "Forum", href: "/forum" },
  ],
  account: [
    { label: "Sign Up", href: "/auth/signup" },
    { label: "Log In", href: "/auth/login" },
  ],
};

export function SimpleFooter() {
  return (
    <footer className="relative border-t border-indigo-500/10 pt-12 pb-8 px-6 overflow-hidden">
      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/explore" className="flex items-center gap-2 mb-3 group">
              <img src={oneappLogo} alt="OneApp" className="w-7 h-7 opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="font-bold text-white/90 tracking-wide">OneApp</span>
            </Link>
            <p className="text-white/35 text-xs leading-relaxed mb-4 max-w-[180px]">
              The Founder's OS. Notes, AI, crypto, and workspace — all connected.
            </p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase text-indigo-400/70 border border-indigo-500/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              v3.0
            </span>
          </div>

          {/* Product links */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-4">Product</p>
            <ul className="space-y-2.5">
              {links.product.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-4">Resources</p>
            <ul className="space-y-2.5">
              {links.resources.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-4">Account</p>
            <ul className="space-y-2.5">
              {links.account.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} OneApp. All rights reserved.
          </p>
          <p className="text-xs text-white/15">
            Built with OneApp 3.0
          </p>
        </div>
      </div>
    </footer>
  );
}

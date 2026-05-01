import { Outlet, useLocation } from "react-router-dom";
import { SharedHeader } from "@/components/explore/SharedHeader";
import { SimpleFooter } from "@/components/explore/SimpleFooter";

/**
 * Shared chrome for public website pages: floating header on every page so the
 * navigation feels consistent, simple footer underneath. The Explore page opts
 * out and renders its own preloader/footer for the cinematic landing.
 */
export function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/explore" || location.pathname === "/home";

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative flex flex-col">
      <SharedHeader variant="floating" visible={true} />
      <main className={`flex-1 ${isHome ? "" : "pt-28 sm:pt-32"}`}>
        <Outlet />
      </main>
      {!isHome && <SimpleFooter />}
    </div>
  );
}

import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SharedHeader } from "@/components/explore/SharedHeader";
import { SimpleFooter } from "@/components/explore/SimpleFooter";

export function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/explore" || location.pathname === "/home";

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050814] text-white overflow-x-hidden relative flex flex-col">
      <SharedHeader variant="floating" visible={true} />
      <main className={`flex-1 ${isHome ? "" : "pt-28 sm:pt-32"}`}>
        <Outlet />
      </main>
      {!isHome && <SimpleFooter />}
    </div>
  );
}

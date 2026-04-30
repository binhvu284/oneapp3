export function SimpleFooter() {
  return (
    <footer className="border-t border-white/10 py-6 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-sm text-gray-500 font-medium tracking-wide">
          OneApp v2.0
        </span>
        <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
          Access Restricted.
        </span>
      </div>
    </footer>
  );
}

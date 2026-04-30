export function GradientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cyan blob - top right */}
      <div
        className="absolute rounded-full blur-[80px] sm:blur-[120px] opacity-20 animate-blob-1"
        style={{
          background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)",
          width: "clamp(260px, 60vw, 600px)",
          height: "clamp(260px, 60vw, 600px)",
          top: "-10%",
          right: "-10%",
        }}
      />

      {/* Purple blob - bottom left */}
      <div
        className="absolute rounded-full blur-[60px] sm:blur-[100px] opacity-15 animate-blob-2"
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          width: "clamp(200px, 55vw, 500px)",
          height: "clamp(200px, 55vw, 500px)",
          bottom: "10%",
          left: "-5%",
        }}
      />

      {/* Small accent blob */}
      <div
        className="absolute rounded-full blur-[50px] sm:blur-[80px] opacity-10 animate-blob-3"
        style={{
          background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)",
          width: "clamp(140px, 35vw, 300px)",
          height: "clamp(140px, 35vw, 300px)",
          top: "40%",
          left: "30%",
        }}
      />

      <style>{`
        @keyframes blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%       { transform: translate(30px, -20px) scale(1.05); }
          50%       { transform: translate(-20px, 20px) scale(0.95); }
          75%       { transform: translate(10px, 10px) scale(1.02); }
        }
        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-30px, 20px) scale(1.03); }
          66%      { transform: translate(20px, -10px) scale(0.97); }
        }
        @keyframes blob-float-3 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(40px, -30px); }
        }
        .animate-blob-1 { animation: blob-float-1 20s ease-in-out infinite; }
        .animate-blob-2 { animation: blob-float-2 25s ease-in-out infinite; }
        .animate-blob-3 { animation: blob-float-3 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

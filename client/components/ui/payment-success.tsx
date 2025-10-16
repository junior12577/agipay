import { useEffect } from "react";

export function PaymentSuccess({ onEnd }: { onEnd?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onEnd?.(), 1400);
    return () => clearTimeout(t);
  }, [onEnd]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <style>{`
        @keyframes riseUp { 
          0% { transform: translateY(24px); opacity: 0 }
          60% { opacity: 1 }
          100% { transform: translateY(0); opacity: 1 }
        }
      `}</style>
      <div className="absolute left-1/2 bottom-10 -translate-x-1/2" style={{ animation: "riseUp 450ms cubic-bezier(.2,.8,.2,1)" }}>
        <div className="pointer-events-auto bg-white text-black rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 min-w-[260px] justify-center">
          <svg width="44" height="44" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r="54" fill="#16a34a20" stroke="#22c55e" strokeWidth="6" />
            <path d="M36 63 L54 78 L84 44" fill="none" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="font-vilane text-lg">Pagamento concluído</span>
            <span className="text-sm text-black/70">Foi concluído o pagamento.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { AgipayLogo } from "./agipay-logo";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", path: "/home" },
  { name: "Pagamento", path: "/pagamento" },
  { name: "Conta", path: "/conta" },
  { name: "Sair", path: "/sair" },
];

export function Navigation() {
  const location = useLocation();
  const isAuth = location.pathname === "/" || location.pathname === "/Cadastro" || location.pathname=== "/Tipo_conta" ||  location.pathname=== "/Cadastro-legal"  ;

  return (
    <header className="w-full bg-agipay-blue px-4 py-4 md:px-8 lg:px-12">
      <div className="flex items-center justify-between max-w-[1280px] mx-auto">
        {/* Logo */}
        <div className="flex-shrink-0">
          <AgipayLogo className="w-[180px] h-[50px] md:w-[220px] md:h-[60px] lg:w-[243px] lg:h-[67px]" />
        </div>

        {/* Navigation */}
        {!isAuth && (
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "font-vilane text-2xl lg:text-[32px] font-normal transition-colors",
                    isActive
                      ? "text-agipay-dark-blue"
                      : "text-white hover:text-agipay-dark-blue/80"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

      </div>

      {/* Bottom Tab Bar (Mobile) */}
      {!isAuth && (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-white/20 bg-agipay-blue/90 backdrop-blur z-50">
          <div className="grid grid-cols-4 max-w-[1280px] mx-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 text-xs",
                    isActive ? "text-agipay-dark-blue" : "text-white"
                  )}
                >
                  <span className="block" aria-hidden>
                    {/* Simple icons using SVGs to avoid extra deps */}
                    {item.name === "Home" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg>
                    )}
                    {item.name === "Pagamento" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                    )}
                    {item.name === "Conta" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                    {item.name === "Sair" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
                    )}
                  </span>
                  <span className="mt-1 font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

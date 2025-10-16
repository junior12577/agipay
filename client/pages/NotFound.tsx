import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-vilane font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/80 mb-4 font-vilane">Página não encontrada</p>
        <a href="/" className="text-white hover:text-white/80 underline font-vilane">
          Voltar ao Início
        </a>
      </div>
    </main>
  );
};

export default NotFound;

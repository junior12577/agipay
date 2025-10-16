import { useState, useEffect, useMemo } from "react";
// ..import { useState, useEffect, useMemo } from "react";
import { useIndividualUser, useLegalEntityUser } from "@/context/user";

// --- Tipagem do DTO do backend ---
export interface Transaction {
  id: string;
  amount: number | string; // Pode vir número ou string
  date: string; // ISO string
  status: string;
  paymentType: string;
  userEmail: string;
  description: string;
}

export default function Extrato() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Usuário logado ---
  const { user: IndividualUser } = useIndividualUser();
  const { user: LegalEntityUser } = useLegalEntityUser();
  const currentUser = IndividualUser || LegalEntityUser;
  const balance = currentUser?.balance ?? 0;
  const userEmail = currentUser?.email;

  // --- Fetch das transações ---
  useEffect(() => {
    if (!userEmail) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://payment-platform-production-57a2.up.railway.app/${encodeURIComponent(userEmail)}`
        );

        const responseText = await response.text();

        if (!response.ok) {
          let errorMsg = `Erro ao buscar extrato: ${response.statusText}`;
          try {
            const errorJson = JSON.parse(responseText);
            errorMsg = errorJson.message || errorMsg;
          } catch {
            if (responseText) errorMsg += ` - ${responseText}`;
          }
          throw new Error(errorMsg);
        }

        let parsed: any;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          parsed = [];
        }
        const arr = Array.isArray(parsed) ? parsed : [parsed];

        const data: Transaction[] = arr.map((t: any) => ({
          id: String(t.id),
          amount: t.amount, // mantém o valor original (positivo ou negativo)
          date: new Date(t.date).toISOString(),
          status: t.status ?? "",
          paymentType: t.paymentType ?? t.description ?? "Transação",
          userEmail: t.userEmail ?? currentUser?.email ?? "",
          description: t.description ?? "Sem descrição",
        }));

        setTransactions(data);
      } catch (e) {
        console.error("Erro na API:", e);
        setError("Não foi possível carregar o extrato.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [userEmail]);

  // --- Agrupamento por data ---
  const grouped = useMemo(() => {
    const byDate: Record<string, Transaction[]> = {};
    for (const t of transactions) {
      if (!t.date) continue;
      const key = new Date(t.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      byDate[key] = byDate[key] || [];
      byDate[key].push(t);
    }
    return byDate;
  }, [transactions]);

  // --- Helper para formatar moeda ---
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- Render ---
  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="pt-8 md:pt-12 lg:pt-16">
          <h1 className="font-vilane text-3xl md:text-4xl text-white mb-6">Extrato</h1>

          {/* Summary Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/80">Saldo atual</p>
              <div className="font-vilane text-2xl mt-1">
                {currencyFormatter.format(Number(balance))}
              </div>
            </div>
            <div className="text-white/80 text-sm">Período: últimas 5 transações</div>
          </div>

          {/* Loading / Error / Transações */}
          <div className="mt-8 space-y-6">
            {error && <p className="text-red-400 text-center">{error}</p>}
            {isLoading && !error && <p className="text-white/80 text-center">Carregando extrato...</p>}

            {!isLoading && !error &&
              Object.entries(grouped).map(([date, items]) => (
                <section key={date} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <h2 className="font-vilane text-white text-lg md:text-xl mb-4">{date}</h2>
                  <ul className="divide-y divide-white/10">
                    {items.map((t) => {
                      // Converte para número, garantindo negativos
                      const amt = parseFloat(String(t.amount)) || 0;
                      // Mantém o colorClass original para o valor (saldo)
                      const colorClass = amt < 0 ? "text-red-300" : "text-green-300";
                      const display = currencyFormatter.format(amt);
                        
                      // Lógica da cor para o Status (para destacar APPROVED/CANCELLED)
                      let statusColor = 'text-white';
                      if (t.status === 'APPROVED') {
                          statusColor = 'text-green-300';
                      } else if (t.status === 'CANCELLED') {
                          statusColor = 'text-red-300';
                      }
                        
                      return (
                        <li key={t.id} className="py-3 flex items-center justify-between text-white">
                          <div className="mr-4">
                                {/* Altera o texto principal para mostrar o STATUS, mantendo as classes de estilo originais (font-vilane, text-base, etc.) e aplicando a cor condicional. */}
                            <p className={`font-vilane text-base md:text-lg ${statusColor}`}>
                                {t.status}
                            </p>
                            
                            {/* Move o t.paymentType (que era o título) para a linha de detalhe */}
                            <p className="text-xs text-white/60">
                                {t.paymentType} &nbsp; {/* Tipo de transação */}
                              {new Date(t.date).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className={colorClass}>{display}</div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

            {!isLoading && !error && transactions.length === 0 && (
              <p className="text-white/80 text-center">Nenhuma transação encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
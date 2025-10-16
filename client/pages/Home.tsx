import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useIndividualUser, useLegalEntityUser } from "@/context/user";
import { useTransactions } from "@/context/transactions";

export default function Home() {
  const { user: individualUser, updateUser: updateIndividualUser } = useIndividualUser();
  const { user: legalEntityUser, updateUser: updateLegalEntityUser } = useLegalEntityUser();
  const { transactions, addTransaction } = useTransactions();
  const [showBalance, setShowBalance] = useState(true);

  // Dialog states
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [amount, setAmount] = useState("");

  // Determine logged-in user
  const currentUser = individualUser || legalEntityUser;

  // API base URL
  const API_BASE_URL = "https://payment-platform-production-57a2.up.railway.app";

  // User name
  let userName = "";
  if (individualUser) {
    userName = individualUser.fullname;
  } else if (legalEntityUser) {
    userName = legalEntityUser.legalName;
  }

  // Account type
  const accountType = individualUser
    ? "Conta Pessoa Física"
    : legalEntityUser
    ? "Conta Pessoa Jurídica"
    : "";

  // Document
  const documentLabel = individualUser ? "CPF" : legalEntityUser ? "CNPJ" : "";
  const documentValue = individualUser
    ? individualUser.document
    : legalEntityUser
    ? legalEntityUser.document
    : "";

  // Balance
  const displayBalance = currentUser?.balance ?? 0;

  // ---------------------------------------------------------------------
  // 🔄 ATUALIZAR SALDO AUTOMATICAMENTE QUANDO AS TRANSAÇÕES MUDAM
  // ---------------------------------------------------------------------
  useEffect(() => {
    const fetchUpdatedBalance = async () => {
      if (!currentUser?.email) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/balance?email=${currentUser.email}`
        );

        if (!response.ok) throw new Error("Erro ao buscar saldo atualizado");

        const data = await response.json();

        // Atualiza o saldo no contexto de usuário
        if (individualUser) {
          updateIndividualUser({ balance: data.balance });
        } else if (legalEntityUser) {
          updateLegalEntityUser({ balance: data.balance });
        }
      } catch (error) {
        console.error("Erro ao atualizar saldo:", error);
      }
    };

    // Atualiza sempre que o histórico de transações mudar
    fetchUpdatedBalance();
  }, [transactions]);

  // ---------------------------------------------------------------------
  // DEPÓSITO
  // ---------------------------------------------------------------------
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Informe um valor válido para depósito");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/deposito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser?.email,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) throw new Error("Erro ao realizar depósito");

      const data = await response.json();

      // Atualiza o saldo local rapidamente
      const newBalance = displayBalance + parseFloat(amount);
      if (individualUser) {
        updateIndividualUser({ balance: newBalance });
      } else if (legalEntityUser) {
        updateLegalEntityUser({ balance: newBalance });
      }

      // Adiciona transação ao histórico
      addTransaction({ ...data, amount: parseFloat(amount) });

      setAmount("");
      setOpenDeposit(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar depósito. Tente novamente.");
    }
  };

  // ---------------------------------------------------------------------
  // SAQUE
  // ---------------------------------------------------------------------
  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Informe um valor válido para saque");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/saque`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser?.email,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) throw new Error("Erro ao realizar saque");

      const data = await response.json();

      // Atualiza o saldo local rapidamente
      const newBalance = displayBalance - parseFloat(amount);
      if (individualUser) {
        updateIndividualUser({ balance: newBalance });
      } else if (legalEntityUser) {
        updateLegalEntityUser({ balance: newBalance });
      }

      // Adiciona transação no histórico
      addTransaction({ ...data, amount: -parseFloat(amount) });

      setAmount("");
      setOpenWithdraw(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar saque. Tente novamente.");
    }
  };

  // ---------------------------------------------------------------------
  // INTERFACE
  // ---------------------------------------------------------------------
  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-16 md:pt-24 lg:pt-32">
          <div>
            <h1 className="font-vilane text-3xl md:text-4xl lg:text-[40px] font-normal text-white leading-tight">
              {userName}
            </h1>
            {documentValue && (
              <p className="text-white/60">
                {documentLabel}: {documentValue}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <div className="text-2xl font-vilane text-white">
                {showBalance
                  ? displayBalance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ ••••••"}
              </div>
              <button
                aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
                onClick={() => setShowBalance((v) => !v)}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                {showBalance ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            <p className="text-sm text-white/80 mt-1">{accountType}</p>

            {/* Botões */}
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => setOpenDeposit(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Depositar
              </Button>
              <Button
                onClick={() => setOpenWithdraw(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Sacar
              </Button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-16 md:mt-24 lg:mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h3 className="font-vilane text-xl mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Link
                  to="/extrato"
                  className="block w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Ver extrato
                </Link>
                <Link
                  to="/pagamento"
                  className="block w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Transferir dinheiro
                </Link>
                <Link
                  to="/pagamento"
                  className="block w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Pagar conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Depósito */}
      <Dialog open={openDeposit} onOpenChange={setOpenDeposit}>
        <DialogContent className="bg-white/10 backdrop-blur-sm text-white border border-white/20">
          <DialogHeader>
            <DialogTitle>Depositar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="deposit" className="text-sm">
              Valor do depósito
            </label>
            <Input
              id="deposit"
              type="number"
              placeholder="Ex: 100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDeposit} className="bg-green-500 hover:bg-green-600">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Saque */}
      <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
        <DialogContent className="bg-white/10 backdrop-blur-sm text-white border border-white/20">
          <DialogHeader>
            <DialogTitle>Sacar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="withdraw" className="text-sm">
              Valor do saque
            </label>
            <Input
              id="withdraw"
              type="number"
              placeholder="Ex: 50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleWithdraw} className="bg-red-500 hover:bg-red-600">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

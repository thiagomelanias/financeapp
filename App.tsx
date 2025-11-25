import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

type EntryType = "income" | "expense";

interface FinanceEntry {
  id: string;
  description: string;
  amount: number;
  type: EntryType;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = "financeapp_entries_v1";

const App: React.FC = () => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<EntryType>("expense");
  const [category, setCategory] = useState("Alimentação");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Load saved data on first render (web localStorage)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setEntries(
          parsed
            .filter((e) => typeof e.amount === "number" && !!e.description)
            .map((e) => ({
              ...e,
              createdAt: e.createdAt || new Date().toISOString(),
            }))
        );
      }
    } catch (error) {
      console.warn("Erro ao carregar dados locais:", error);
    }
  }, []);

  // Persist data whenever entries change
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn("Erro ao salvar dados locais:", error);
    }
  }, [entries]);

  const handleAmountChange = (raw: string) => {
    setErrorMessage(null); // limpando erro ao digitar
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setAmount("");
      return;
    }
    const numeric = parseInt(digits, 10) / 100;
    const formatted = numeric.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setAmount(formatted);
  };

  const handleSave = () => {
    const desc = description.trim();
    const rawAmount = (amount || "").trim();

    // Validações com mensagens claras
    if (!desc) {
      setErrorMessage("Descrição obrigatória");
      return;
    }

    if (!rawAmount) {
      setErrorMessage("Informe um valor");
      return;
    }

    const value = Number(rawAmount.replace(/\./g, "").replace(",", "."));

    if (isNaN(value) || value <= 0) {
      setErrorMessage("Informe um valor maior que zero");
      return;
    }

    // dados válidos
    setErrorMessage(null);

    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId
            ? {
                ...entry,
                description: desc,
                amount: value,
                type,
                category:
                  category.trim() ||
                  (type === "income" ? "Receita" : "Despesa"),
              }
            : entry
        )
      );
    } else {
      const entry: FinanceEntry = {
        id: String(Date.now()),
        description: desc,
        amount: value,
        type,
        category:
          category.trim() || (type === "income" ? "Receita" : "Despesa"),
        createdAt: new Date().toISOString(),
      };

      setEntries((prev) => [entry, ...prev]);
    }

    // limpa formulário
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Alimentação");
    setEditingId(null);
  };

  const handleDeleteEntry = (id: string) => {
    try {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm(
          "Deseja realmente excluir este lançamento?"
        );
        if (!confirmed) {
          return;
        }
      }
    } catch (error) {
      // Em ambientes sem window (por exemplo, durante build), apenas segue sem confirmação
    }
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleEditStart = (entry: FinanceEntry) => {
    setErrorMessage(null);
    setDescription(entry.description);
    setCategory(entry.category);
    setType(entry.type);
    // valor em reais com vírgula, mantendo separador de milhar
    const formatted = entry.amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setAmount(formatted);
    setEditingId(entry.id);
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  const isSameMonth = (date: Date, ref: Date) =>
    date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear();

  const filteredEntries = entries.filter((entry) =>
    isSameMonth(new Date(entry.createdAt), currentMonth)
  );

  const incomes = filteredEntries.filter((e) => e.type === "income");
  const expenses = filteredEntries.filter((e) => e.type === "expense");

  const totalIncome = incomes.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const currentMonthLabel = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const averageExpense =
    expenses.length === 0 ? 0 : totalExpense / expenses.length;

  const now = new Date();
  const showingCurrentMonth = isSameMonth(currentMonth, now);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>FinanceApp</Text>
            <Text style={styles.appSubtitle}>
              Visão clara das suas finanças mensais.
            </Text>
          </View>
          <View style={styles.monthBadge}>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={() => changeMonth(-1)}
            >
              <Text style={styles.monthNavButtonText}>{"‹"}</Text>
            </TouchableOpacity>
            <View style={styles.monthInfo}>
              <Text style={styles.monthBadgeLabel}>
                {showingCurrentMonth ? "Mês atual" : "Competência"}
              </Text>
              <Text style={styles.monthBadgeText}>{currentMonthLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={() => changeMonth(1)}
            >
              <Text style={styles.monthNavButtonText}>{"›"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Consolidated balance card */}
          <View style={styles.cardLarge}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Saldo consolidado</Text>
              <Text
                style={[
                  styles.balanceValue,
                  balance >= 0 ? styles.balancePositive : styles.balanceNegative,
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.subCard}>
                <View style={styles.dotRow}>
                  <View style={[styles.statusDot, styles.incomeDot]} />
                  <Text style={styles.subCardTitle}>Receitas</Text>
                </View>
                <Text style={[styles.subCardValue, styles.incomeText]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>

              <View style={styles.subCard}>
                <View style={styles.dotRow}>
                  <View style={[styles.statusDot, styles.expenseDot]} />
                  <Text style={styles.subCardTitle}>Despesas</Text>
                </View>
                <Text style={[styles.subCardValue, styles.expenseText]}>
                  {formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Entrada líquida</Text>
                <Text
                  style={[
                    styles.infoValue,
                    balance >= 0 ? styles.incomeText : styles.expenseText,
                  ]}
                >
                  {formatCurrency(balance)}
                </Text>
                <Text style={styles.infoHint}>
                  Resultado do mês selecionado
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Gasto médio / despesa</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(averageExpense)}
                </Text>
                <Text style={styles.infoHint}>
                  Média por lançamento de despesa.
                </Text>
              </View>
            </View>
          </View>

          {/* New entry */}
          <View style={styles.cardLarge}>
            <Text style={styles.sectionTitle}>Novo lançamento</Text>
            <Text style={styles.sectionSubtitle}>
              Registre rapidamente suas despesas e receitas do dia.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={styles.input}
                placeholder="Descrição (ex: Uber, mercado, plantão)"
                placeholderTextColor="#6b7280"
                value={description}
                onChangeText={(text) => {
                  setErrorMessage(null);
                  setDescription(text);
                }}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.rowHalf]}>
                <Text style={styles.inputLabel}>Valor (R$)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  placeholderTextColor="#6b7280"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
              <View style={[styles.fieldGroup, styles.rowHalf]}>
                <Text style={styles.inputLabel}>Categoria</Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    type === "income" ? "Renda fixa, extra..." : "Alimentação..."
                  }
                  placeholderTextColor="#6b7280"
                  value={category}
                  onChangeText={(text) => {
                    setErrorMessage(null);
                    setCategory(text);
                  }}
                />
              </View>
            </View>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  type === "expense" && styles.toggleButtonActiveExpense,
                ]}
                onPress={() => {
                  setErrorMessage(null);
                  setType("expense");
                }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    type === "expense" && styles.toggleButtonTextActive,
                  ]}
                >
                  Despesa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  type === "income" && styles.toggleButtonActiveIncome,
                ]}
                onPress={() => {
                  setErrorMessage(null);
                  setType("income");
                }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    type === "income" && styles.toggleButtonTextActive,
                  ]}
                >
                  Receita
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>
                {editingId ? "Salvar alterações" : "Salvar lançamento"}
              </Text>
            </TouchableOpacity>

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </View>

          {/* Last entries */}
          <View style={styles.cardLarge}>
            <Text style={styles.sectionTitle}>Últimos lançamentos</Text>
            <Text style={styles.sectionSubtitle}>
              Acompanhe onde seu dinheiro está indo.
            </Text>

            {filteredEntries.length === 0 ? (
              <Text style={styles.emptyText}>
                Você ainda não registrou nenhum lançamento neste mês.
              </Text>
            ) : (
              filteredEntries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.entryMain}>
                    <Text style={styles.entryDescription}>
                      {entry.description}
                    </Text>
                    <View style={styles.entryMetaRow}>
                      <Text style={styles.entryCategory}>{entry.category}</Text>
                      <Text style={styles.entryType}>
                        {entry.type === "income" ? "Receita" : "Despesa"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.entryAmountBlock}>
                    <Text
                      style={[
                        styles.entryAmount,
                        entry.type === "income"
                          ? styles.incomeText
                          : styles.expenseText,
                      ]}
                    >
                      {formatCurrency(entry.amount)}
                    </Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                    </Text>
                    <View style={styles.entryActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditStart(entry)}
                      >
                        <Text style={styles.editButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteEntry(entry.id)}
                      >
                        <Text style={styles.deleteButtonText}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#020617",
  },
  scroll: {
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f9fafb",
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#9ca3af",
  },
  monthBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1d4ed8",
    backgroundColor: "#020617",
  },
  monthInfo: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  monthBadgeLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  monthBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
    textTransform: "lowercase",
  },
  monthNavButton: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  monthNavButtonText: {
    fontSize: 14,
    color: "#e5e7eb",
  },
  cardLarge: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  balancePositive: {
    color: "#22c55e",
  },
  balanceNegative: {
    color: "#f97373",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  subCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  incomeDot: {
    backgroundColor: "#22c55e",
  },
  expenseDot: {
    backgroundColor: "#f97373",
  },
  subCardTitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  subCardValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  incomeText: {
    color: "#22c55e",
  },
  expenseText: {
    color: "#f97373",
  },
  infoCard: {
    flex: 1,
    marginTop: 10,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  infoLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  infoValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  infoHint: {
    marginTop: 2,
    fontSize: 11,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },
  fieldGroup: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    color: "#e5e7eb",
    fontSize: 14,
  },
  rowHalf: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  toggleButtonActiveExpense: {
    backgroundColor: "#451a1a",
    borderColor: "#f97373",
  },
  toggleButtonActiveIncome: {
    backgroundColor: "#064e3b",
    borderColor: "#22c55e",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af",
  },
  toggleButtonTextActive: {
    color: "#f9fafb",
  },
  primaryButton: {
    marginTop: 8,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f9fafb",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#f97373",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
  },
  entryRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  entryMain: {
    flex: 1,
  },
  entryDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e5e7eb",
  },
  entryMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  entryCategory: {
    fontSize: 11,
    color: "#9ca3af",
  },
  entryType: {
    fontSize: 11,
    color: "#6b7280",
  },
  entryAmountBlock: {
    alignItems: "flex-end",
  },
  entryAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  entryDate: {
    marginTop: 2,
    fontSize: 11,
    color: "#6b7280",
  },
  entryActions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 6,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  editButtonText: {
    fontSize: 11,
    color: "#bbf7d0",
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  deleteButtonText: {
    fontSize: 11,
    color: "#fecaca",
  },
});

export default App;

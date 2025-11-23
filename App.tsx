import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  createdAt: string;
}

const STORAGE_KEY = "FINANCEAPP_TRANSACTIONS_V1";

export default function App() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  // Load saved transactions on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Transaction[] = JSON.parse(stored);
          setTransactions(parsed);
        }
      } catch (error) {
        console.warn("Erro ao carregar dados salvos", error);
      } finally {
        setIsLoadingStorage(false);
      }
    };

    loadTransactions();
  }, []);

  // Persist transactions whenever they change
  useEffect(() => {
    if (isLoadingStorage) return;

    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.warn("Erro ao salvar dados", error);
      }
    };

    saveTransactions();
  }, [transactions, isLoadingStorage]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const handleAddTransaction = () => {
    const cleaned = amount.replace("R$", "").replace(" ", "").replace(",", ".");
    const numericAmount = parseFloat(cleaned);

    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: numericAmount,
      type,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setDescription("");
    setAmount("");
    setType("expense");
  };

  const handleToggleType = (value: TransactionType) => {
    setType(value);
  };

  const handleClearAll = async () => {
    setTransactions([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Erro ao limpar dados", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>FinanceApp</Text>
          <Text style={styles.appSubtitle}>
            Visão clara das suas finanças mensais.
          </Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, styles.incomeText]}>
                {formatCurrency(totals.income)}
              </Text>
            </View>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, styles.expenseText]}>
                {formatCurrency(totals.expenses)}
              </Text>
            </View>
          </View>

          <View style={styles.summaryFooter}>
            <Text style={styles.summaryLabel}>Saldo do mês</Text>
            <Text
              style={[
                styles.summaryValueBig,
                totals.balance >= 0 ? styles.incomeText : styles.expenseText,
              ]}
            >
              {formatCurrency(totals.balance)}
            </Text>
          </View>
        </View>

        {/* New transaction */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Novo lançamento</Text>
            <Text style={styles.sectionSubtitle}>
              Registre rapidamente suas despesas e receitas do dia.
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: Uber, mercado, plantão)"
              placeholderTextColor="#8A8FA6"
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              style={styles.input}
              placeholder="Valor (R$)"
              placeholderTextColor="#8A8FA6"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.typeToggleButton,
                  type === "expense" && styles.typeToggleButtonActiveExpense,
                ]}
                onPress={() => handleToggleType("expense")}
              >
                <Text
                  style={[
                    styles.typeToggleText,
                    type === "expense" && styles.typeToggleTextActive,
                  ]}
                >
                  Despesa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeToggleButton,
                  type === "income" && styles.typeToggleButtonActiveIncome,
                ]}
                onPress={() => handleToggleType("income")}
              >
                <Text
                  style={[
                    styles.typeToggleText,
                    type === "income" && styles.typeToggleTextActive,
                  ]}
                >
                  Receita
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddTransaction}
            >
              <Text style={styles.saveButtonText}>Salvar lançamento</Text>
            </TouchableOpacity>

            {transactions.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Text style={styles.clearButtonText}>Limpar todos</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Last transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos lançamentos</Text>
            <Text style={styles.sectionSubtitle}>
              Acompanhe onde seu dinheiro está indo.
            </Text>
          </View>

          <View style={styles.card}>
            {transactions.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhum lançamento ainda. Comece adicionando uma despesa ou
                receita.
              </Text>
            ) : (
              transactions.map((t) => (
                <View key={t.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionDescription}>
                      {t.description}
                    </Text>
                    <Text style={styles.transactionMeta}>
                      {t.type === "income" ? "Receita" : "Despesa"} •{" "}
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      t.type === "income"
                        ? styles.incomeText
                        : styles.expenseText,
                    ]}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 1024,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  summaryCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1D2841",
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryColumn: {
    flex: 1,
    paddingRight: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  summaryFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1D2841",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryValueBig: {
    fontSize: 22,
    fontWeight: "700",
  },
  incomeText: {
    color: "#22C55E",
  },
  expenseText: {
    color: "#F97373",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#F9FAFB",
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1D2841",
    padding: 16,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F9FAFB",
    marginBottom: 12,
    fontSize: 14,
  },
  typeToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  } as any,
  typeToggleButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
    backgroundColor: "#020617",
  },
  typeToggleButtonActiveExpense: {
    backgroundColor: "#111827",
    borderColor: "#F97373",
  },
  typeToggleButtonActiveIncome: {
    backgroundColor: "#111827",
    borderColor: "#22C55E",
  },
  typeToggleText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  typeToggleTextActive: {
    color: "#F9FAFB",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  saveButtonText: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    marginTop: 4,
    paddingVertical: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  transactionLeft: {
    flex: 1,
    paddingRight: 12,
  },
  transactionDescription: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "500",
  },
  transactionMeta: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
});

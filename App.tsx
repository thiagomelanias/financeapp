import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string; // yyyy-mm-dd
}

const typeLabels: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getCurrentMonthLabel(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(now);
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    description: "Salário",
    category: "Renda fixa",
    type: "income",
    amount: 8500,
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 2,
    description: "Aluguel",
    category: "Moradia",
    type: "expense",
    amount: 2200,
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 3,
    description: "Supermercado",
    category: "Alimentação",
    type: "expense",
    amount: 680,
    date: new Date().toISOString().slice(0, 10),
  },
];

export default function App() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [type, setType] = useState<TransactionType>("expense");

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    const expenseList = transactions.filter((t) => t.type === "expense");
    const averageExpense =
      expenseList.length > 0
        ? expenseList.reduce((acc, t) => acc + t.amount, 0) /
          expenseList.length
        : 0;

    return { income, expense, balance, averageExpense };
  }, [transactions]);

  function handleAdd() {
    const numeric = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !amount || Number.isNaN(numeric)) {
      return;
    }

    const newItem: Transaction = {
      id: Date.now(),
      description: description.trim(),
      category: category.trim() || "Outros",
      type,
      amount: numeric,
      date: new Date().toISOString().slice(0, 10),
    };

    setTransactions((prev) => [newItem, ...prev]);
    setDescription("");
    setAmount("");
    setCategory("Alimentação");
    setType("expense");
  }

  const monthLabel = getCurrentMonthLabel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>FinanceApp</Text>
              <Text style={styles.appSubtitle}>
                Visão clara das suas finanças mensais.
              </Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Versão Web</Text>
              </View>
              <View style={styles.monthPill}>
                <Text style={styles.monthPillLabel}>Mês atual</Text>
                <Text style={styles.monthPillText}>{monthLabel}</Text>
              </View>
            </View>
          </View>

          {/* HERO SALDO */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroLabel}>Saldo consolidado</Text>
              <Text
                style={[
                  styles.heroValue,
                  summary.balance >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {formatCurrency(summary.balance)}
              </Text>
            </View>
            <View style={styles.heroBottomRow}>
              <View style={styles.heroChip}>
                <View style={styles.heroDot} />
                <Text style={styles.heroChipText}>Receitas</Text>
                <Text style={[styles.heroChipValue, styles.positive]}>
                  {formatCurrency(summary.income)}
                </Text>
              </View>
              <View style={styles.heroChip}>
                <View style={[styles.heroDot, styles.heroDotNegative]} />
                <Text style={styles.heroChipText}>Despesas</Text>
                <Text style={[styles.heroChipValue, styles.negative]}>
                  {formatCurrency(summary.expense)}
                </Text>
              </View>
            </View>
          </View>

          {/* RESUMO RÁPIDO */}
          <View style={styles.quickRow}>
            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>Entrada líquida</Text>
              <Text
                style={[
                  styles.quickValue,
                  summary.balance >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {formatCurrency(summary.balance)}
              </Text>
              <Text style={styles.quickHint}>Resultado do mês</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>Gasto médio / despesa</Text>
              <Text style={styles.quickValue}>
                {formatCurrency(summary.averageExpense)}
              </Text>
              <Text style={styles.quickHint}>
                Média por lançamento de despesa.
              </Text>
            </View>
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Novo lançamento</Text>
            <Text style={styles.sectionSubtitle}>
              Registre rapidamente suas despesas e receitas do dia.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: Uber, mercado, plantão)"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Valor (R$)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              <View style={[styles.rowItem, styles.rowItemRight]}>
                <TextInput
                  style={styles.input}
                  placeholder="Categoria"
                  placeholderTextColor="#9ca3af"
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
            </View>

            <View style={styles.row}>
              <Pressable
                style={[
                  styles.typeButton,
                  type === "expense" && styles.typeButtonActiveExpense,
                ]}
                onPress={() => setType("expense")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === "expense" && styles.typeButtonTextActive,
                  ]}
                >
                  Despesa
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  type === "income" && styles.typeButtonActiveIncome,
                ]}
                onPress={() => setType("income")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === "income" && styles.typeButtonTextActive,
                  ]}
                >
                  Receita
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Salvar lançamento</Text>
            </Pressable>
          </View>

          {/* LISTA DE LANÇAMENTOS */}
          <View style={styles.list}>
            <Text style={styles.sectionTitle}>Últimos lançamentos</Text>
            <Text style={styles.listSubtitle}>
              Acompanhe onde seu dinheiro está indo.
            </Text>

            <FlatList
              data={transactions}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={styles.listTextContainer}>
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {item.category} • {typeLabels[item.type]}
                    </Text>
                  </View>
                  <View style={styles.itemAmountContainer}>
                    <Text
                      style={[
                        styles.itemAmount,
                        item.type === "income"
                          ? styles.positive
                          : styles.negative,
                      ]}
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 16, android: 24 }),
    paddingBottom: 32,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  appSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
    maxWidth: 260,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1d4ed8",
    backgroundColor: "#0b1120",
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#bfdbfe",
    fontWeight: "500",
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  monthPillLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  monthPillText: {
    fontSize: 12,
    color: "#e5e7eb",
    fontWeight: "600",
  },

  // HERO CARD
  heroCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#02081f",
    borderWidth: 1,
    borderColor: "#1e40af",
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 14,
    color: "#bfdbfe",
  },
  heroValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  heroBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroChip: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#4ade80",
    marginBottom: 4,
  },
  heroDotNegative: {
    backgroundColor: "#fb7185",
  },
  heroChipText: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  heroChipValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },

  // QUICK CARDS
  quickRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  quickCard: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  quickLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },
  quickValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  quickHint: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },

  // FORM
  form: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 8 }),
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 8,
    backgroundColor: "#020617",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  rowItem: {
    flex: 1,
  },
  rowItemRight: {
    marginLeft: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    marginRight: 8,
  },
  typeButtonActiveExpense: {
    borderColor: "#fb7185",
    backgroundColor: "#451a1f",
  },
  typeButtonActiveIncome: {
    borderColor: "#38bdf8",
    backgroundColor: "#082f49",
  },
  typeButtonText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  typeButtonTextActive: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  addButton: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },

  // LIST
  list: {
    marginTop: 4,
  },
  listSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#111827",
  },
  listItem: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
  },
  listTextContainer: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: "#e5e7eb",
  },
  itemMeta: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  itemAmountContainer: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemDate: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },

  // COLORS
  positive: {
    color: "#4ade80",
  },
  negative: {
    color: "#fb7185",
  },
});

export {};

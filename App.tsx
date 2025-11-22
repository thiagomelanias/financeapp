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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const seedTransactions: Transaction[] = [
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

const typeLabels: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};

function getCurrentMonthLabel(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(now);
}

export default function App() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(seedTransactions);
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

    const expenseOnly = transactions.filter((t) => t.type === "expense");
    const averageExpense =
      expenseOnly.length > 0
        ? expenseOnly.reduce((acc, t) => acc + t.amount, 0) /
          expenseOnly.length
        : 0;

    return { income, expense, balance, averageExpense };
  }, [transactions]);

  function handleAdd() {
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !amount || Number.isNaN(value)) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      description: description.trim(),
      category: category.trim() || "Outros",
      type,
      amount: value,
      date: new Date().toISOString().slice(0, 10),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
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
                Seu painel de controle financeiro pessoal.
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

          {/* HERO CARD SALDO */}
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
            </Vi


import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO-like string
}

interface Theme {
  background: string;
  card: string;
  cardSoft: string;
  primary: string;
  primarySoft: string;
  primaryText: string;
  text: string;
  textSoft: string;
  border: string;
  danger: string;
  success: string;
  inputBackground: string;
  incomePill: string;
  expensePill: string;
}

const darkTheme: Theme = {
  background: "#020617",
  card: "#020C24",
  cardSoft: "#061426",
  primary: "#2563EB",
  primarySoft: "#1D4ED8",
  primaryText: "#FFFFFF",
  text: "#E5E7EB",
  textSoft: "#9CA3AF",
  border: "#1F2937",
  danger: "#F87171",
  success: "#4ADE80",
  inputBackground: "#020617",
  incomePill: "#0F766E",
  expensePill: "#7F1D1D",
};

const lightTheme: Theme = {
  background: "#F3F4F6",
  card: "#FFFFFF",
  cardSoft: "#F9FAFB",
  primary: "#2563EB",
  primarySoft: "#1D4ED8",
  primaryText: "#FFFFFF",
  text: "#111827",
  textSoft: "#6B7280",
  border: "#E5E7EB",
  danger: "#DC2626",
  success: "#16A34A",
  inputBackground: "#F9FAFB",
  incomePill: "#16A34A",
  expensePill: "#DC2626",
};

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "light" ? lightTheme : darkTheme;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedType, setSelectedType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Salário",
      amount: 8500,
      category: "Renda fixa",
      type: "income",
      date: "2025-11-23",
    },
    {
      id: "2",
      description: "Aluguel",
      amount: 2200,
      category: "Moradia",
      type: "expense",
      date: "2025-11-22",
    },
    {
      id: "3",
      description: "Supermercado",
      amount: 680,
      category: "Alimentação",
      type: "expense",
      date: "2025-11-22",
    },
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const consolidated = totalIncome - totalExpense;

  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const averageExpense =
    expenseTransactions.length === 0
      ? 0
      : expenseTransactions.reduce((sum, t) => sum + t.amount, 0) /
        expenseTransactions.length;

  const currentMonthLabel = "novembro de 2025";

  function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

  function handleAddTransaction() {
    const numericAmount = parseFloat(
      amount.replace(",", ".").replace("R$", "").trim()
    );

    if (!description || isNaN(numericAmount) || numericAmount <= 0) {
      // No alerts to avoid issues on web; could add better validation UI later
      return;
    }

    const newTransaction: Transaction = {
      id: String(Date.now()),
      description: description.trim(),
      amount: numericAmount,
      category: category.trim() || "Outros",
      type: selectedType,
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setDescription("");
    setAmount("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>FinanceApp</Text>
            <Text style={styles.appSubtitle}>
              Visão clara das suas finanças mensais.
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.chipLabel}>Mês atual</Text>
            <Text style={styles.chipValue}>{currentMonthLabel}</Text>
          </View>
        </View>

        {/* Consolidated balance */}
        <View style={styles.cardHighlighted}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Saldo consolidado</Text>
            <Text style={styles.cardHighlightValue}>
              {formatCurrency(consolidated)}
            </Text>
          </View>

          <View style={styles.row}>
            {/* Income */}
            <View style={styles.column}>
              <View style={styles.pillRow}>
                <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                <Text style={styles.pillLabel}>Receitas</Text>
              </View>
              <Text style={styles.valuePositive}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>

            {/* Expense */}
            <View style={styles.column}>
              <View style={styles.pillRow}>
                <View style={[styles.statusDot, { backgroundColor: theme.danger }]} />
                <Text style={styles.pillLabel}>Despesas</Text>
              </View>
              <Text style={styles.valueNegative}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Secondary metrics */}
        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <Text style={styles.cardSmallLabel}>Entrada líquida</Text>
            <Text style={styles.cardSmallValue}>
              {formatCurrency(consolidated)}
            </Text>
            <Text style={styles.cardSmallCaption}>Resultado do mês</Text>
          </View>

          <View style={styles.cardSmall}>
            <Text style={styles.cardSmallLabel}>Gasto médio / despesa</Text>
            <Text style={styles.cardSmallValue}>
              {formatCurrency(averageExpense)}
            </Text>
            <Text style={styles.cardSmallCaption}>
              Média por lançamento de despesa.
            </Text>
          </View>
        </View>

        {/* New transaction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Novo lançamento</Text>
          <Text style={styles.sectionSubtitle}>
            Registre rapidamente suas despesas e receitas do dia.
          </Text>

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Descrição (ex: Uber, mercado, plantão)"
              placeholderTextColor={theme.textSoft}
              style={styles.input}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <TextInput
                placeholder="Valor (R$)"
                placeholderTextColor={theme.textSoft}
                keyboardType="numeric"
                style={[styles.input, styles.inputHalf]}
                value={amount}
                onChangeText={setAmount}
              />
              <TextInput
                placeholder="Categoria"
                placeholderTextColor={theme.textSoft}
                style={[styles.input, styles.inputHalf]}
                value={category}
                onChangeText={setCategory}
              />
            </View>
          </View>

          {/* Toggle income / expense */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setSelectedType("expense")}
              style={[
                styles.toggleButton,
                selectedType === "expense" && styles.toggleButtonActiveExpense,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedType === "expense" && styles.toggleTextActive,
                ]}
              >
                Despesa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedType("income")}
              style={[
                styles.toggleButton,
                selectedType === "income" && styles.toggleButtonActiveIncome,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedType === "income" && styles.toggleTextActive,
                ]}
              >
                Receita
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleAddTransaction}>
            <Text style={styles.primaryButtonText}>Salvar lançamento</Text>
          </TouchableOpacity>
        </View>

        {/* Recent transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos lançamentos</Text>
          <Text style={styles.sectionSubtitle}>
            Acompanhe onde seu dinheiro está indo.
          </Text>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionRow}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionTitle}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionMeta}>
                  {transaction.category} •{" "}
                  {transaction.type === "income" ? "Receita" : "Despesa"}
                </Text>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={
                    transaction.type === "income"
                      ? styles.transactionAmountPositive
                      : styles.transactionAmountNegative
                  }
                >
                  {formatCurrency(transaction.amount)}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 24,
      gap: 24,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
    },
    appSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: theme.textSoft,
    },
    headerRight: {
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardSoft,
    },
    chipLabel: {
      fontSize: 11,
      color: theme.textSoft,
    },
    chipValue: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    cardHighlighted: {
      marginTop: 16,
      borderRadius: 24,
      padding: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.primarySoft,
      gap: 16,
    },
    cardHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardTitle: {
      fontSize: 15,
      color: theme.textSoft,
    },
    cardHighlightValue: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.success,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    column: {
      flex: 1,
    },
    pillRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
    },
    pillLabel: {
      fontSize: 12,
      color: theme.textSoft,
    },
    valuePositive: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.success,
    },
    valueNegative: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.danger,
    },
    cardSmall: {
      flex: 1,
      borderRadius: 20,
      padding: 16,
      backgroundColor: theme.cardSoft,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 16,
      gap: 4,
    },
    cardSmallLabel: {
      fontSize: 13,
      color: theme.textSoft,
    },
    cardSmallValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginTop: 4,
    },
    cardSmallCaption: {
      fontSize: 11,
      color: theme.textSoft,
      marginTop: 2,
    },
    section: {
      marginTop: 20,
      borderRadius: 24,
      padding: 18,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.text,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.textSoft,
      marginTop: 4,
      marginBottom: 12,
    },
    inputGroup: {
      gap: 10,
      marginBottom: 12,
    },
    input: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: theme.text,
      backgroundColor: theme.inputBackground,
      fontSize: 14,
    },
    inputHalf: {
      flex: 1,
    },
    toggleRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 14,
    },
    toggleButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardSoft,
    },
    toggleButtonActiveIncome: {
      backgroundColor: theme.incomePill,
      borderColor: theme.incomePill,
    },
    toggleButtonActiveExpense: {
      backgroundColor: theme.expensePill,
      borderColor: theme.expensePill,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSoft,
    },
    toggleTextActive: {
      color: theme.primaryText,
    },
    primaryButton: {
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.primaryText,
    },
    transactionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    transactionLeft: {
      flex: 1,
      paddingRight: 8,
    },
    transactionRight: {
      alignItems: "flex-end",
      minWidth: 100,
    },
    transactionTitle: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    transactionMeta: {
      fontSize: 11,
      color: theme.textSoft,
      marginTop: 2,
    },
    transactionAmountPositive: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.success,
    },
    transactionAmountNegative: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.danger,
    },
    transactionDate: {
      fontSize: 11,
      color: theme.textSoft,
      marginTop: 2,
    },
  });


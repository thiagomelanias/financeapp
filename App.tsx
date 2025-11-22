import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: number;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const seedTransactions: Transaction[] = [
  {
    id: 1,
    description: 'Salário',
    category: 'Renda fixa',
    type: 'income',
    amount: 8500,
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 2,
    description: 'Aluguel',
    category: 'Moradia',
    type: 'expense',
    amount: 2200,
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 3,
    description: 'Supermercado',
    category: 'Alimentação',
    type: 'expense',
    amount: 680,
    date: new Date().toISOString().slice(0, 10),
  },
];

const typeLabels: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [type, setType] = useState<TransactionType>('expense');

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  function handleAdd() {
    const value = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || !amount || Number.isNaN(value)) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      description: description.trim(),
      category: category.trim() || 'Outros',
      type,
      amount: value,
      date: new Date().toISOString().slice(0, 10),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setDescription('');
    setAmount('');
    setCategory('Alimentação');
    setType('expense');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.container}>
          <Text style={styles.title}>FinanceApp</Text>
          <Text style={styles.subtitle}>
            Controle simples de receitas, despesas e saldo mensal.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Saldo atual</Text>
              <Text
                style={[
                  styles.summaryValue,
                  summary.balance >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {formatCurrency(summary.balance)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, styles.positive]}>
                {formatCurrency(summary.income)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, styles.negative]}>
                {formatCurrency(summary.expense)}
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Novo lançamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: Uber, mercado, plantão)"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.rowItem]}
                placeholder="Valor (R$)"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <TextInput
                style={[styles.input, styles.rowItem]}
                placeholder="Categoria"
                placeholderTextColor="#9ca3af"
                value={category}
                onChangeText={setCategory}
              />
            </View>
            <View style={styles.row}>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.typeButtonActiveExpense,
                ]}
                onPress={() => setType('expense')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'expense' && styles.typeButtonTextActive,
                  ]}
                >
                  Despesa
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'income' && styles.typeButtonActiveIncome,
                ]}
                onPress={() => setType('income')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'income' && styles.typeButtonTextActive,
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

          <View style={styles.list}>
            <Text style={styles.sectionTitle}>Últimos lançamentos</Text>
            <FlatList
              data={transactions}
              keyExtractor={(item) => String(item.id)}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    <Text style={styles.itemMeta}>
                      {item.category} • {typeLabels[item.type]}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.itemAmount,
                      item.type === 'income' ? styles.positive : styles.negative,
                    ]}
                  >
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
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
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    paddingTop: Platform.select({ ios: 16, android: 24 }),
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  } as any,
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#02051b',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  positive: {
    color: '#4ade80',
  },
  negative: {
    color: '#fb7185',
  },
  form: {
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 8 }),
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 8,
    backgroundColor: '#020617',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  } as any,
  rowItem: {
    flex: 1,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  typeButtonActiveExpense: {
    borderColor: '#fb7185',
    backgroundColor: '#451a1f',
  },
  typeButtonActiveIncome: {
    borderColor: '#38bdf8',
    backgroundColor: '#082f49',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  typeButtonTextActive: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  addButton: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#02131f',
  },
  list: {
    flex: 1,
    marginTop: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#111827',
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  itemDescription: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  itemMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
});

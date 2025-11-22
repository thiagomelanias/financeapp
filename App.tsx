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

function getCurrentMonthLabel() {
  const now

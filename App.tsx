
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Alimentação');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [lancamentos, setLancamentos] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await AsyncStorage.getItem('@financeapp');
    if (data) setLancamentos(JSON.parse(data));
  }

  async function salvar() {
    if (!descricao || !valor) return;

    const novo = {
      id: Date.now(),
      descricao,
      valor: parseFloat(valor),
      categoria,
      tipo,
      data: new Date().toISOString().split('T')[0]
    };

    const listaAtual = [...lancamentos, novo];
    setLancamentos(listaAtual);
    await AsyncStorage.setItem('@financeapp', JSON.stringify(listaAtual));

    setDescricao('');
    setValor('');
  }

  const receitas = lancamentos.filter(l => l.tipo === 'receita').reduce((a,b)=>a+b.valor,0);
  const despesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((a,b)=>a+b.valor,0);
  const saldo = receitas - despesas;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>FinanceApp</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Receitas</Text>
        <Text style={styles.valorPositivo}>R$ {receitas.toFixed(2)}</Text>
        <Text style={styles.label}>Despesas</Text>
        <Text style={styles.valorNegativo}>R$ {despesas.toFixed(2)}</Text>
        <Text style={styles.saldo}>Saldo: R$ {saldo.toFixed(2)}</Text>
      </View>

      <Text style={styles.subtitulo}>Novo lançamento</Text>

      <TextInput
        placeholder="Descrição"
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
      />
      <TextInput
        placeholder="Valor"
        style={styles.input}
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <View style={styles.tipoBox}>
        <TouchableOpacity onPress={() => setTipo('despesa')} style={[styles.tipoBtn, tipo==='despesa' && styles.tipoSelecionado]}>
          <Text style={styles.btnTexto}>Despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTipo('receita')} style={[styles.tipoBtn, tipo==='receita' && styles.tipoSelecionado]}>
          <Text style={styles.btnTexto}>Receita</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.salvar} onPress={salvar}>
        <Text style={styles.salvarTexto}>Salvar</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Últimos lançamentos</Text>

      {lancamentos.map(item => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.itemTxt}>{item.descricao} - {item.data}</Text>
          <Text style={item.tipo==='receita' ? styles.itemValorPositivo : styles.itemValorNegativo}>
            R$ {item.valor.toFixed(2)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0c1222', padding: 20, flex: 1 },
  titulo: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#111a33', padding: 20, borderRadius: 12, marginBottom: 20 },
  label: { color: '#ddd', marginTop: 10 },
  valorPositivo: { color: '#31d67b', fontSize: 20, fontWeight: 'bold' },
  valorNegativo: { color: '#ff6b6b', fontSize: 20, fontWeight: 'bold' },
  saldo: { color: 'white', fontSize: 22, marginTop: 10 },
  subtitulo: { color: 'white', fontSize: 20, marginVertical: 15 },
  input: { backgroundColor: '#1a2440', color: 'white', padding: 12, borderRadius: 8, marginBottom: 10 },
  tipoBox: { flexDirection:'row', justifyContent:'space-between', marginBottom: 15 },
  tipoBtn: { flex:1, marginHorizontal:5, backgroundColor:'#1a2440', padding:12, borderRadius:8, alignItems:'center' },
  tipoSelecionado: { backgroundColor:'#0d6efd' },
  btnTexto: { color:'white' },
  salvar: { backgroundColor:'#0d6efd', padding:15, borderRadius:10, alignItems:'center', marginBottom:20 },
  salvarTexto: { color:'white', fontSize:18 },
  item:{ backgroundColor:'#111a33', padding:12, borderRadius:8, flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  itemTxt:{ color:'white' },
  itemValorPositivo:{ color:'#31d67b' },
  itemValorNegativo:{ color:'#ff6b6b' }
});

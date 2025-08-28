import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, StatusBar, FlatList, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [tarefa, setTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      const tarefasSalvas = await AsyncStorage.getItem('tarefas');
      if (tarefasSalvas) {
        setTarefas(JSON.parse(tarefasSalvas));
      }
    } catch (e) {
      alert('Erro ao carregar tarefas');
    }
    setCarregando(false);
  };

  const salvarTarefas = async (novasTarefas) => {
    try {
      await AsyncStorage.setItem('tarefas', JSON.stringify(novasTarefas));
    } catch (e) {
      alert('Erro ao salvar tarefas');
    }
  };

  const salvarTarefa = async () => {
    if (tarefa.trim() === '') {
      alert('Digite uma tarefa primeiro!');
      return;
    }
    
    try {
      const novaTarefa = { 
        id: Date.now().toString(), 
        texto: tarefa.trim(), 
        concluido: false 
      };
      
      const novasTarefas = [...tarefas, novaTarefa];
      
      await AsyncStorage.setItem('tarefas', JSON.stringify(novasTarefas));
      
      setTarefas(novasTarefas);
      setTarefa(''); 
      alert('Tarefa salva com sucesso!');
    } catch (e) {
      alert('Erro ao salvar tarefa');
    }
  };

  const adicionarTarefa = salvarTarefa; 

  const removerTarefa = async (id) => {
    try {
      const novasTarefas = tarefas.filter(t => t.id !== id);
      setTarefas(novasTarefas);
      await salvarTarefas(novasTarefas);
    } catch (e) {
      alert('Erro ao remover tarefa');
    }
  };

  const limparTudo = async () => {
    try {
      setTarefas([]);
      await AsyncStorage.removeItem('tarefas');
    } catch (e) {
      alert('Erro ao limpar tarefas');
    }
  };

  const marcarConcluida = async (id) => {
    try {
      const novasTarefas = tarefas.map(t =>
        t.id === id ? { ...t, concluido: !t.concluido } : t
      );
      setTarefas(novasTarefas);
      await salvarTarefas(novasTarefas);
    } catch (e) {
      alert('Erro ao atualizar tarefa');
    }
  };

  const renderTarefa = ({ item }) => (
    <View style={styles.tarefaItem}>
      <Text style={[styles.tarefaTexto, item.concluido && styles.tarefaTextoConcluida]}>{item.texto}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => marcarConcluida(item.id)} style={styles.concluirBtn}>
          <Text style={{ color: item.concluido ? '#fff' : '#fff', fontWeight: 'bold' }}>{item.concluido ? '✓' : '✓'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removerTarefa(item.id)} style={styles.removerBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
        <View style={styles.card}>
          <Text style={styles.title}>📝 Lista de Tarefas</Text>
          <Text style={styles.subtitle}>Organize suas atividades diárias!</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite uma nova tarefa"
            value={tarefa}
            onChangeText={setTarefa}
            placeholderTextColor="#aaa"
          />
          <View style={styles.buttonContainer}>
            <Button title="Salvar Tarefa" color="#e22e73ff" onPress={salvarTarefa} />
          </View>
          <View style={{ flex: 1, width: '100%', marginTop: 20, maxHeight: 300 }}>
            <FlatList
              data={tarefas}
              keyExtractor={item => item.id}
              renderItem={renderTarefa}
              ListEmptyComponent={
                !carregando && (
                  <Text style={styles.emptyMsg}>Nenhuma tarefa cadastrada. Que tal adicionar uma?</Text>
                )
              }
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            />
          </View>
          {tarefas.length > 0 && (
            <TouchableOpacity style={styles.limparTudoBtn} onPress={limparTudo}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Limpar Tudo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8e6ecff',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 1400,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 600,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  tarefaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#124b88ff',
  },
  tarefaTexto: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  tarefaTextoConcluida: {
    textDecorationLine: 'line-through',
    color: '#888',
  },

  removerBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  emptyMsg: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
    fontStyle: 'italic',
  },
  limparTudoBtn: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});
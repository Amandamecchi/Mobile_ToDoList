import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, StatusBar, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [tarefa, setTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      const todasChaves = await AsyncStorage.getAllKeys();
      const listaTarefas = [];
      
      if (todasChaves.length > 0) {
        const todosValores = await AsyncStorage.multiGet(todasChaves);
        
        todosValores.forEach(([chave, valor]) => {
          if (valor) {
            try {
              const item = JSON.parse(valor);
              if (item && item.texto && item.dataCriacao) {
                listaTarefas.push({
                  id: chave,
                  texto: item.texto,
                  dataCriacao: item.dataCriacao
                });
              }
            } catch (e) {
              // Ignora valores inválidos
            }
          }
        });
      }
      
      listaTarefas.sort((a, b) => a.id.localeCompare(b.id));
      setTarefas(listaTarefas);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const adicionarTarefa = async () => {
    if (tarefa.trim() === '') {
      Alert.alert('Atenção', 'Por favor, digite uma tarefa');
      return;
    }

    try {
      const chaveUnica = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      const novaTarefa = {
        texto: tarefa.trim(),
        dataCriacao: new Date().toLocaleString('pt-BR'),
      };
      
      await AsyncStorage.setItem(chaveUnica, JSON.stringify(novaTarefa));
      setTarefa('');
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível salvar a tarefa');
    }
  };

  const removerTarefa = async (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja remover esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(id);
              carregarTarefas();
            } catch (error) {
              console.error('Erro ao remover tarefa:', error);
              Alert.alert('Erro', 'Não foi possível remover a tarefa');
            }
          }
        }
      ]
    );
  };

  const renderTarefa = ({ item }) => (
    <View style={styles.itemTarefa}>
      <View style={styles.conteudoTarefa}>
        <Text style={styles.textoTarefa}>{item.texto}</Text>
        <Text style={styles.dataTarefa}>{item.dataCriacao}</Text>
      </View>
      <Button title="Remover" color="#ff4444" onPress={() => removerTarefa(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />
      
      <Text style={styles.titulo}>📝 Lista de Tarefas</Text>
      
      <Text style={styles.contador}>
        {tarefas.length > 0 
          ? `Você tem ${tarefas.length} ${tarefas.length === 1 ? 'tarefa' : 'tarefas'}` 
          : 'Nenhuma tarefa adicionada ainda'}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite uma nova tarefa..."
        value={tarefa}
        onChangeText={setTarefa}
        onSubmitEditing={adicionarTarefa}
      />
      
      <Button title="Adicionar Tarefa" onPress={adicionarTarefa} color="#4CAF50" />
      
      {tarefas.length === 0 ? (
        <View style={styles.containerVazio}>
          <Text style={styles.textoVazio}>✨ Nenhuma tarefa ainda!</Text>
          <Text style={styles.subtextoVazio}>Adicione uma tarefa para começar</Text>
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          renderItem={renderTarefa}
          style={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  contador: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  lista: {
    marginTop: 20,
    flex: 1,
  },
  itemTarefa: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  conteudoTarefa: {
    flex: 1,
  },
  textoTarefa: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  dataTarefa: {
    fontSize: 12,
    color: '#888',
  },
  containerVazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  textoVazio: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtextoVazio: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header'; // Importando o Header
import FeedWithTopics from '../components/FeedWithTopics'; // Importando o componente unificado de Feed e Topics

const Home = () => {
  const [categoria, setCategoria] = useState('Música'); // Estado para a categoria atual

  const handleCategoriaChange = (newCategoria) => {
    setCategoria(newCategoria); // Atualiza a categoria quando o usuário faz swipe
  };

  return (
    <View style={styles.container}>
      
      <Header /> {/* Cabeçalho */}
      {/* Remover o ScrollView para evitar o conflito de rolagem */}
      <FeedWithTopics onCategoriaChange={handleCategoriaChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda a tela
    backgroundColor: '#E8F9CA', // Cor de fundo geral
  },
});

export default Home;

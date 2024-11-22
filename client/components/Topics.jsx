import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';

const Topics = () => {

  const categories = [
    { id: 1, name: 'Música' },
    { id: 2, name: 'Games' },
    { id: 3, name: 'Culinaria' },
    { id: 4, name: 'Engraçados' },
  ];

  const [index, setIndex] = useState(0);

  // Função para avançar na categoria
  const proximaCategoria = () => {
    setIndex((oldIndex) => (oldIndex + 1) % categories.length);
  };

  // PanResponder para capturar gestos de arrastar para baixo em toda a tela
  const response = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Captura o gesto a partir de qualquer toque inicial
      onMoveShouldSetPanResponder: (evt, gestureState) => gestureState.dy > 20, // Detecta arraste para baixo com 20 pixels
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 20) {
          proximaCategoria(); // Se o movimento for para baixo, avança para a próxima categoria
        }
      },
    })
  ).current;

  return (
    <View style={styles.telaCompleta} {...response.panHandlers}>
      <View style={styles.caixaCategoria}>
        <Text style={styles.textoCategoria}>{categories[index].name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  telaCompleta: {
    // Ocupa toda a largura da tela
    height: 100, 
    alignItems: 'center',
  },
  caixaCategoria: {
    marginTop: 30, // Define a margem superior fixa
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CB371',
    width: 150, // Largura fixa
    padding: 40, 
    borderRadius: 10,
  },
  textoCategoria: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default Topics;
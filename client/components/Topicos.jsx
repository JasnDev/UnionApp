import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';

const Topicos = () => {
  const categorias = [
    { id: 1, nome: 'Música' },
    { id: 2, nome: 'Games' },
    { id: 3, nome: 'Culinaria' },
    { id: 4, nome: 'Engraçados' },
  ];

  const [indiceAtual, setIndiceAtual] = useState(0);

  // Função para avançar na categoria
  const proximaCategoria = () => {
    setIndiceAtual((indiceAnterior) => (indiceAnterior + 1) % categorias.length);
  };

  // PanResponder para capturar gestos de arrastar para baixo em toda a tela
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Captura o gesto a partir de qualquer toque inicial
      onMoveShouldSetPanResponder: (evt, estadoGesto) => estadoGesto.dy > 20, // Detecta arraste para baixo com 20 pixels
      onPanResponderRelease: (evt, estadoGesto) => {
        if (estadoGesto.dy > 20) {
          proximaCategoria(); // Se o movimento for para baixo, avança para a próxima categoria
        }
      },
    })
  ).current;

  return (
    <View style={estilos.telaCompleta} {...panResponder.panHandlers}>
      <View style={estilos.caixaCategoria}>
        <Text style={estilos.textoCategoria}>{categorias[indiceAtual].nome}</Text>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  telaCompleta: {
    // Ocupa toda a largura da tela
    height: Dimensions.get('window').height, // Ocupa toda a altura da tela
    alignItems: 'center',
  },
  caixaCategoria: {
    marginTop: 30, // Define a margem superior fixa
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CB371',
    width: 150, // Largura fixa
    padding: 20, 
    borderRadius: 10,
  },
  textoCategoria: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default Topicos;

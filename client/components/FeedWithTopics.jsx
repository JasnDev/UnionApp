import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const BASE_URL = 'http://10.0.0.61:3030/audios';

const CATEGORIES = ['Todos', 'Música', 'Games', 'Culinária', 'Engraçados'];

const SWIPE_CONFIG = {
    velocityThreshold: 0.5,
    directionalOffsetThreshold: 80,
};

const FeedWithTopics = () => {
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [audios, setAudios] = useState([]);
    const [playingIndex, setPlayingIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const isFocused = useIsFocused();

    // soundRef guarda o objeto de áudio atual de forma síncrona.
    // Usar apenas useState aqui causa condição de corrida: se o usuário
    // trocar de faixa rapidamente (swipe), o setState ainda não refletiu
    // o novo valor quando a próxima chamada de AudioPlay dispara, e o
    // som anterior nunca é parado/descarregado (ficava tocando por baixo).
    const soundRef = useRef(null);

    // Guarda os áudios e o índice atual em refs também, para que o efeito
    // de foco (isFocused) sempre veja o valor mais recente sem precisar
    // recriar o efeito a cada mudança de estado.
    const audiosRef = useRef(audios);
    const playingIndexRef = useRef(playingIndex);
    useEffect(() => {
        audiosRef.current = audios;
    }, [audios]);
    useEffect(() => {
        playingIndexRef.current = playingIndex;
    }, [playingIndex]);

    const unloadCurrentSound = useCallback(async () => {
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
            } catch (error) {
                console.warn('Erro ao descarregar áudio anterior:', error);
            }
            soundRef.current = null;
        }
    }, []);

    const AudioPlay = useCallback(async (uri, index) => {
        if (!uri) {
            console.warn('URI de áudio inválida ou vazia.');
            return;
        }

        await unloadCurrentSound();

        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true, isLooping: true }
            );
            soundRef.current = sound;
            setPlayingIndex(index);
            setIsPlaying(true);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setIsPlaying(status.isPlaying);
                }
            });
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error, 'URI:', uri);
        }
    }, [unloadCurrentSound]);

    const AudioPause = useCallback(async () => {
        if (soundRef.current) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        }
    }, []);

    // Busca os áudios sempre que a categoria mudar
    useEffect(() => {
        let cancelled = false;
        const categoria = CATEGORIES[categoryIndex];
        let url = BASE_URL;
        if (categoria !== 'Todos') {
            url += `?topico=${encodeURIComponent(categoria)}`;
        }

        setIsLoading(true);
        setHasError(false);

        axios
            .get(url)
            .then((response) => {
                if (cancelled) return;
                const data = response.data || [];
                setAudios(data);
                setPlayingIndex(0);
                if (data.length > 0) {
                    AudioPlay(data[0].url, 0);
                } else {
                    unloadCurrentSound();
                }
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Erro ao buscar áudios:', error.response || error.message);
                setAudios([]);
                setHasError(true);
                unloadCurrentSound();
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryIndex]);

    // Pausa/retoma o áudio conforme a tela ganha ou perde foco.
    useEffect(() => {
        if (isFocused) {
            const currentAudios = audiosRef.current;
            const currentIndex = playingIndexRef.current;
            if (currentAudios.length > 0) {
                AudioPlay(currentAudios[currentIndex]?.url, currentIndex);
            }
        } else {
            AudioPause();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);

    // Descarrega o áudio ao desmontar o componente
    useEffect(() => {
        return () => {
            unloadCurrentSound();
        };
    }, [unloadCurrentSound]);

    const handlePlayPause = () => {
        if (isPlaying) {
            AudioPause();
        } else {
            AudioPlay(audios[playingIndex]?.url, playingIndex);
        }
    };

    const handleSwipeDown = () => {
        setCategoryIndex((prev) => (prev + 1) % CATEGORIES.length);
    };

    const handleSwipeLeft = () => {
        if (playingIndex < audios.length - 1) {
            AudioPlay(audios[playingIndex + 1]?.url, playingIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        if (playingIndex > 0) {
            AudioPlay(audios[playingIndex - 1]?.url, playingIndex - 1);
        }
     
    };

    return (

      <GestureRecognizer
            onSwipeDown={handleSwipeDown}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            config={SWIPE_CONFIG}
            style={styles.gestureContainer}
            scrollEnabled={false}
        >
  <View style={styles.gridOverlay} pointerEvents="none" />

            <View style={styles.topicsContainer}>
                <View style={styles.topicPill}>
                    <Text style={styles.topicText}>{CATEGORIES[categoryIndex]}</Text>
                </View>
                <Text style={styles.swipeDownHint}>↓ deslize para trocar de tópico</Text>
            </View>

            <View style={styles.audioContainer}>
                {isLoading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#00F0FF" />
                        <Text style={styles.loadingText}>CARREGANDO...</Text>
                    </View>
                ) : hasError ? (
                    <View style={styles.centered}>
                        <Ionicons name="cloud-offline-outline" size={48} color="#3E5468" />
                        <Text style={styles.noAudioMessage}>Não foi possível carregar os áudios</Text>
                    </View>
                ) : audios.length > 0 ? (
                    <View style={styles.titleAndButtonContainer}>
                        <View style={styles.iconRing}>
                            <MaterialIcons name="graphic-eq" size={70} color="#00F0FF" />
                        </View>
                        <Text style={styles.filename} numberOfLines={1}>
                            {audios[playingIndex]?.filename}
                        </Text>
                        <Text style={styles.trackCounter}>
                            {playingIndex + 1} / {audios.length}
                        </Text>

                        <TouchableOpacity
                            onPress={handlePlayPause}
                            style={styles.playPauseButton}
                        >
                            <Ionicons
                                name={isPlaying ? 'pause' : 'play'}
                                size={36}
                                color="#0B0F1A"
                            />
                        </TouchableOpacity>

                        <View style={styles.swipeHints}>
                            <Text style={styles.swipeHintText}>← ANTERIOR</Text>
                            <Text style={styles.swipeHintText}>PRÓXIMO →</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.centered}>
                        <Ionicons name="musical-notes-outline" size={48} color="#3E5468" />
                        <Text style={styles.noAudioMessage}>Nenhum áudio disponível</Text>
                    </View>
                )}
            </View>
        </GestureRecognizer>
    );
};

const NEON = '#00F0FF';
const BG = '#0B0F1A';
const PANEL = '#121826';
const BORDER = '#1E2A3D';

const styles = StyleSheet.create({
    gestureContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: BG,
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderColor: BORDER,
        opacity: 0.5,
    },
    topicsContainer: {
        width: '100%',
        paddingTop: 50,
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PANEL,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    topicPill: {
        borderWidth: 1,
        borderColor: NEON,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 22,
        marginBottom: 8,
    },
    topicText: {
        color: NEON,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    swipeDownHint: {
        color: '#4C5D73',
        fontSize: 11,
        letterSpacing: 0.5,
    },
    audioContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#4C5D73',
        fontSize: 12,
        letterSpacing: 2,
        marginTop: 12,
    },
    titleAndButtonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '85%',
    },
    iconRing: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 1,
        borderColor: NEON,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        backgroundColor: PANEL,
        shadowColor: NEON,
        shadowOpacity: 0.5,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
    },
    filename: {
        color: '#E6F7FA',
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 4,
        maxWidth: '100%',
    },
    trackCounter: {
        color: '#4C5D73',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 26,
    },
    playPauseButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: NEON,
        shadowOpacity: 0.7,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 0 },
    },
    swipeHints: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 34,
    },
    swipeHintText: {
        color: '#33475C',
        fontSize: 10,
        letterSpacing: 1,
    },
    noAudioMessage: {
        color: '#5A6B80',
        fontSize: 15,
        marginTop: 12,
        textAlign: 'center',
    },
});

export default FeedWithTopics;
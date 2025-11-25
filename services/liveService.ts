
import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { LIVE_MODEL_ID } from './geminiService';
import { createPcmBlob, decodeAudioData, PLAYBACK_SAMPLE_RATE } from './audioUtils';
import { Language, VoiceName } from '../types';
import { quoteTools } from './toolDefinitions';

interface UseLiveSessionReturn {
  isConnected: boolean;
  isConnecting: boolean;
  volume: number; // For visualization 0-1
  connect: (voice: VoiceName, language: Language) => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

export const useLiveSession = (onToolCall?: (functionCalls: any[]) => Promise<any[]>): UseLiveSessionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for audio handling to avoid re-renders
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // Animation frame for volume viz
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const disconnect = useCallback(() => {
    // Close session if possible
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
    }
    if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
    }

    inputContextRef.current = null;
    outputContextRef.current = null;
    sessionPromiseRef.current = null;
    
    setIsConnected(false);
    setIsConnecting(false);
    setVolume(0);
  }, []);

  const updateVolume = () => {
      if (analyzerRef.current) {
          const array = new Uint8Array(analyzerRef.current.frequencyBinCount);
          analyzerRef.current.getByteFrequencyData(array);
          const avg = array.reduce((a, b) => a + b, 0) / array.length;
          setVolume(avg / 255);
      }
      animFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const connect = useCallback(async (voiceName: VoiceName, language: Language) => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: PLAYBACK_SAMPLE_RATE });
      
      // Setup Output Node
      const outputNode = outputContextRef.current.createGain();
      outputNode.connect(outputContextRef.current.destination);

      // Setup Input Stream
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Analyzer for Viz
      analyzerRef.current = inputContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      updateVolume();

      const systemInstruction = `You are Elsi, a smart voice assistant for a business owner. 
      You can manage QUOTES (Devis). You have tools to create, list, and delete quotes.
      If the user wants to create a quote, guide them by asking for: Client Name, Items (Description, Price).
      Keep answers concise, professional, but friendly. Speak naturally. 
      ${language === 'fr' ? 'Speak in French.' : 'Speak in English.'}`;

      // Initiate Gemini Live Connection
      sessionPromiseRef.current = ai.live.connect({
        model: LIVE_MODEL_ID,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } }
          },
          tools: [{ functionDeclarations: quoteTools }]
        },
        callbacks: {
          onopen: () => {
            console.log("Elsi Live Session Opened");
            setIsConnected(true);
            setIsConnecting(false);

            if (!inputContextRef.current || !streamRef.current) return;

            // Start Audio Pipeline
            sourceRef.current = inputContextRef.current.createMediaStreamSource(streamRef.current);
            // Connect to analyzer for viz
            sourceRef.current.connect(analyzerRef.current!);
            
            // Processor for sending chunks
            processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                }).catch(err => console.error("Session send error", err));
              }
            };

            sourceRef.current.connect(processorRef.current);
            processorRef.current.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Tool Calls
            if (msg.toolCall && onToolCall) {
                console.log("Live Tool Call received:", msg.toolCall);
                const responses = await onToolCall(msg.toolCall.functionCalls);
                
                // Send response back
                sessionPromiseRef.current?.then(session => {
                    session.sendToolResponse({
                        functionResponses: responses
                    });
                });
                return;
            }

            // Handle Audio
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
               // Handle Audio Playback
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
               
               const audioBuffer = await decodeAudioData(
                   base64ToUint8Array(audioData),
                   outputContextRef.current
               );
               
               const source = outputContextRef.current.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
            }
            
            if (msg.serverContent?.interrupted) {
                nextStartTimeRef.current = outputContextRef.current?.currentTime || 0;
            }
          },
          onclose: () => {
            console.log("Elsi Session Closed");
            disconnect();
          },
          onerror: (err) => {
            console.error("Elsi Session Error", err);
            setError("Connection error. Please try again.");
            disconnect();
          }
        }
      });

    } catch (err: any) {
      console.error("Failed to connect live session", err);
      setError(err.message || "Failed to access microphone or connect.");
      disconnect();
    }
  }, [disconnect, isConnected, isConnecting, onToolCall]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          disconnect();
      }
  }, [disconnect]);

  function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  return { isConnected, isConnecting, volume, connect, disconnect, error };
};

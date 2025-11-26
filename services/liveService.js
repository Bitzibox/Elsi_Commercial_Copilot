import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { LIVE_MODEL_ID } from './geminiService.js';
import { createPcmBlob, decodeAudioData, PLAYBACK_SAMPLE_RATE } from './audioUtils.js';
import { quoteTools } from './toolDefinitions.js';

export const useLiveSession = (onToolCall) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0);

  // Refs for audio handling to avoid re-renders
  const inputContextRef = useRef(null);
  const outputContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const sessionPromiseRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  
  // Animation frame for volume viz
  const analyzerRef = useRef(null);
  const animFrameRef = useRef(0);

  // IMPORTANT: Use a Ref for the tool callback to prevent stale closures.
  const onToolCallRef = useRef(onToolCall);

  useEffect(() => {
    onToolCallRef.current = onToolCall;
  }, [onToolCall]);

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

  const connect = useCallback(async (voiceName, language) => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: PLAYBACK_SAMPLE_RATE });
      
      // Setup Output Node
      const outputNode = outputContextRef.current.createGain();
      outputNode.connect(outputContextRef.current.destination);

      // Setup Input Stream
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Analyzer for Viz
      analyzerRef.current = inputContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      updateVolume();

      // STRONGER System Instruction with Business Persona
      const systemInstruction = `You are Elsi, a smart voice assistant and business consultant for an entrepreneur. 
      
      CAPABILITIES:
      1. **Quotes**: Create, list, delete quotes (Devis).
      2. **Business Info**: You can update the user's company info using 'update_business_info'.
      3. **Advisory**: Provide advice on commercial strategy, sales, and management.

      RULES FOR QUOTES:
      - Ask for Client Name, Items (Description, Qty, Price).
      - Ask for Start Date, Duration, and Payment Terms if relevant.
      - **Wait for details** before calling 'create_quote'.
      
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
            sourceRef.current.connect(analyzerRef.current);
            
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
          onmessage: async (msg) => {
            // Handle Tool Calls via Ref
            if (msg.toolCall && onToolCallRef.current) {
                console.log("Live Tool Call received:", msg.toolCall);
                
                try {
                  const responses = await onToolCallRef.current(msg.toolCall.functionCalls);
                  
                  // Send response back
                  if (sessionPromiseRef.current) {
                    const session = await sessionPromiseRef.current;
                    session.sendToolResponse({
                        functionResponses: responses
                    });
                  }
                } catch (e) {
                  console.error("Error executing tool or sending response", e);
                }
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
            disconnect();
          }
        }
      });

    } catch (err) {
      console.error("Failed to connect live session", err);
      setError(err.message || "Failed to access microphone or connect.");
      disconnect();
    }
  }, [disconnect, isConnected, isConnecting]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          disconnect();
      }
  }, [disconnect]);

  function base64ToUint8Array(base64) {
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
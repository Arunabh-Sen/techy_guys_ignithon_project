import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, RefreshCw, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

export default function AudioRecorder({ onAudioReady, isProcessing }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      let finalTranscript = '';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscribedText(finalTranscript + interimTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        clearInterval(timerRef.current);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };
      
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscribedText('');
      setError('');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUseTranscription = () => {
    if (transcribedText.trim()) {
      onAudioReady(transcribedText.trim());
    }
  };

  const resetRecording = () => {
    setTranscribedText('');
    setRecordingTime(0);
    setError('');
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recording Controls */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          {!isRecording && !transcribedText && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <Button
                onClick={startRecording}
                disabled={isProcessing}
                size="lg"
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
              <p className="text-sm text-slate-600">
                Click to start speech-to-text recording
              </p>
            </motion.div>
          )}

          {isRecording && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mic className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -inset-2 border-2 border-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="text-2xl font-bold text-red-600">
                {formatTime(recordingTime)}
              </div>
              
              <p className="text-sm text-slate-600">
                Listening... Speak clearly into your microphone
              </p>
              
              {transcribedText && (
                <Card className="bg-slate-50 max-w-md mx-auto">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700">{transcribedText}</p>
                  </CardContent>
                </Card>
              )}
              
              <Button
                onClick={stopRecording}
                size="lg"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Square className="w-5 h-5 mr-2 fill-current" />
                Stop Recording
              </Button>
            </motion.div>
          )}

          {transcribedText && !isRecording && (
            <motion.div
              key="transcription"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Mic className="w-10 h-10 text-white" />
              </div>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Transcribed Text:</h4>
                  <p className="text-green-700 text-sm leading-relaxed">{transcribedText}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Recording duration: {formatTime(recordingTime)}
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  disabled={isProcessing}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Record Again
                </Button>
                <Button
                  onClick={handleUseTranscription}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Use This Text
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
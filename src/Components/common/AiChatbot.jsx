
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  User, 
  Mic, 
  Square, 
  Send, 
  Play, 
  Pause as PauseIcon, 
  Loader2, 
  X,
  Volume2
} from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AiChatbot({ documentTitle, documentContent, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm your AI Study Buddy. Ask me anything about "${documentTitle}".`
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleUserInput = async (text) => {
    if (!text.trim() || isProcessing) return;

    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const aiResponse = await InvokeLLM({
        prompt: `You are an AI Study Buddy. A student is asking a question about a document. 
        
        DOCUMENT TITLE: "${documentTitle}"
        
        DOCUMENT CONTENT: 
        """
        ${documentContent}
        """
        
        QUESTION: "${text}"
        
        Please answer the question based *only* on the provided document content. If the answer is not in the document, say so politely. Keep your answers concise and easy to understand.`,
      });
      
      const aiMessage = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
      handleSpeak(aiResponse);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = { sender: 'ai', text: "I'm sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (e) => console.error("Speech recognition error:", e);
    
    recognitionRef.current.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
      handleUserInput(spokenText);
    };
    
    recognitionRef.current.start();
  };

  const handleSpeak = (text) => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utteranceRef.current);
  };
  
  const togglePauseResume = () => {
    if (speechSynthesis.speaking) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      } else {
        speechSynthesis.pause();
      }
    }
  };
  
  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow-2xl">
      <header className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
        <div>
            <h3 className="font-bold text-slate-800">AI Study Buddy</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">Topic: {documentTitle}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.sender === 'ai' ? '' : 'flex-row-reverse'}`}
            >
              <Avatar className="shadow">
                <AvatarFallback className={msg.sender === 'ai' ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-white'}>
                  {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </AvatarFallback>
              </Avatar>
              <div className={`p-3 rounded-lg max-w-sm ${msg.sender === 'ai' ? 'bg-slate-100 text-slate-800' : 'bg-indigo-500 text-white'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                 {msg.sender === 'ai' && index === messages.length - 1 && (
                   <div className="mt-2 flex gap-2">
                     <Button size="sm" variant="ghost" onClick={() => handleSpeak(msg.text)}>
                       <Play className="w-4 h-4" />
                     </Button>
                     <Button size="sm" variant="ghost" onClick={togglePauseResume}>
                       <PauseIcon className="w-4 h-4" />
                     </Button>
                   </div>
                 )}
              </div>
            </motion.div>
          ))}
          {isProcessing && (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <Avatar className="shadow">
                <AvatarFallback className='bg-indigo-500 text-white'>
                  <Bot size={20} />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg bg-slate-100">
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <footer className="p-4 border-t bg-slate-50 rounded-b-lg">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUserInput(input)}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleVoiceInput}
            disabled={isProcessing}
            className={isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}
          >
            {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button
            size="icon"
            onClick={() => handleUserInput(input)}
            disabled={!input.trim() || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
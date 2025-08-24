
import React, { useState } from 'react';
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Languages, 
  Volume2, 
  ArrowLeft, 
  Save,
  Loader2,
  Copy,
  CheckCircle2,
  Brain, // New icon for Quiz
  Play, // New icon for Audio Play
  Pause, // New icon for Audio Pause
  Square // New icon for Audio Stop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import QuizDisplay from "./QuizDisplay"; // New component import

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', voices: ['en-US', 'en-GB', 'en-AU'] },
  { code: 'es', name: 'Spanish', voices: ['es-ES', 'es-MX', 'es-AR'] },
  { code: 'fr', name: 'French', voices: ['fr-FR', 'fr-CA'] },
  { code: 'de', name: 'German', voices: ['de-DE', 'de-AT'] },
  { code: 'hi', name: 'Hindi', voices: ['hi-IN'] },
  { code: 'bn', name: 'Bengali', voices: ['bn-IN'] }, // Added back
  { code: 'ta', name: 'Tamil', voices: ['ta-IN'] }, // Added back
  { code: 'te', name: 'Telugu', voices: ['te-IN'] }, // Added back
  { code: 'mr', name: 'Marathi', voices: ['mr-IN'] }, // Added back
  { code: 'gu', name: 'Gujarati', voices: ['gu-IN'] }, // Added back
  { code: 'kn', name: 'Kannada', voices: ['kn-IN'] }, // Added back
  { code: 'ml', name: 'Malayalam', voices: ['ml-IN'] }, // Added back
  { code: 'pa', name: 'Punjabi', voices: ['pa-IN'] }, // Added back
  { code: 'or', name: 'Odia', voices: ['or-IN'] }, // Added back
  { code: 'zh', name: 'Chinese', voices: ['zh-CN', 'zh-TW'] },
  { code: 'ja', name: 'Japanese', voices: ['ja-JP'] },
  { code: 'ar', name: 'Arabic', voices: ['ar-SA', 'ar-EG'] },
  { code: 'pt', name: 'Portuguese', voices: ['pt-BR', 'pt-PT'] },
  { code: 'ru', name: 'Russian', voices: ['ru-RU'] },
  { code: 'it', name: 'Italian', voices: ['it-IT'] },
  { code: 'ko', name: 'Korean', voices: ['ko-KR'] },
];

export default function TextProcessor({ extractedText, fileName, onSave, onBack }) {
  const [summary, setSummary] = useState('');
  const [translations, setTranslations] = useState({});
  const [quiz, setQuiz] = useState(null); // New state for quiz
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedAudioLanguage, setSelectedAudioLanguage] = useState('en'); // New state for audio language
  const [selectedVoice, setSelectedVoice] = useState('en-US'); // New state for selected voice
  const [isProcessing, setIsProcessing] = useState({ 
    summary: false, 
    translate: false, 
    speak: false, 
    quiz: false // New processing state for quiz
  });
  const [copied, setCopied] = useState('');
  const [isPlaying, setIsPlaying] = useState(false); // New state to track if audio is playing
  const [currentUtterance, setCurrentUtterance] = useState(null); // New state to hold the current SpeechSynthesisUtterance

  const handleSummarize = async () => {
    setIsProcessing(prev => ({ ...prev, summary: true }));
    try {
      const result = await InvokeLLM({
        prompt: `Please provide a concise summary of the following text. Focus on the main points and key information. Keep it brief but comprehensive:\n\n${extractedText}`
      });
      setSummary(result);
    } catch (error) {
      console.error('Summarization error:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, summary: false }));
    }
  };

  const handleTranslate = async () => {
    if (!selectedLanguage) return;
    
    setIsProcessing(prev => ({ ...prev, translate: true }));
    try {
      const languageName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name;
      const result = await InvokeLLM({
        prompt: `Please translate the following text to ${languageName}. Provide only the translation, no additional text:\n\n${extractedText}`
      });
      setTranslations(prev => ({ ...prev, [selectedLanguage]: result }));
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, translate: false }));
    }
  };

  const handleGenerateQuiz = async () => {
    setIsProcessing(prev => ({ ...prev, quiz: true }));
    try {
      const result = await InvokeLLM({
        prompt: `Generate 5 multiple-choice questions from the following text. Each question must have exactly 4 options (A, B, C, D) and indicate the correct answer. Format the response as JSON with the following structure:
        {
          "questions": [
            {
              "question": "Question text here?",
              "options": {
                "A": "Option A text",
                "B": "Option B text", 
                "C": "Option C text",
                "D": "Option D text"
              },
              "correct_answer": "A",
              "explanation": "Brief explanation why this is correct"
            }
          ]
        }
        
        Text to analyze:\n\n${extractedText}`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      A: { type: "string" },
                      B: { type: "string" },
                      C: { type: "string" },
                      D: { type: "string" }
                    },
                    required: ["A", "B", "C", "D"] // Ensure all options are present
                  },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" }
                },
                required: ["question", "options", "correct_answer", "explanation"] // Ensure all question properties are present
              }
            }
          },
          required: ["questions"] // Ensure questions array is present
        }
      });
      // The LLM might return an object with a 'questions' key directly, or just the array.
      // Normalize it to ensure `quiz.questions` is always an array.
      setQuiz(result?.questions ? result : { questions: result });
    } catch (error) {
      console.error('Quiz generation error:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, quiz: false }));
    }
  };

  const handleSpeak = async (text, language = selectedAudioLanguage) => {
    // If an utterance is currently speaking, stop it
    if (currentUtterance) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentUtterance(null);
      // If we were stopping speech, don't start a new one immediately
      if (speechSynthesis.speaking) return; 
    }

    setIsProcessing(prev => ({ ...prev, speak: true }));
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to set voice based on selectedVoice, then selectedAudioLanguage, then generic language
      const voices = speechSynthesis.getVoices();
      let chosenVoice = voices.find(voice => voice.name === selectedVoice); // Match by exact name first
      
      if (!chosenVoice) { // If not found by exact name, try by lang prefix
        chosenVoice = voices.find(voice => voice.lang.startsWith(selectedVoice) || voice.lang.startsWith(language));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      } else {
        // Fallback to setting lang if no specific voice is found
        utterance.lang = language; 
      }

      utterance.rate = 1.0; // Default rate
      utterance.pitch = 1.0; // Default pitch
      
      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
        setIsProcessing(prev => ({ ...prev, speak: false }));
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
        setCurrentUtterance(null);
        setIsProcessing(prev => ({ ...prev, speak: false }));
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech error:', error);
      setIsProcessing(prev => ({ ...prev, speak: false }));
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSave = () => {
    onSave({
      summary,
      translations,
      quiz, // Include quiz in the saved data
      language: 'en' // This seems to be a fixed value, might need dynamic logic if multi-language saving is desired
    });
  };

  // Dynamically get available voices for the selected audio language
  const availableVoices = SUPPORTED_LANGUAGES.find(l => l.code === selectedAudioLanguage)?.voices || ['en-US'];

  // Effect to update selectedVoice when selectedAudioLanguage changes, to ensure a valid default
  React.useEffect(() => {
    if (availableVoices.length > 0 && !availableVoices.includes(selectedVoice)) {
        setSelectedVoice(availableVoices[0]);
    }
  }, [selectedAudioLanguage, availableVoices, selectedVoice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-slate-800">Processing: {fileName}</CardTitle>
              <p className="text-slate-600 mt-1">
                {extractedText.length} characters extracted
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Original Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Original Text
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(extractedText, 'original')}
                className="ml-auto"
              >
                {copied === 'original' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[200px] bg-white/80 border-slate-200 resize-none"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle>AI Processing Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* First Row - Summary and Quiz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleSummarize}
                  disabled={isProcessing.summary}
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isProcessing.summary ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                  <span className="font-medium">
                    {isProcessing.summary ? 'Summarizing...' : 'Summarize'}
                  </span>
                </Button>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isProcessing.quiz}
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                >
                  {isProcessing.quiz ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Brain className="w-6 h-6" />
                  )}
                  <span className="font-medium">
                    {isProcessing.quiz ? 'Generating Quiz...' : 'Generate Quiz'}
                  </span>
                </Button>
              </div>

              {/* Translation Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700">Translation</h3>
                <div className="flex gap-3">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').map((lang) => ( // Exclude English from translation options as it's the source
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleTranslate}
                    disabled={isProcessing.translate || !selectedLanguage}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isProcessing.translate ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Languages className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Enhanced Audio Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700">Text-to-Speech (Original Text)</h3>
                <div className="flex gap-3">
                  <Select value={selectedAudioLanguage} onValueChange={setSelectedAudioLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Filter voices dynamically based on the selected audio language */}
                      {speechSynthesis.getVoices()
                        .filter(voice => voice.lang.startsWith(selectedAudioLanguage))
                        .map(voice => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleSpeak(extractedText)}
                    disabled={isProcessing.speak}
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    {isPlaying && currentUtterance ? (
                      <Square className="w-5 h-5" /> // Stop icon if playing
                    ) : isProcessing.speak ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {/* Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                  Summary
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(summary, selectedAudioLanguage)}
                      className="text-amber-700 hover:text-amber-800"
                    >
                      {isPlaying && currentUtterance?.text === summary ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(summary, 'summary')}
                      className="text-amber-700 hover:text-amber-800"
                    >
                      {copied === 'summary' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-900">{summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quiz Display */}
        {quiz && quiz.questions && quiz.questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuizDisplay 
              quiz={quiz} 
              onSpeak={(text) => handleSpeak(text, selectedAudioLanguage)}
              isPlaying={isPlaying}
              currentUtterance={currentUtterance}
            />
          </motion.div>
        )}

        {/* Translations */}
        {Object.entries(translations).map(([langCode, translation]) => {
          const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
          return (
            <motion.div
              key={langCode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Languages className="w-5 h-5" />
                    Translation ({language?.name})
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(translation, langCode)}
                        className="text-green-700 hover:text-green-800"
                      >
                        {isPlaying && currentUtterance?.text === translation ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(translation, `translation-${langCode}`)}
                        className="text-green-700 hover:text-green-800"
                      >
                        {copied === `translation-${langCode}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900">{translation}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center pt-6"
      >
        <Button
          onClick={handleSave}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Document
        </Button>
      </motion.div>
    </div>
  );
}
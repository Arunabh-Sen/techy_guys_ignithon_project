
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Volume2, 
  Languages, 
  Sparkles, 
  ExternalLink,
  Calendar,
  Type,
  Brain,
  MessageSquare, // New import
  Play,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import QuizDisplay from "../upload/QuizDisplay";
import AiChatbot from "../common/AiChatbot"; // New import

export default function DocumentCard({ document }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // New state

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'audio': return <Volume2 className="w-4 h-4 text-purple-500" />;
      default: return <Type className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800 border-red-200';
      case 'audio': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const translationCount = Object.keys(document.translations || {}).length;
  const hasQuiz = document.quiz && document.quiz.questions && document.quiz.questions.length > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-xl transition-all duration-300 group flex flex-col"> {/* Added flex flex-col */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(document.file_type)}
              <CardTitle className="text-lg font-semibold text-slate-800 truncate">
                {document.title}
              </CardTitle>
            </div>
            {document.file_url && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getTypeBadge(document.file_type)} border`}>
              {document.file_type.toUpperCase()}
            </Badge>
            
            {document.summary && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Summary
              </Badge>
            )}
            
            {translationCount > 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Languages className="w-3 h-3 mr-1" />
                {translationCount} translations
              </Badge>
            )}

            {hasQuiz && (
              <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                <Brain className="w-3 h-3 mr-1" />
                Quiz
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 flex-grow flex flex-col"> {/* Added flex-grow flex flex-col */}
          <p className="text-sm text-slate-600 line-clamp-3 flex-grow"> {/* Added flex-grow */}
            {document.content?.slice(0, 150)}...
          </p>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            {/* AI Study Buddy Button and Dialog */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Ask AI
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 border-0 bg-transparent max-w-2xl">
                <AiChatbot 
                  documentTitle={document.title} 
                  documentContent={document.content}
                  onClose={() => setIsChatOpen(false)} 
                />
              </DialogContent>
            </Dialog>

            {document.content && ( // Re-added the Listen button, as it was removed in the outline's Quick Actions section
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSpeak(document.content)}
                className="flex-1"
              >
                <Play className="w-3 h-3 mr-1" />
                Listen
              </Button>
            )}
            
            {hasQuiz && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuiz(!showQuiz)}
                className="flex-1"
              >
                <Brain className="w-3 h-3 mr-1" />
                Quiz
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-slate-200 pt-4"
              >
                {document.summary && (
                  <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/60">
                    <h4 className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Summary
                    </h4>
                    <p className="text-xs text-amber-700">
                      {document.summary}
                    </p>
                  </div>
                )}

                {/* Translations */}
                {Object.entries(document.translations || {}).map(([lang, translation]) => (
                  <div key={lang} className="p-3 bg-green-50/80 rounded-lg border border-green-200/60">
                    <h4 className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      Translation ({lang.toUpperCase()})
                    </h4>
                    <p className="text-xs text-green-700 line-clamp-3">
                      {translation}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {showQuiz && hasQuiz && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200 pt-4"
              >
                <QuizDisplay 
                  quiz={document.quiz} 
                  onSpeak={handleSpeak}
                  isPlaying={isPlaying}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60 mt-auto"> {/* Added mt-auto */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(document.created_date), "MMM d, yyyy")}
            </div>
            <div>
              {document.content?.length} chars
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

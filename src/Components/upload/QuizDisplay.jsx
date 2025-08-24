import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Volume2, Square, RotateCcw, CheckCircle, XCircle, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizDisplay({ quiz, onSpeak, isPlaying }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSelect = (questionIndex, answer) => {
    if (showResults) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (!quizCompleted) {
      setQuizCompleted(true);
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return { correct, total: totalQuestions };
  };

  const getScoreColor = () => {
    const { correct, total } = getScore();
    const percentage = (correct / total) * 100;
    if (percentage >= 80) return "from-green-500 to-emerald-600";
    if (percentage >= 60) return "from-yellow-500 to-amber-600";
    return "from-red-500 to-pink-600";
  };

  if (!questions || questions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <p className="text-pink-800">No quiz questions generated. Try generating again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-800">
          <Brain className="w-5 h-5" />
          AI-Generated Quiz
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSpeak(currentQuestion?.question)}
            className="ml-auto text-pink-700 hover:text-pink-800"
          >
            {isPlaying ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge className="bg-pink-200 text-pink-800">
            {showResults ? 'Results' : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
          </Badge>
          {!showResults && (
            <div className="text-sm text-pink-700">
              {Object.keys(selectedAnswers).length} / {totalQuestions} answered
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white/80 p-4 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {currentQuestion?.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion?.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedAnswers[currentQuestionIndex] === key ? "default" : "outline"}
                        className={`w-full p-4 h-auto text-left justify-start transition-all duration-200 ${
                          selectedAnswers[currentQuestionIndex] === key 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg' 
                            : 'hover:bg-pink-50 text-slate-700'
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestionIndex, key)}
                      >
                        <span className="font-semibold mr-3 text-base">{key}.</span>
                        <span className="text-sm">{value}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="border-pink-300 text-pink-700 hover:bg-pink-50"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                >
                  {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Score Display */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${getScoreColor()} rounded-full flex items-center justify-center shadow-lg`}
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Quiz Complete!</h3>
                <p className="text-lg text-slate-600">
                  You scored {getScore().correct} out of {getScore().total}
                </p>
                <p className="text-sm text-slate-500">
                  {Math.round((getScore().correct / getScore().total) * 100)}% accuracy
                </p>
              </div>

              {/* Question Review */}
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correct_answer;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`p-4 rounded-lg border ${
                        isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 mb-2">
                            {index + 1}. {question.question}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              Your answer: {userAnswer}. {question.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-700">
                                Correct answer: {question.correct_answer}. {question.options[question.correct_answer]}
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-slate-600 italic mt-2">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                <Button
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
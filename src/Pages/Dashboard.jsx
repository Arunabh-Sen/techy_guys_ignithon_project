
import React, { useState, useEffect } from "react";
import { Document } from "@/entities/Document";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Upload, 
  FileText, 
  Languages, 
  Volume2, 
  Sparkles,
  TrendingUp,
  Globe,
  BookOpen,
  Zap,
  Brain // Added Brain icon
} from "lucide-react";
import { motion } from "framer-motion";

import StatsCard from "../components/dashboard/StatsCard";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await Document.list('-created_date', 10);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalTranslations = documents.reduce((sum, doc) => 
    sum + Object.keys(doc.translations || {}).length, 0);
  
  // Calculate total quizzes
  const totalQuizzes = documents.filter(doc => 
    doc.quiz && doc.quiz.questions && doc.quiz.questions.length > 0
  ).length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Welcome to EduBridge
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Your AI-powered multilingual learning assistant
              </p>
            </div>
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-500/25 transition-all duration-200">
                <Upload className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Documents Processed" 
            value={documents.length}
            icon={FileText}
            gradient="from-blue-500 to-blue-600"
            bgGradient="from-blue-50 to-blue-100"
            delay={0}
          />
          <StatsCard 
            title="AI Summaries Created" 
            value={documents.filter(doc => doc.summary).length}
            icon={Sparkles}
            gradient="from-amber-500 to-orange-600"
            bgGradient="from-amber-50 to-orange-100"
            delay={0.1}
          />
          <StatsCard 
            title="Translations Generated" 
            value={totalTranslations}
            icon={Languages}
            gradient="from-green-500 to-emerald-600"
            bgGradient="from-green-50 to-emerald-100"
            delay={0.2}
          />
          <StatsCard 
            title="Quizzes Generated" 
            value={totalQuizzes}
            icon={Brain}
            gradient="from-pink-500 to-rose-600"
            bgGradient="from-pink-50 to-rose-100"
            delay={0.3}
          />
        </div>

        {/* Quick Actions & Recent Documents */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentDocuments documents={documents} isLoading={isLoading} />
          </div>
          <div>
            <QuickActions />
            
            {/* Features Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    AI-Powered Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Smart Summarization</p>
                      <p className="text-sm text-slate-400">AI extracts key insights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Languages className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Multi-language Support</p>
                      <p className="text-sm text-slate-400">Break language barriers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Enhanced Text-to-Speech</p>
                      <p className="text-sm text-slate-400">Multi-language audio support</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <p className="font-medium">Interactive Quizzes</p>
                      <p className="text-sm text-slate-400">Test comprehension with AI-generated MCQs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
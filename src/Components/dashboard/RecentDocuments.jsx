
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Languages, Volume2, Sparkles, ExternalLink, Brain } from "lucide-react"; // Added Brain icon
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function RecentDocuments({ documents, isLoading }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'audio': return <Volume2 className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800">
              Recent Documents
            </CardTitle>
            <Link to={createPageUrl("Documents")}>
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-slate-100 rounded-lg">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No documents processed yet</p>
              <Link to={createPageUrl("Upload")}>
                <Button>Upload Your First Document</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/80 rounded-lg border border-slate-100 hover:bg-white transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    {getTypeIcon(doc.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800 truncate">
                        {doc.title}
                      </p>
                      <Badge className={getTypeBadge(doc.file_type)}>
                        {doc.file_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {doc.content?.slice(0, 100)}...
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">
                        {format(new Date(doc.created_date), "MMM d, yyyy")}
                      </span>
                      <div className="flex items-center gap-1">
                        {doc.summary && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600">Summary</span>
                          </div>
                        )}
                        {doc.translations && Object.keys(doc.translations).length > 0 && (
                          <div className="flex items-center gap-1 ml-2">
                            <Languages className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">
                              {Object.keys(doc.translations).length} translations
                            </span>
                          </div>
                        )}
                        {doc.quiz && doc.quiz.questions && doc.quiz.questions.length > 0 && (
                          <div className="flex items-center gap-1 ml-2">
                            <Brain className="w-3 h-3 text-pink-500" />
                            <span className="text-xs text-pink-600">Quiz</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
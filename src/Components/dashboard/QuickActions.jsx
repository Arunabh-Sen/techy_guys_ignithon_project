import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Mic, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const actions = [
  {
    title: "Upload Text/PDF",
    description: "Process documents & PDFs",
    icon: Upload,
    color: "from-blue-500 to-blue-600",
    href: createPageUrl("Upload")
  },
  {
    title: "Record Audio",
    description: "Convert speech to text",
    icon: Mic,
    color: "from-purple-500 to-purple-600",
    href: createPageUrl("Upload")
  },
  {
    title: "View Documents",
    description: "Browse your library",
    icon: FileText,
    color: "from-green-500 to-green-600",
    href: createPageUrl("Documents")
  }
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link to={action.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-white/80 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{action.title}</p>
                    <p className="text-sm text-slate-500">{action.description}</p>
                  </div>
                </Button>
              </Link>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
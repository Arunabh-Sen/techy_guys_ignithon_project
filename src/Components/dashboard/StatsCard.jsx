import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, gradient, bgGradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, delay }}
    >
      <Card className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} border-0 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
        <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-4 -translate-y-4 opacity-20">
          <Icon className="w-full h-full" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">
                {value}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Type, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FileUploadSection({ onFileUpload, onTextInput, isProcessing }) {
  const fileInputRef = useRef(null);
  const [textInput, setTextInput] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file) => {
    const fileType = file.type;
    let type = 'text';
    
    if (fileType === 'application/pdf') {
      type = 'pdf';
    } else if (fileType.startsWith('text/')) {
      type = 'text';
    } else {
      // Default to text for other file types
      type = 'text';
    }
    
    onFileUpload(file, type);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextInput(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? "border-blue-400 bg-blue-50" 
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Drag & Drop Your Files
              </h3>
              <p className="text-slate-600 mb-4">
                Support for PDF and text files
              </p>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </>
                )}
              </Button>
              
              <p className="text-xs text-slate-500 mt-4">
                Maximum file size: 10MB
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Type className="w-5 h-5 text-green-600" />
              Direct Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste or type your text content here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[120px] bg-white/80 border-slate-200 focus:border-blue-400 resize-none"
              disabled={isProcessing}
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
            >
              <Type className="w-4 h-4 mr-2" />
              Process Text
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
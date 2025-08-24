import React, { useState } from "react";
import { Document } from "@/entities/Document";
import { InvokeLLM, UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

import FileUploadSection from "../components/upload/FileUploadSection";
import AudioRecorder from "../components/upload/AudioRecorder";
import TextProcessor from "../components/upload/TextProcessor";

export default function Upload() {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, process, complete
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileUpload = async (file, type) => {
    setIsProcessing(true);
    setError('');
    
    try {
      setFileName(file.name);
      setFileType(type);
      
      // Upload file first
      const { file_url } = await UploadFile({ file });
      setFileUrl(file_url);
      
      let text = '';
      
      if (type === 'text') {
        // Read text file content
        text = await file.text();
      } else if (type === 'pdf') {
        // Extract text from PDF
        const result = await ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              text_content: { type: "string" }
            }
          }
        });
        
        if (result.status === 'success') {
          text = result.output.text_content || '';
        } else {
          throw new Error('Failed to extract text from PDF');
        }
      }
      
      if (!text.trim()) {
        throw new Error('No text content found in the uploaded file');
      }
      
      setExtractedText(text);
      setCurrentStep('process');
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process the uploaded file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = (text) => {
    setExtractedText(text);
    setFileName('Direct Text Input');
    setFileType('text');
    setCurrentStep('process');
  };

  const handleAudioTranscription = (transcribedText) => {
    setExtractedText(transcribedText);
    setFileName('Speech-to-Text Recording');
    setFileType('audio');
    setCurrentStep('process');
  };

  const handleSaveDocument = async (documentData) => {
    try {
      await Document.create({
        title: fileName,
        content: extractedText,
        file_type: fileType,
        file_url: fileUrl,
        summary: documentData.summary || '',
        translations: documentData.translations || {},
        language: documentData.language || 'en'
      });
      
      setCurrentStep('complete');
    } catch (err) {
      setError('Failed to save document. Please try again.');
    }
  };

  const resetUpload = () => {
    setCurrentStep('upload');
    setExtractedText('');
    setFileName('');
    setFileType('');
    setFileUrl('');
    setError('');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" size="icon" className="hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Upload & Process Content
              </h1>
              <p className="text-slate-600">
                Upload text, PDF files, or use speech-to-text to get started with AI-powered learning
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <FileUploadSection 
                onFileUpload={handleFileUpload}
                onTextInput={handleTextInput}
                isProcessing={isProcessing}
              />
              
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    Speech-to-Text Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioRecorder 
                    onAudioReady={handleAudioTranscription}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'process' && (
            <motion.div
              key="process"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TextProcessor
                extractedText={extractedText}
                fileName={fileName}
                onSave={handleSaveDocument}
                onBack={resetUpload}
              />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white text-2xl font-bold"
                    >
                      ✓
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Document Saved Successfully!
                  </h3>
                  <p className="text-green-700 mb-6">
                    Your processed document is now available in your library.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={resetUpload}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Process Another
                    </Button>
                    <Link to={createPageUrl("Documents")}>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800">
                        View Documents
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
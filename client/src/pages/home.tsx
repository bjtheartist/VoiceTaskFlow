import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { VoiceRecorder, speechRecognition } from "@/lib/voice";
import { analyzeTranscript } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const voiceRecorder = new VoiceRecorder();

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: bibleQuote } = useQuery({
    queryKey: ["/api/bible-quote"],
    // Refetch the quote every 5 minutes
    refetchInterval: 5 * 60 * 1000,
    // Also refetch when the window regains focus
    refetchOnWindowFocus: true,
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeTranscript,
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Your tasks have been processed and organized.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartRecording = async () => {
    try {
      await voiceRecorder.startRecording();
      setIsRecording(true);

      speechRecognition.onresult = (event) => {
        const current = event.resultIndex;
        setTranscript(event.results[current][0].transcript);
      };

      speechRecognition.start();
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: error instanceof Error ? error.message : "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      await voiceRecorder.stopRecording();
      speechRecognition.stop();
      setIsRecording(false);

      if (transcript) {
        analyzeMutation.mutate(transcript);
      }
    } catch (error) {
      toast({
        title: "Error Stopping Recording",
        description: error instanceof Error ? error.message : "Failed to stop recording",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background via-background/95 to-background/90 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-12">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Daily Inspiration</h2>
                </div>
                <blockquote className="text-2xl font-serif italic text-center leading-relaxed">
                  {bibleQuote?.text || "Loading daily inspiration..."}
                </blockquote>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  {bibleQuote?.reference}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="text-center space-y-8 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Speak Your Tasks Into Action
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Click the microphone and start speaking. Our AI will organize your thoughts into actionable tasks and meaningful goals.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={analyzeMutation.isPending}
                className={`h-24 w-24 rounded-full shadow-lg transition-all duration-300 ${
                  isRecording ? 'animate-pulse shadow-red-500/20' : 'shadow-primary/20'
                }`}
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </motion.div>

            <AnimatePresence>
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="max-w-2xl mx-auto bg-primary/5 border-none">
                    <CardContent className="p-6">
                      <p className="text-lg">{transcript}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { VoiceRecorder, speechRecognition } from "@/lib/voice";
import { analyzeTranscript } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Loader2 } from "lucide-react";

const voiceRecorder = new VoiceRecorder();

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: bibleQuote } = useQuery({
    queryKey: ["/api/bible-quote"],
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeTranscript,
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Your tasks have been processed and organized.",
      });
      // Navigate to dashboard after successful analysis
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <blockquote className="italic text-lg text-center">
              {bibleQuote?.text || "Loading daily inspiration..."}
            </blockquote>
            <p className="text-center mt-2 text-sm text-muted-foreground">
              {bibleQuote?.reference}
            </p>
          </CardContent>
        </Card>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={analyzeMutation.isPending}
            className="h-16 w-16 rounded-full"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {transcript && (
            <p className="mt-4 text-muted-foreground">{transcript}</p>
          )}
        </div>

        {/* Remove the analysis display from home since it will be shown in dashboard */}
      </main>
    </div>
  );
}
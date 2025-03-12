import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
        description: error.message,
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
        description: error.message,
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

        {analyzeMutation.data && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <p>{analyzeMutation.data.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Top Priorities</h2>
                <ul className="list-disc pl-4 space-y-2">
                  {analyzeMutation.data.priorities.map((priority, i) => (
                    <li key={i}>{priority}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Daily Tasks</h2>
                <ul className="list-disc pl-4 space-y-2">
                  {analyzeMutation.data.dailyTasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Long-term Goals</h2>
                <ul className="list-disc pl-4 space-y-2">
                  {analyzeMutation.data.longTermGoals.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

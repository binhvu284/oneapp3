import { useState, useRef, useEffect } from "react";
import { Mic, Square, Volume2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceControlsProps {
    onTranscript: (text: string) => void;
    isProcessing?: boolean;
}

export function VoiceControls({ onTranscript, isProcessing }: VoiceControlsProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check for browser support
        const _window = window as any;
        if (!(_window.webkitSpeechRecognition) && !(_window.SpeechRecognition)) {
            setIsSupported(false);
            return;
        }

        const SpeechRecognition = _window.SpeechRecognition || _window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "vi-VN"; // Default to Vietnamese, can be dynamic later

        let finalTranscript = "";

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // We pass the ongoing transcript. The parent component should handle updating its state.
            // To avoid overriding user typing abruptly, it's better to append or just provide the final text when stopped.
            // For real-time feel, we callback with everything so far.
            if (finalTranscript || interimTranscript) {
                onTranscript((finalTranscript + interimTranscript).trim());
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                toast.error("Microphone access denied. Please allow it in site settings.");
                setIsRecording(false);
            }
        };

        recognitionRef.current.onend = () => {
            // If we are still supposed to be recording, restart it (sometimes it stops on pauses)
            // But for simple use case, we just turn it off.
            setIsRecording(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscript]);

    const toggleRecording = () => {
        if (!isSupported) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            try {
                onTranscript(""); // Clear previous before new speech
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error(err);
                setIsRecording(false);
            }
        }
    };

    if (!isSupported) {
        return (
            <Button variant="ghost" size="icon" disabled title="Not supported in your browser">
                <AlertCircle className="w-5 h-5 text-muted-foreground opacity-50" />
            </Button>
        )
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={cn(
                "rounded-full transition-all duration-300 w-10 h-10",
                isRecording && "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive animate-pulse"
            )}
            title={isRecording ? "Stop recording" : "Start speaking"}
        >
            {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
                <Square className="w-5 h-5 fill-current" />
            ) : (
                <Mic className="w-5 h-5" />
            )}
        </Button>
    );
}

// Global Text-to-Speech utility
export const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    // Stop any currently playing speech
    window.speechSynthesis.cancel();

    // Clean markdown syntax before speaking
    const cleanText = text.replace(/[*#_`~[\]()]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN"; // Default to Vietnamese for the user's primary instruction
    utterance.rate = 1.0;

    window.speechSynthesis.speak(utterance);
};

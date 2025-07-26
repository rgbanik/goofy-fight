import { useRef } from 'react';
// Add this only if it's missing from your TypeScript environment
type SpeechRecognitionEvent = Event & {
  readonly results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

const VoiceCommand = () => {
  const recognitionRef = useRef<any>(null);

  const startRecognition = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log("You said:", transcript);
        handleVoiceCommand(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
  };

  const handleVoiceCommand = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes("punch")) {
      console.log("PUNCH!");
    } else if (command.includes("kick")) {
      console.log("KICK!");
    } else {
      console.log("Unrecognized command.");
    }
  };

  return (
    <div>
      <button onClick={startRecognition}>🎤 Start Listening</button>
    </div>
  );
};

export default VoiceCommand;

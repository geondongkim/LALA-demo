// Speech synthesis and recognition utility

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(text: string, langCode: string = 'en-US', rate: number = 0.95): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel(); // stop current utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Find best matching voice
      const voices = this.synth.getVoices();
      const match = voices.find((v) => v.lang.startsWith(langCode.substring(0, 2)) || v.lang === langCode);
      if (match) {
        utterance.voice = match;
      }
      utterance.lang = langCode;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public startListening(
    langCode: string = 'en-US',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onError(new Error('Speech recognition is not supported in this browser.'));
      return false;
    }

    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = langCode;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onResult(text, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      onError(e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const speechManager = new SpeechManager();

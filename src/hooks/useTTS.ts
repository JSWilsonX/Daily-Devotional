import { useState, useEffect, useRef, useCallback } from "react";
import { DevotionalContent } from "../types";
import { PROFILE_VOICE_CONFIGS, PRONUNCIATION_REPLACEMENTS } from "../config/devotionals";
import { replaceNthWord, verbalizeScripture } from "../utils/text";

interface UseTTSProps {
  content: DevotionalContent | null;
  onCompleteReading?: () => void;
}

export function useTTS({ content, onCompleteReading }: UseTTSProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeParagraphIdx, setActiveParagraphIdx] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Apply voice config settings for a specific profile style
  const applyProfileVoiceSettings = useCallback((profile: string, availableVoices: SpeechSynthesisVoice[] = voices) => {
    const config = PROFILE_VOICE_CONFIGS[profile] || PROFILE_VOICE_CONFIGS.clear_modern;
    setSpeechRate(config.rate);
    setSpeechPitch(config.pitch);

    if (availableVoices.length > 0) {
      const engVoices = availableVoices.filter(v => v.lang.startsWith("en"));
      const searchPool = engVoices.length > 0 ? engVoices : availableVoices;

      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (config.genderPref === "male") {
        matchedVoice = searchPool.find(v => 
          v.name.toLowerCase().includes("male") || 
          v.name.toLowerCase().includes("david") || 
          v.name.toLowerCase().includes("mark") || 
          v.name.toLowerCase().includes("george") || 
          v.name.toLowerCase().includes("daniel") || 
          v.name.toLowerCase().includes("ravi")
        );
      } else if (config.genderPref === "female") {
        matchedVoice = searchPool.find(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("zira") || 
          v.name.toLowerCase().includes("samantha") || 
          v.name.toLowerCase().includes("hazel") || 
          v.name.toLowerCase().includes("susan") || 
          v.name.toLowerCase().includes("natural")
        );
      }

      if (!matchedVoice) {
        matchedVoice = searchPool.find(v => v.name.toLowerCase().includes("natural")) ||
                       searchPool.find(v => v.lang.startsWith("en-US")) ||
                       searchPool.find(v => v.lang.startsWith("en")) ||
                       searchPool[0];
      }

      if (matchedVoice) {
        setSelectedVoiceName(matchedVoice.name);
      }
    }
  }, [voices]);

  // Load available speech voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const availableVoices = window.speechSynthesis.getVoices();
      const filtered = availableVoices.filter(v => v.lang.startsWith("en"));
      const finalVoices = filtered.length > 0 ? filtered : availableVoices;
      setVoices(finalVoices);
      
      const currentProfile = localStorage.getItem("egw_selected_profile") || "clear_modern";
      applyProfileVoiceSettings(currentProfile, finalVoices);
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [applyProfileVoiceSettings]);

  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveParagraphIdx(-1);
    utteranceRef.current = null;
  }, []);

  const speakParagraph = useCallback((idx: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !content || idx < 0 || idx >= content.paragraphs.length) {
      stopSpeech();
      return;
    }

    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();

    setActiveParagraphIdx(idx);
    setIsPlaying(true);
    setIsPaused(false);

    const block = content.paragraphs[idx];
    if (!block) return;
    let speechText = block.text || "";

    // Normalize dashes
    speechText = speechText.replace(/—/g, ", ").replace(/–/g, " - ");

    // Apply pronunciation overrides
    if (block.pronunciationOverrides && Array.isArray(block.pronunciationOverrides) && block.pronunciationOverrides.length > 0) {
      for (const override of block.pronunciationOverrides) {
        const replacement = PRONUNCIATION_REPLACEMENTS[override.token];
        if (replacement) {
          speechText = replaceNthWord(speechText, override.text, override.occurrence, replacement);
        }
      }
    }

    // Announce title on first paragraph
    if (idx === 0) {
      speechText = `${content.title}. ${speechText}`;
    }

    // Convert scripture references into naturally spoken text
    speechText = verbalizeScripture(speechText);

    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;

    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onend = () => {
      if (idx + 1 < content.paragraphs.length) {
        speakParagraph(idx + 1);
      } else {
        stopSpeech();
        if (onCompleteReading) {
          onCompleteReading();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis error:", e);
      if (e.error !== "interrupted" && e.error !== "canceled") {
        stopSpeech();
      }
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 30);
  }, [content, onCompleteReading, selectedVoiceName, speechPitch, speechRate, stopSpeech, voices]);

  const startSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || !content) return;
    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      const startIdx = activeParagraphIdx !== -1 ? activeParagraphIdx : 0;
      speakParagraph(startIdx);
    }
  }, [activeParagraphIdx, content, isPaused, speakParagraph]);

  const pauseSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const skipForward = useCallback(() => {
    if (!content) return;
    const nextIdx = activeParagraphIdx + 1;
    if (nextIdx < content.paragraphs.length) {
      speakParagraph(nextIdx);
    }
  }, [activeParagraphIdx, content, speakParagraph]);

  const skipBackward = useCallback(() => {
    if (!content) return;
    const prevIdx = activeParagraphIdx - 1;
    if (prevIdx >= 0) {
      speakParagraph(prevIdx);
    }
  }, [activeParagraphIdx, content, speakParagraph]);

  return {
    isPlaying,
    isPaused,
    activeParagraphIdx,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    startSpeech,
    pauseSpeech,
    stopSpeech,
    skipForward,
    skipBackward,
    speakParagraph,
    applyProfileVoiceSettings
  };
}

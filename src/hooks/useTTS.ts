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
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("egw_selected_voice_name") || "" : "";
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onCompleteReadingRef = useRef(onCompleteReading);
  useEffect(() => {
    onCompleteReadingRef.current = onCompleteReading;
  }, [onCompleteReading]);

  // Keep ref for current selected voice, voices list, pitch, rate, and content
  const selectedVoiceNameRef = useRef(selectedVoiceName);
  const voicesRef = useRef(voices);
  const speechRateRef = useRef(speechRate);
  const speechPitchRef = useRef(speechPitch);
  const contentRef = useRef(content);

  useEffect(() => {
    selectedVoiceNameRef.current = selectedVoiceName;
  }, [selectedVoiceName]);

  useEffect(() => {
    voicesRef.current = voices;
  }, [voices]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    speechPitchRef.current = speechPitch;
  }, [speechPitch]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Custom setter for selectedVoiceName that also persists to localStorage
  const handleSelectVoiceName = useCallback((voiceName: string) => {
    setSelectedVoiceName(voiceName);
    selectedVoiceNameRef.current = voiceName;
    try {
      localStorage.setItem("egw_selected_voice_name", voiceName);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Apply voice config settings for a specific profile style
  const applyProfileVoiceSettings = useCallback((profile: string, availableVoices?: SpeechSynthesisVoice[]) => {
    const config = PROFILE_VOICE_CONFIGS[profile] || PROFILE_VOICE_CONFIGS.clear_modern;
    setSpeechRate(config.rate);
    setSpeechPitch(config.pitch);

    const pool = (availableVoices && availableVoices.length > 0)
      ? availableVoices
      : (typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis.getVoices() : []);

    if (pool.length > 0) {
      // If user previously selected a voice that exists in the current pool, keep it
      const storedVoiceName = localStorage.getItem("egw_selected_voice_name");
      if (storedVoiceName && pool.some(v => v.name === storedVoiceName)) {
        setSelectedVoiceName(storedVoiceName);
        return;
      }

      const engVoices = pool.filter(v => v.lang.startsWith("en"));
      const searchPool = engVoices.length > 0 ? engVoices : pool;

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
  }, []);

  // Load available speech voices on mount once
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
    const activeContent = contentRef.current;
    if (typeof window === "undefined" || !window.speechSynthesis || !activeContent || idx < 0 || idx >= activeContent.paragraphs.length) {
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

    const block = activeContent.paragraphs[idx];
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
      speechText = `${activeContent.title}. ${speechText}`;
    }

    // Convert scripture references into naturally spoken text
    speechText = verbalizeScripture(speechText);

    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;

    // Use current ref values so we always speak with the user's selected voice
    const currentVoiceName = selectedVoiceNameRef.current;
    const currentVoices = voicesRef.current;
    if (currentVoiceName) {
      const voice = currentVoices.find(v => v.name === currentVoiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = speechRateRef.current;
    utterance.pitch = speechPitchRef.current;

    utterance.onend = () => {
      const freshContent = contentRef.current;
      if (freshContent && idx + 1 < freshContent.paragraphs.length) {
        speakParagraph(idx + 1);
      } else {
        stopSpeech();
        if (onCompleteReadingRef.current) {
          onCompleteReadingRef.current();
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
  }, [stopSpeech]);

  const startSpeech = useCallback(() => {
    const activeContent = contentRef.current;
    if (typeof window === "undefined" || !window.speechSynthesis || !activeContent) return;
    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      const startIdx = activeParagraphIdx !== -1 ? activeParagraphIdx : 0;
      speakParagraph(startIdx);
    }
  }, [activeParagraphIdx, isPaused, speakParagraph]);

  const pauseSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const skipForward = useCallback(() => {
    const activeContent = contentRef.current;
    if (!activeContent) return;
    const nextIdx = activeParagraphIdx + 1;
    if (nextIdx < activeContent.paragraphs.length) {
      speakParagraph(nextIdx);
    }
  }, [activeParagraphIdx, speakParagraph]);

  const skipBackward = useCallback(() => {
    const activeContent = contentRef.current;
    if (!activeContent) return;
    const prevIdx = activeParagraphIdx - 1;
    if (prevIdx >= 0) {
      speakParagraph(prevIdx);
    }
  }, [activeParagraphIdx, speakParagraph]);

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
    setSelectedVoiceName: handleSelectVoiceName,
    startSpeech,
    pauseSpeech,
    stopSpeech,
    skipForward,
    skipBackward,
    speakParagraph,
    applyProfileVoiceSettings
  };
}

import { getExpectedAnswer } from "@/features/learning/scoring";
import type { Exercise } from "@/types/learning";

export type SpeechTarget = {
  text: string;
  label: string;
};

export type AudioSettings = {
  autoSpeak: boolean;
  slowMode: boolean;
};

export const defaultAudioSettings: AudioSettings = {
  autoSpeak: false,
  slowMode: false,
};

export function getExerciseSpeechTarget(exercise: Exercise): SpeechTarget | null {
  if (exercise.kind === "translate-en-fr" || looksEnglish(exercise.prompt)) {
    return {
      text: exercise.prompt,
      label: "Ecouter la phrase anglaise",
    };
  }

  if (exercise.kind === "fill-blank") {
    const sentence = exercise.prompt.replace(/_{2,}/g, exercise.answer);
    return {
      text: sentence,
      label: "Ecouter la phrase completee",
    };
  }

  if (exercise.kind === "match-pairs") {
    const terms = exercise.pairs.map((pair) => pair.right).join(", ");
    return {
      text: terms,
      label: "Ecouter les mots anglais",
    };
  }

  const expected = getExpectedAnswer(exercise);

  if (Array.isArray(expected)) {
    const sentence = expected.join(" ");
    return sentence.trim().length > 0 ? { text: sentence, label: "Ecouter la reponse anglaise" } : null;
  }

  if (exercise.kind === "translate-fr-en" || looksEnglish(expected)) {
    return {
      text: expected,
      label: "Ecouter la reponse anglaise",
    };
  }

  return null;
}

export function speakEnglish(text: string, settings: AudioSettings = defaultAudioSettings) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = settings.slowMode ? 0.68 : 0.88;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

function looksEnglish(value: string) {
  const normalized = value.toLowerCase();
  const commonSignals = [" i ", " you ", " he ", " she ", " we ", " they ", " the ", " is ", " are ", " can ", " have ", "where", "hello", "good"];
  return commonSignals.some((signal) => ` ${normalized} `.includes(signal));
}

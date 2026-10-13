import { Capacitor } from '@capacitor/core'
import { TextToSpeech } from '@capacitor-community/text-to-speech'

export const canSpeak = () => Capacitor.isNativePlatform() || (typeof window !== 'undefined' && 'speechSynthesis' in window)

export async function speakEnglish(text) {
  if (!text) return
  if (Capacitor.isNativePlatform()) {
    await TextToSpeech.stop()
    await TextToSpeech.speak({ text, lang: 'en-GB', rate: 0.82, pitch: 1, volume: 1, queueStrategy: 1 })
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = 0.82
  window.speechSynthesis.speak(utterance)
}

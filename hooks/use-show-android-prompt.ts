'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AndroidPromptState {
  showAndroid: boolean
  setShowAndroid: (show: boolean) => void
  hasShownAndroid: boolean
  markAndroidAsShown: () => void
}

export const useShowAndroidPrompt = create<AndroidPromptState>()(
  persist(
    (set) => ({
      showAndroid: false,
      setShowAndroid: (show) => set({ showAndroid: show }),
      hasShownAndroid: false,
      markAndroidAsShown: () => set({ hasShownAndroid: true, showAndroid: false }),
    }),
    {
      name: 'android-prompt-storage',
    }
  )
)

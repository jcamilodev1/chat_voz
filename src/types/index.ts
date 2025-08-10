// Tipos principales para ChatVoz

export interface VoiceMessage {
  id: string
  nickname: string
  audioBlob: Blob
  audioUrl: string
  duration: number
  timestamp: Date
  isOwn: boolean
}

export interface User {
  nickname: string
  isLoggedIn: boolean
}

export interface AudioRecorderState {
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  maxRecordingTime: number
  mediaRecorder: MediaRecorder | null
  audioChunks: Blob[]
}

export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  volume: number
}

export interface ChatState {
  messages: VoiceMessage[]
  isConnected: boolean
  broadcastChannel: BroadcastChannel | null
}

export type PlaybackRate = 1 | 1.5 | 2

export interface AudioPermissions {
  granted: boolean
  denied: boolean
  prompt: boolean
}

export interface BroadcastVoiceMessageData {
  id: string
  nickname: string
  audioArrayBuffer: ArrayBuffer
  duration: number
  timestamp: Date
  isOwn: boolean
}

export interface BroadcastMessage {
  type: 'voice_message' | 'user_joined' | 'user_left'
  data: BroadcastVoiceMessageData | { nickname: string }
  timestamp: Date
}
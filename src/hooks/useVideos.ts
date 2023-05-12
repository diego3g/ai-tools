import { useReducer } from 'react'
import { produce, enableMapSet } from 'immer'
import { ffmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/ffmpeg'

enableMapSet()

export interface Video {
  file: File
  previewURL: string
  isLoading: boolean
  convertedAt?: Date
  conversionProgress: number
  transcribedAt?: Date
}

interface VideoState {
  videos: Map<string, Video>
  isConverting: boolean
  isTranscribing: boolean
  finishedConversionAt?: Date
  finishedTranscriptionAt?: Date
}

export enum ActionTypes {
  UPLOAD,
  REMOVE_VIDEO,

  START_CONVERSION,
  END_CONVERSION,
  START_TRANSCRIPTION,
  END_TRANSCRIPTION,

  MARK_VIDEO_AS_LOADING,
  UPDATE_CONVERSION_PROGRESS,
  MARK_VIDEO_AS_CONVERTED,
  MARK_VIDEO_AS_TRANSCRIBED,
}

interface Action {
  type: ActionTypes
  payload?: any
}

export function useVideos() {
  const [
    {
      videos,
      isConverting,
      isTranscribing,
      finishedConversionAt,
      finishedTranscriptionAt,
    },
    dispatch,
  ] = useReducer(
    (state: VideoState, action: Action) => {
      return produce(state, (draft) => {
        switch (action.type) {
          case ActionTypes.UPLOAD: {
            const files = action.payload.files as FileList

            Array.from(files).forEach((file) => {
              const videoId = crypto.randomUUID()

              draft.videos.set(videoId, {
                file,
                previewURL: URL.createObjectURL(file),
                conversionProgress: 0,
                isLoading: false,
              })
            })

            break
          }
          case ActionTypes.START_CONVERSION: {
            draft.isConverting = true
            break
          }
          case ActionTypes.END_CONVERSION: {
            draft.isConverting = false
            draft.finishedConversionAt = new Date()

            break
          }
          case ActionTypes.START_TRANSCRIPTION: {
            draft.isTranscribing = true
            break
          }
          case ActionTypes.END_TRANSCRIPTION: {
            draft.isTranscribing = false
            draft.finishedTranscriptionAt = new Date()

            break
          }
          case ActionTypes.REMOVE_VIDEO: {
            const id = action.payload.id as string

            draft.videos.delete(id)

            break
          }
          case ActionTypes.MARK_VIDEO_AS_LOADING: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.videos.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.videos.set(id, {
              ...videoToBeUpdated,
              isLoading: true,
            })

            break
          }
          case ActionTypes.UPDATE_CONVERSION_PROGRESS: {
            const id = action.payload.id as string
            const progress = action.payload.progress as number

            const videoToBeUpdated = draft.videos.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.videos.set(id, {
              ...videoToBeUpdated,
              conversionProgress: progress,
            })

            break
          }
          case ActionTypes.MARK_VIDEO_AS_CONVERTED: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.videos.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.videos.set(id, {
              ...videoToBeUpdated,
              convertedAt: new Date(),
              isLoading: false,
            })

            break
          }
          case ActionTypes.MARK_VIDEO_AS_TRANSCRIBED: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.videos.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.videos.set(id, {
              ...videoToBeUpdated,
              transcribedAt: new Date(),
              isLoading: false,
            })

            break
          }
        }
      })
    },
    {
      videos: new Map(),
      isConverting: false,
      isTranscribing: false,
    },
  )

  function addFiles(files: FileList) {
    dispatch({
      type: ActionTypes.UPLOAD,
      payload: { files },
    })
  }

  function removeVideo(id: string) {
    dispatch({
      type: ActionTypes.REMOVE_VIDEO,
      payload: { id },
    })
  }

  async function convertVideoToAudio(id: string) {
    dispatch({
      type: ActionTypes.MARK_VIDEO_AS_LOADING,
      payload: { id },
    })

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    const video = videos.get(id)

    if (!video) {
      throw new Error(`Trying to convert an inexistent video: ${id}`)
    }

    const { file } = video

    ffmpeg.FS('writeFile', file.name, await fetchFile(file))

    ffmpeg.setProgress(({ ratio }) => {
      const progress = Math.round(ratio * 100)

      dispatch({
        type: ActionTypes.UPDATE_CONVERSION_PROGRESS,
        payload: { id, progress },
      })
    })

    await ffmpeg.run(
      '-i',
      file.name,
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      `${id}.mp4`,
    )

    const data = ffmpeg.FS('readFile', `${id}.mp4`)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        videoId: id,
      }),
    })

    const { url } = await response.json()

    await fetch(url, {
      method: 'PUT',
      body: data,
    })

    dispatch({
      type: ActionTypes.MARK_VIDEO_AS_CONVERTED,
      payload: { id },
    })
  }

  async function startAudioConversion() {
    dispatch({ type: ActionTypes.START_CONVERSION })

    for (const id of videos.keys()) {
      await convertVideoToAudio(id)
    }

    dispatch({ type: ActionTypes.END_CONVERSION })
  }

  return {
    videos,
    isConverting,
    isTranscribing,
    addFiles,
    removeVideo,
    finishedConversionAt,
    finishedTranscriptionAt,
    startAudioConversion,
  }
}

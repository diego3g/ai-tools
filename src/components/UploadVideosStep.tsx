import { ArrowRight, Music, PlusCircle } from 'lucide-react'
import { ChangeEvent } from 'react'
import { VideoItem } from './VideoItem'
import { Video, useVideos } from '@/hooks/useVideos'

interface UploadVideosStepProps {
  onNextStep: (videos: Map<string, Video>) => void
}

export function UploadVideosStep({ onNextStep }: UploadVideosStepProps) {
  const {
    videos,
    addFiles,
    isConverting,
    finishedConversionAt,
    removeVideo,
    startAudioConversion,
  } = useVideos()

  function handleVideoFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files

    if (!files) {
      return
    }

    addFiles(files)
  }

  const hasAnyVideoUploaded = videos.size !== 0

  return (
    <div className="relative flex flex-col gap-4">
      <label
        htmlFor="videos"
        aria-disabled={hasAnyVideoUploaded}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:enabled:bg-violet-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      >
        <PlusCircle className="h-4 w-4 text-white" />
        Selecione os vídeos
      </label>

      <input
        type="file"
        accept="video/*"
        multiple
        id="videos"
        className="invisible absolute top-0 h-0 w-0"
        onChange={handleVideoFilesSelected}
      />

      {!hasAnyVideoUploaded ? (
        <span className="inline-block text-center text-xs text-zinc-500">
          Nenhum vídeo selecionado
        </span>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {Array.from(videos).map(([id, video]) => {
            return (
              <VideoItem
                onRemove={removeVideo}
                id={id}
                key={id}
                video={video}
              />
            )
          })}
        </div>
      )}

      {hasAnyVideoUploaded && !finishedConversionAt && (
        <button
          type="button"
          onClick={startAudioConversion}
          disabled={isConverting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Music className="h-4 w-4 text-white" />
          Converter {videos.size} vídeos em áudio
        </button>
      )}

      {finishedConversionAt && (
        <button
          type="button"
          onClick={() => onNextStep(videos)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Prosseguir
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
      )}
    </div>
  )
}

import { ffmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/ffmpeg'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface VideoItemProps {
  file: File
}

export function VideoItem({ file }: VideoItemProps) {
  const [progress, setProgress] = useState(0)
  const [isConvertingVideoToAudio, setIsConvertingVideoToAudio] =
    useState(false)
  const [uploadedVideoKey, setUploadedVideoKey] = useState<string | null>(null)
  const [isTranscribed, setIsTranscribed] = useState<boolean>(false)

  const previewURL = useMemo(() => {
    return URL.createObjectURL(file)
  }, [file])

  const convertVideoToAudio = useCallback(async () => {
    setIsConvertingVideoToAudio(true)

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    ffmpeg.FS('writeFile', file.name, await fetchFile(file))

    ffmpeg.setProgress(({ ratio }) => {
      setProgress(Math.round(ratio * 100))
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
      'output-audio.mp4',
    )

    const data = ffmpeg.FS('readFile', 'output-audio.mp4')

    const response = await fetch('/api/upload')
    const { url, videoKey } = await response.json()

    await fetch(url, {
      method: 'PUT',
      body: data,
    })

    setUploadedVideoKey(videoKey)
    setIsConvertingVideoToAudio(false)

    return videoKey
  }, [file])

  async function generateTranscription() {
    await fetch('/api/ai/transcribe', {
      method: 'POST',
      body: JSON.stringify({
        videoKey: uploadedVideoKey,
      }),
    }).then((response) => response.json())

    setIsTranscribed(true)
  }

  useEffect(() => {
    convertVideoToAudio()
  }, [file, convertVideoToAudio])

  return (
    <div key={file.name} className="relative w-full overflow-hidden rounded-lg">
      <video
        src={previewURL}
        data-disabled={isConvertingVideoToAudio}
        className="aspect-video w-full data-[disabled=true]:opacity-60"
        controls={false}
      />

      {isTranscribed ? (
        <a
          target="_blank"
          download
          href={`/api/ai/transcribe/download?key=${uploadedVideoKey}`}
          className="absolute right-2 top-2 rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:enabled:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Baixar transcrição
        </a>
      ) : (
        <button
          type="button"
          onClick={generateTranscription}
          disabled={isConvertingVideoToAudio}
          className="absolute right-2 top-2 rounded bg-violet-500 px-2 py-1 text-xs font-medium text-white hover:enabled:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Transcrever
        </button>
      )}

      <span className="absolute bottom-0 left-0 right-0 bg-black/40 p-1 text-center text-xs text-zinc-200">
        {isConvertingVideoToAudio ? `${progress}%` : file.name}
      </span>
    </div>
  )
}

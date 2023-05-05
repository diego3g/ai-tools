import { PlusCircle } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import { VideoItem } from './VideoItem'

interface VideoListProps {
  onVideosSelected: (videos: FileList | null) => void
}

export function VideoList({ onVideosSelected }: VideoListProps) {
  const [videos, setVideos] = useState<FileList | null>(null)

  async function handleVideosSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target

    setVideos(files)
    onVideosSelected(files)
  }

  return (
    <div className="relative flex flex-col gap-3">
      <label
        htmlFor="videos"
        className="inline-flex items-center gap-2 rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PlusCircle className="h-4 w-4 text-white" />
        Selecione os vídeos
      </label>

      <input
        type="file"
        accept="video/*"
        id="videos"
        className="invisible absolute top-0 h-0 w-0"
        onChange={handleVideosSelected}
      />

      {!videos || videos.length === 0 ? (
        <span className="inline-block text-center text-xs text-zinc-500">
          Nenhum vídeo selecionado
        </span>
      ) : (
        Array.from(videos).map((video) => {
          return <VideoItem key={video.name} file={video} />
        })
      )}
    </div>
  )
}

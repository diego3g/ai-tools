'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { UploadVideosStep } from './UploadVideosStep'
import { Video } from '@/hooks/useVideos'
import { Mic2 } from 'lucide-react'

const defaultTranscriptionPrompt = [
  'Esse vídeo faz parte de um curso sobre design de software utilizando Node.js e conceitos de Domain-Driven Design. Algumas tecnologias e termos mencionados no vídeo são: JavaScript, TypeScript, WatchedList, Vitest e Aggregates.',
].join('\n')

// const defaultSummaryPrompt = [
//   'Você é um programador especialista em Node.js, JavaScript, arquitetura de software e Domain-Driven design.',
//   'Você é professor e está gravando um curso sobre domain-driven design com Node.js.',
//   'Com base na transcrição do vídeo, crie um resumo em primeira pessoa.',
//   'Se possível, inclua exemplos de código com base nos exemplos do texto.',
//   'A transcrição de uma das aulas do curso está contida na mensagem abaixo.',
// ].join('\n')

const formSchema = z.object({
  transcriptionPrompt: z.string(),
})

type FormSchema = z.infer<typeof formSchema>

export function MainForm() {
  const [videos, setVideos] = useState<Map<string, Video>>(new Map())
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [step, setStep] = useState<'upload' | 'transcribe' | 'generate'>(
    'upload',
  )

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcriptionPrompt: defaultTranscriptionPrompt,
    },
  })

  async function handleGenerate(data: FormSchema) {
    setIsTranscribing(true)

    await fetch('/api/ai/transcribe', {
      method: 'POST',
      body: JSON.stringify({
        videoKeys: uploadedVideoKey,
      }),
    }).then((response) => response.json())

    setIsTranscribing(false)
  }

  function handleUploaded(videos: Map<string, Video>) {
    setVideos(videos)
    setStep('transcribe')
  }

  return (
    <form onSubmit={handleSubmit(handleGenerate)}>
      {step === 'upload' && <UploadVideosStep onNextStep={handleUploaded} />}
      {step === 'transcribe' && (
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold"
            htmlFor="transcription_prompt"
          >
            Prompt de transcrição
          </label>
          <textarea
            id="transcription_prompt"
            defaultValue={defaultTranscriptionPrompt}
            spellCheck={false}
            className="min-h-[160px] w-full flex-1 rounded border border-zinc-200 px-4 py-3 leading-relaxed text-zinc-900"
            {...register('transcriptionPrompt')}
          />
          <span className="text-xs text-zinc-500">
            Adicione o contexto dos vídeos contendo palavras-chave sobre o
            conteúdo apresentado.
          </span>

          <button
            type="submit"
            disabled={isTranscribing}
            className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mic2 className="h-4 w-4 text-white" />
            Transcrever {videos.size} vídeos
          </button>
        </div>
      )}
    </form>
  )
}

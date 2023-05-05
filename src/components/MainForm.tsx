'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wand2 } from 'lucide-react'
import { z } from 'zod'
import { useState } from 'react'
import { VideoList } from './VideoList'

const defaultTranscriptionPrompt = [
  'Esse vídeo faz parte de um curso sobre design de software utilizando Node.js e conceitos de Domain-Driven Design. Algumas tecnologias e termos mencionados no vídeo são: JavaScript, TypeScript, WatchedList, Vitest e Aggregates.',
].join('\n')

const defaultSummaryPrompt = [
  'Você é um programador especialista em Node.js, JavaScript, arquitetura de software e Domain-Driven design.',
  'Você é professor e está gravando um curso sobre domain-driven design com Node.js.',
  'Com base na transcrição do vídeo, crie um resumo em primeira pessoa.',
  'Se possível, inclua exemplos de código com base nos exemplos do texto.',
  'A transcrição de uma das aulas do curso está contida na mensagem abaixo.',
].join('\n')

const formSchema = z.object({
  transcriptionPrompt: z.string(),
  summaryPrompt: z.string(),
})

type FormSchema = z.infer<typeof formSchema>

export function MainForm() {
  const [videos, setVideos] = useState<FileList | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcriptionPrompt: defaultTranscriptionPrompt,
      summaryPrompt: defaultSummaryPrompt,
    },
  })

  function handleGenerate(data: any) {
    console.log(videos, data)
  }

  return (
    <form onSubmit={handleSubmit(handleGenerate)} className="flex flex-1">
      <aside className="mr-4 w-[220px] border-r border-zinc-200 pr-4">
        <VideoList onVideosSelected={setVideos} />
      </aside>
      <main className="flex-1">
        <div className="flex h-full w-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-2">
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
              className="min-h-[120px] w-full flex-1 rounded border border-zinc-200 px-4 py-3 leading-relaxed"
              {...register('transcriptionPrompt')}
            />
            <span className="text-xs text-zinc-500">
              Adicione o contexto dos vídeos contendo palavras-chave sobre o
              conteúdo apresentado.
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="summary_prompt">
              Prompt do resumo
            </label>
            <textarea
              id="summary_prompt"
              defaultValue={defaultSummaryPrompt}
              spellCheck={false}
              disabled
              className="min-h-[120px] w-full flex-1 rounded border border-zinc-200 px-4 py-3 leading-relaxed disabled:text-zinc-400 disabled:opacity-80"
              {...register('summaryPrompt')}
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Generate
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </form>
  )
}

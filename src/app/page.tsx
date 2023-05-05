import { MainForm } from '@/components/MainForm'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <header className="flex items-center gap-8">
        <h1 className="font-semibold leading-none">Rocketseat AI Tools</h1>
      </header>

      <MainForm />
    </div>
  )
}

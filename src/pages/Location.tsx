import { useParams } from 'react-router-dom'

export default function Location() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Location: {slug}</h1>
      <p className="text-muted-foreground mt-2">Detail view lands in Phase 4/5.</p>
    </div>
  )
}

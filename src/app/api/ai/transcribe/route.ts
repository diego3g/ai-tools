import { GetObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import FormData from 'form-data'
import axios from 'axios'
import { r2 } from '@/lib/r2'

export async function POST(request: Request) {
  const { videoKey } = await request.json()

  try {
    const videoAudio = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: videoKey,
      }),
    )

    const formData = new FormData()

    formData.append('file', videoAudio.Body, {
      contentType: videoAudio.ContentType,
      knownLength: videoAudio.ContentLength,
      filename: videoKey,
    })

    formData.append('model', 'whisper-1')
    // formData.append('prompt', '')
    formData.append('language', 'pt')

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      },
    )

    const { text } = response.data

    return NextResponse.json({ transcription: text })
  } catch (err) {
    console.log('error', err)
  }
}

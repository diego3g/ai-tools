import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import FormData from 'form-data'
import axios from 'axios'
import chalk from 'chalk'
import { r2 } from '@/lib/r2'

export async function POST(request: Request) {
  const { videoKey } = await request.json()

  try {
    console.log(chalk.yellow(`Retrieving audio from R2: ${videoKey}`))

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

    console.log(chalk.yellow(`Generating Transcription: ${videoKey}`))

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

    console.log(chalk.yellow(`Deleting audio: ${videoKey}`))

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: videoKey,
      }),
    )

    const transcriptionKey = `${videoKey}.txt`

    console.log(chalk.yellow(`Uploading Transcription: ${transcriptionKey}`))

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: transcriptionKey,
        Body: response.data.text,
      }),
    )

    const { text } = response.data

    console.log(chalk.green(`Transcription succeeded!`))

    return NextResponse.json({ transcription: text })
  } catch (err) {
    console.log('error', err)
  }
}

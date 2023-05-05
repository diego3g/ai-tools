import { GetObjectCommand } from '@aws-sdk/client-s3'
import chalk from 'chalk'
import { r2 } from '@/lib/r2'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    throw new Error('The file key is required.')
  }

  const transcriptionKey = `${key}.txt`

  try {
    console.log(
      chalk.yellow(`Retrieving transcription from R2: ${transcriptionKey}`),
    )

    const transcription = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: transcriptionKey,
      }),
    )

    if (!transcription) {
      throw new Error('Transcription not found.')
    }

    return new Response(transcription.Body?.transformToWebStream(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (err) {
    console.log('error', err)
  }
}

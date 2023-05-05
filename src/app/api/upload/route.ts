import { r2 } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import chalk from 'chalk'
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

export async function GET() {
  const videoAudioId = randomUUID()
  const videoKey = `${videoAudioId}.mp4`

  try {
    console.log(chalk.yellow(`Generating an upload URL: ${videoKey}`))

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: videoKey,
      }),
      { expiresIn: 60 },
    )

    console.log(chalk.green(`Success generating upload URL!`))

    return NextResponse.json({ url: signedUrl, videoKey })
  } catch (err) {
    console.log('error')
  }
}

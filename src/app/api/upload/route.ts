import { r2 } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import chalk from 'chalk'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { videoId } = await request.json()

  try {
    console.log(chalk.yellow(`Generating an upload URL: ${videoId}`))

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: `${videoId}.mp4`,
      }),
      { expiresIn: 60 },
    )

    console.log(chalk.green(`Success generating upload URL!`))

    return NextResponse.json({ url: signedUrl })
  } catch (err) {
    console.log('error')
  }
}

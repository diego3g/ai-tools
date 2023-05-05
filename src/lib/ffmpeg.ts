import { createFFmpeg } from '@ffmpeg/ffmpeg'

export const ffmpeg = createFFmpeg({
  log: false,
  corePath: 'http://localhost:3000/ffmpeg-dist/ffmpeg-core.js',
})

import { createWriteStream } from 'fs'

const storeUpload = ({ stream, filename }) =>
  new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(`${process.cwd()}/img/${filename}`))
      .on('finish', () => resolve())
      .on('error', reject)
  )

export default storeUpload

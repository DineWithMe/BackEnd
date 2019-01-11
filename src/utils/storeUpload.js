import { createWriteStream, existsSync, mkdirSync } from 'fs'
import throwError from './throwError'

const storeUpload = ({ stream, folder, filename }) => {
  try {
    if (!existsSync(folder)) {
      mkdirSync(folder)
    }
  } catch (err) {
    throwError(8002, err)
  }
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(`${folder}/${filename}`))
      .on('finish', () => resolve())
      .on('error', reject)
  ).catch((err) => {
    throwError(8000, err)
  })
}

export default storeUpload

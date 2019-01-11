import { createWriteStream, existsSync, mkdirSync } from 'fs'
import throwError from './throwError'
import uuidv4 from 'uuid/v4'

const storeUpload = ({ createReadStream, folder, filename }) => {
  try {
    if (!existsSync(folder)) {
      mkdirSync(folder)
    }
  } catch (err) {
    throwError(8002, err)
  }
  const uniqueFilename = `${uuidv4()}_${filename}`
  return new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(`${folder}/${uniqueFilename}`))
      .on('finish', () => resolve(uniqueFilename))
      .on('error', reject)
  ).catch((err) => {
    throwError(8000, err)
  })
}

export default storeUpload

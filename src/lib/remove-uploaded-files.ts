import { File } from '../interfaces'
export type RemoveUploadedFileError = { file?: File; field?: string } & Error

function removeUploadedFiles(
  uploadedFiles: File[],
  remove: (file: File, cb: (error?: Error | null) => void) => void,
  cb: (err: Error | null, storageErrors: RemoveUploadedFileError[]) => void,
) {
  const length = uploadedFiles.length
  const errors: Error[] = []

  if (length === 0) {
    return cb(null, errors)
  }

  function handleFile(idx: number) {
    const file = uploadedFiles[idx]

    remove(file, function(err?: RemoveUploadedFileError | null) {
      if (err) {
        err.file = file
        err.field = file.fieldname
        errors.push(err)
      }

      if (idx < length - 1) {
        handleFile(idx + 1)
      } else {
        cb(null, errors)
      }
    })
  }

  handleFile(0)
}

export default removeUploadedFiles

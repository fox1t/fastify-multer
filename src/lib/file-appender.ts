import { FastifyRequest } from 'fastify'
import { File, FilesObject } from '../interfaces'

export type Strategy = 'NONE' | 'VALUE' | 'ARRAY' | 'OBJECT'
type Placeholder = {
  fieldname?: string
}

function arrayRemove(arr: any[], item: Placeholder) {
  const idx = arr.indexOf(item)
  if (~idx) {
    arr.splice(idx, 1)
  }
}

class FileAppender {
  strategy: Strategy
  request: FastifyRequest

  constructor(strategy: Strategy, request: FastifyRequest) {
    this.strategy = strategy
    this.request = request

    switch (strategy) {
      case 'NONE':
        break
      case 'VALUE':
        break
      case 'ARRAY':
        request.files = []
        break
      case 'OBJECT':
        request.files = Object.create(null)
        break
      default:
        throw new Error('Unknown file strategy: ' + strategy)
    }
  }
  insertPlaceholder(file: Pick<File, 'fieldname' | 'originalname' | 'encoding' | 'mimetype'>) {
    const placeholder = {
      fieldname: file.fieldname,
    }

    switch (this.strategy) {
      case 'NONE':
        break
      case 'VALUE':
        break
      case 'ARRAY':
        ;(this.request.files as Partial<File>[]).push(placeholder)
        break
      case 'OBJECT':
        if ((this.request.files as FilesObject)[file.fieldname]) {
          ;(this.request.files as FilesObject)[file.fieldname].push(placeholder)
        } else {
          ;(this.request.files as FilesObject)[file.fieldname] = [placeholder]
        }
        break
    }

    return placeholder
  }
  removePlaceholder(placeholder: Placeholder) {
    switch (this.strategy) {
      case 'NONE':
        break
      case 'VALUE':
        break
      case 'ARRAY':
        arrayRemove(this.request.files as Partial<File>[], placeholder)
        break
      case 'OBJECT':
        if (placeholder.fieldname) {
          if ((this.request.files as FilesObject)[placeholder.fieldname].length === 1) {
            delete (this.request.files as FilesObject)[placeholder.fieldname]
          } else {
            arrayRemove((this.request.files as FilesObject)[placeholder.fieldname], placeholder)
          }
        }
        break
    }
  }
  replacePlaceholder(placeholder: Placeholder, file: File) {
    if (this.strategy === 'VALUE') {
      this.request.file = file
      return
    }

    delete placeholder.fieldname
    Object.assign(placeholder, file)
  }
}

export default FileAppender

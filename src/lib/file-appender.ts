import express from 'express'

import { File, FilesObject } from '../interfaces'

export type Strategy = 'NONE' | 'VALUE' | 'ARRAY' | 'OBJECT'
type Placeholder = {
  fieldname: string
}

function arrayRemove(arr: any[], item: Placeholder) {
  const idx = arr.indexOf(item)
  if (~idx) {
    arr.splice(idx, 1)
  }
}

class FileAppender {
  strategy: Strategy
  req: express.Request

  constructor(strategy: Strategy, req: express.Request) {
    this.strategy = strategy
    this.req = req

    switch (strategy) {
      case 'NONE':
        break
      case 'VALUE':
        break
      case 'ARRAY':
        req.files = []
        break
      case 'OBJECT':
        req.files = Object.create(null)
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
        ;(this.req.files as Partial<File>[]).push(placeholder)
        break
      case 'OBJECT':
        if ((this.req.files as FilesObject)[file.fieldname]) {
          ;(this.req.files as FilesObject)[file.fieldname].push(placeholder)
        } else {
          ;(this.req.files as FilesObject)[file.fieldname] = [placeholder]
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
        arrayRemove(this.req.files as Partial<File>[], placeholder)
        break
      case 'OBJECT':
        if ((this.req.files as FilesObject)[placeholder.fieldname].length === 1) {
          delete (this.req.files as FilesObject)[placeholder.fieldname]
        } else {
          arrayRemove((this.req.files as FilesObject)[placeholder.fieldname], placeholder)
        }
        break
    }
  }
  replacePlaceholder(placeholder: Placeholder, file: File) {
    if (this.strategy === 'VALUE') {
      this.req.file = file
      return
    }

    delete placeholder.fieldname
    Object.assign(placeholder, file)
  }
}

export default FileAppender

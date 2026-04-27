import { DiffSync } from '@/lib/diffSync'

interface ManualMeta {
  version: number
  fileHash: string
  chunksHash: string
  buffer: ArrayBuffer
}

interface DBPayload {
  id: number
  version: number
  fileHash: string
  chunksHash: string
  buffer: ArrayBuffer
  timestamp: number
}

class PersistentManualLoader {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  private async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('AutoManualsCache', 1)

      request.onupgradeneeded = () => {
        request.result.createObjectStore('manuals', { keyPath: 'id' })
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onerror = () => reject(request.error)
    })

    return this.initPromise
  }

  async loadManual(manualId: number): Promise<ArrayBuffer> {
    await this.init()

    const cached = await this.getFromDB(manualId)

    const headers: Record<string, string> = {}
    if (cached) {
      headers['x-file-version'] = String(cached.version)
      headers['x-file-hash'] = cached.fileHash
      if (cached.chunksHash) {
        headers['x-chunks-hash'] = cached.chunksHash
      }
    }

    const response = await fetch(`/api/manuals/download/${manualId}`, { headers })

    if (response.status === 304) {      // 1 достать из хэша
      return cached!.buffer
    }

    if (response.headers.get('x-diff-applied') === 'true') {    // 2 кэш изменился
      const diffPackage = await response.json()
      const newBuffer = this.applyDiff(Buffer.from(cached!.buffer), diffPackage)

      await this.saveToDB(manualId, {
        version: diffPackage.version,
        fileHash: diffPackage.fileHash,
        chunksHash: '',
        buffer: newBuffer as unknown as ArrayBuffer
      })
      return newBuffer as unknown as ArrayBuffer
    }

    const buffer = await response.arrayBuffer()

    await this.saveToDB(manualId, {             // начальня загрузка
      version: Number(response.headers.get('x-file-version') ?? '1'),
      fileHash: response.headers.get('x-file-hash') ?? '',
      chunksHash: response.headers.get('x-chunks-hash') ?? '',
      buffer
    })

    return buffer
  }
  // сохр файл и метаданные в IndexedDB
  private async saveToDB(id: number, data: ManualMeta): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('manuals', 'readwrite')
      const store = tx.objectStore('manuals')

      const payload: DBPayload = {
        id,
        version: data.version,
        fileHash: data.fileHash,
        chunksHash: data.chunksHash,
        buffer: data.buffer,
        timestamp: Date.now()
      }

      store.put(payload)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
  // извлечь файл из IndexedDB по id
  private async getFromDB(id: number): Promise<ManualMeta | null> {
    return new Promise((resolve) => {
      const tx = this.db!.transaction('manuals', 'readonly')
      const store = tx.objectStore('manuals')
      const req = store.get(id)

      req.onsuccess = () => {
        const row = req.result as DBPayload | undefined
        if (!row || !row.buffer) {
          resolve(null)
          return
        }

        resolve({
          version: row.version,
          fileHash: row.fileHash,
          chunksHash: row.chunksHash,
          buffer: row.buffer
        })
      }

      req.onerror = () => resolve(null)
    })
  }

  private applyDiff(oldBuffer: Buffer, diffPackage: any): Buffer {
    const chunks = new Map<number, Buffer>()
    for (const chunk of diffPackage.changedChunks) {
      chunks.set(chunk.index, Buffer.from(chunk.data, 'base64'))
    }

    return DiffSync.applyDiff(oldBuffer, chunks)
  }
}

export const persistentLoader = new PersistentManualLoader()
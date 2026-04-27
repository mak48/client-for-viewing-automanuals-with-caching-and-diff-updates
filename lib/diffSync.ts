import crypto from 'crypto'

interface ChunkHashes {
  [pageNumber: number]: string
}

export class DiffSync {
  static hashFile(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }

  static hashChunks(buffer: Buffer, chunkSize: number = 1024 * 1024): ChunkHashes {
    const chunks: ChunkHashes = {}
    const totalChunks = Math.ceil(buffer.length / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, buffer.length)
      const chunk = buffer.subarray(start, end)
      chunks[i] = crypto.createHash('sha256').update(chunk).digest('hex')
    }

    return chunks
  }

  static diff(oldHashes: ChunkHashes, newHashes: ChunkHashes): number[] {
    const changedChunks: number[] = []
    const allKeys = new Set([
      ...Object.keys(oldHashes).map(Number),
      ...Object.keys(newHashes).map(Number)
    ])

    for (const key of allKeys) {
      if (oldHashes[key] !== newHashes[key]) {
        changedChunks.push(key)
      }
    }

    return changedChunks
  }

  static getChunks(buffer: Buffer, chunkIndexes: number[], chunkSize: number = 1024 * 1024): Map<number, Buffer> {
    const chunks = new Map<number, Buffer>()

    for (const index of chunkIndexes) {
      const start = index * chunkSize
      const end = Math.min(start + chunkSize, buffer.length)
      chunks.set(index, buffer.subarray(start, end))
    }

    return chunks
  }

  static applyDiff(oldBuffer: Buffer, chunks: Map<number, Buffer>, chunkSize: number = 1024 * 1024): Buffer {
    const maxIndex = Math.max(
      Math.ceil(oldBuffer.length / chunkSize),
      ...Array.from(chunks.keys()).map(k => k + 1)
    )

    const newChunks: Buffer[] = []

    for (let i = 0; i < maxIndex; i++) {
      if (chunks.has(i)) {
        newChunks.push(chunks.get(i)!)
      } else if (i * chunkSize < oldBuffer.length) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, oldBuffer.length)
        newChunks.push(oldBuffer.subarray(start, end))
      }
    }

    return Buffer.concat(newChunks)
  }
}
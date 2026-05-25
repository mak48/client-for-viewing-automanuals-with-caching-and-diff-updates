import { describe, it, expect, beforeAll, vi } from 'vitest'
import { persistentLoader } from '../lib/manualLoader'
beforeAll(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    status: 200,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    headers: {
      get: () => 'fake-hash-123'
    }
  })
})

describe('PersistentManualLoader', () => {
  it('должен сохранять файл в IndexedDB после загрузки', async () => {
    const manualId = 5
    const buffer = await persistentLoader.loadManual(manualId)

    expect(buffer).toBeInstanceOf(ArrayBuffer)
    expect(buffer.byteLength).toBeGreaterThan(0)

    const request = indexedDB.open('AutoManualsCache', 1)
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const tx = db.transaction('manuals', 'readonly')
    const store = tx.objectStore('manuals')
    const getRequest = store.get(manualId)

    const record = await new Promise<any>((resolve) => {
      getRequest.onsuccess = () => resolve(getRequest.result)
      getRequest.onerror = () => resolve(null)
    })

    expect(record).not.toBeNull()
    expect(record.fileHash).toBeTruthy()
    db.close()
  })
})
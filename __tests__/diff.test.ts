import { DiffSync } from '../lib/diffSync'
import { describe, it, expect } from 'vitest'

describe('DiffSync', () => {
  it('должен вычислить хеш файла', () => {
    const buffer = Buffer.from('Тестовый PDF контент')
    const hash = DiffSync.hashFile(buffer)
    
    expect(hash).toBeDefined()
    expect(typeof hash).toBe('string')
    expect(hash.length).toBe(64) 
  })

  it('должен разбить файл на чанки и вычислить их хеши', () => {
    const buffer = Buffer.alloc(3 * 1024 * 1024) // 3 МБ
    const chunks = DiffSync.hashChunks(buffer, 1024 * 1024) // по 1 МБ

    expect(Object.keys(chunks).length).toBe(3)
    expect(chunks[0]).toBeDefined()
    expect(chunks[1]).toBeDefined()
    expect(chunks[2]).toBeDefined()
  })

  it('должен найти различающиеся чанки', () => {
    const oldHashes = {
      0: 'abc123',
      1: 'def456',
      2: 'ghi789'
    }
    const newHashes = {
      0: 'abc123',
      1: 'xxx000', 
      2: 'ghi789'
    }

    const changed = DiffSync.diff(oldHashes, newHashes)
    expect(changed).toEqual([1])
  })

  it('должен правильно применить дифф и восстановить файл', () => {
    // Каждый чанк ровно 5 байт
    const oldBuffer = Buffer.from('AAAAABBBBBCCCCCDDDDD') // 20 байт
    const newChunk1 = Buffer.from('XXXXX') // 5 байт
    const newChunk3 = Buffer.from('YYYYY') // 5 байт
    
    const chunks = new Map<number, Buffer>()
    chunks.set(1, newChunk1)
    chunks.set(3, newChunk3)

    const result = DiffSync.applyDiff(oldBuffer, chunks, 5)
    const expected = Buffer.from('AAAAAXXXXXCCCCCYYYYY')
    
    expect(result.equals(expected)).toBe(true)
  })
})
export type RecordPayloadLines = readonly string[]
export type PayloadUpdateBatch = readonly RecordPayloadLines[]

export const payloadUpdateBatchCount = 200
const maximumPayloadLineCount = 3
const possiblePayloadLines = [
  "trace: request validated",
  "payload: checkpoint committed",
  "annotation: downstream acknowledged",
  "result: processing complete",
]

// Mulberry32 makes the same seed produce the same payloads for every provider.
function createSeededRandom(seed: number) {
  let randomState = seed >>> 0

  return () => {
    randomState = (randomState + 0x6D2B79F5) >>> 0
    let mixedValue = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState)
    mixedValue ^= mixedValue + Math.imul(mixedValue ^ (mixedValue >>> 7), 61 | mixedValue)
    return ((mixedValue ^ (mixedValue >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function createPayloadWorkload(seed: number, recordsPerUpdate: number): readonly PayloadUpdateBatch[] {
  const nextRandomValue = createSeededRandom(seed)

  return Array.from({ length: payloadUpdateBatchCount }, (_, batchIndex) => {
    const expandsPayloads = batchIndex % 2 === 0

    return Array.from({ length: recordsPerUpdate }, () => {
      if (!expandsPayloads) return []

      const payloadLineCount = 1 + Math.floor(nextRandomValue() * maximumPayloadLineCount)
      const payloadLines = Array.from({ length: payloadLineCount }, () => {
        const lineIndex = Math.floor(nextRandomValue() * possiblePayloadLines.length)
        return possiblePayloadLines[lineIndex]
      })

      return payloadLines
    })
  })
}

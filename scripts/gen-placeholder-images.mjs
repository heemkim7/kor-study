import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}
function solidPng(size, [r, g, b]) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2 // 8-bit, RGB
  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) { row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b }
  const raw = Buffer.concat(Array.from({ length: size }, () => Buffer.from(row)))
  const idat = deflateSync(raw)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}
// HSL-ish distinct colors by index
function colorFor(i, total) {
  const h = (i / total) * 360
  const c = 200, x = Math.round(c * (1 - Math.abs(((h / 60) % 2) - 1)))
  const m = 40
  let r=0,g=0,b=0
  if (h<60){r=c;g=x} else if(h<120){r=x;g=c} else if(h<180){g=c;b=x}
  else if(h<240){g=x;b=c} else if(h<300){r=x;b=c} else {r=c;b=x}
  return [r+m, g+m, b+m]
}

const words = ['apple','banana','grape','dog','cat','rabbit','car','bus','star','moon','flower','ball']
const scenes = ['orchard','monkey','squirrel']

mkdirSync('public/img/fluent', { recursive: true })
mkdirSync('public/img/scene', { recursive: true })
words.forEach((name, i) => writeFileSync(`public/img/fluent/${name}.png`, solidPng(240, colorFor(i, words.length))))
scenes.forEach((name, i) => writeFileSync(`public/img/scene/${name}.png`, solidPng(480, colorFor(i, scenes.length))))
console.log('placeholder images generated')

import { createWriteStream } from 'fs'
import { readdir, stat } from 'fs/promises'
import { join, relative } from 'path'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

const ARCHIVE_NAME = 'weather-api.zip'
const SOURCE_DIR = './'

async function* getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      yield* getFiles(fullPath)
    } else {
      yield fullPath
    }
  }
}

async function createZip() {
  const { ZipArchive } = await import('archiver')
  
  const output = createWriteStream(ARCHIVE_NAME)
  const archive = new ZipArchive('zip', { zlib: { level: 9 } })
  
  archive.pipe(output)
  
  for await (const file of getFiles(SOURCE_DIR)) {
    const relativePath = relative(SOURCE_DIR, file)
    archive.file(file, { name: `weather-api/${relativePath}` })
  }
  
  await archive.finalize()
  
  output.on('close', () => {
    const size = archive.pointer()
    console.log(`ZIP created: ${ARCHIVE_NAME} (${(size / 1024).toFixed(2)} KB)`)
  })
}

createZip().catch(console.error)

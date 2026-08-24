import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import app from './app.js'

let server
const PORT = 3456
const BASE_URL = `http://localhost:${PORT}`

before(async () => {
  return new Promise((resolve, reject) => {
    server = app.listen(PORT, () => resolve())
    server.on('error', reject)
  })
})

after(async () => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
})

describe('GET /weather', () => {
  test('debe responder con 400 si no se provee ciudad', async () => {
    const response = await fetch(`${BASE_URL}/weather`)
    assert.strictEqual(response.status, 400)
  })

  test('debe responder con 400 si la ciudad tiene menos de 2 caracteres', async () => {
    const response = await fetch(`${BASE_URL}/weather?city=A`)
    assert.strictEqual(response.status, 400)
  })

  test('debe responder con 500 si no hay API key configurada', async () => {
    const response = await fetch(`${BASE_URL}/weather?city=London`)
    if (process.env.VISUAL_CROSSING_API_KEY) {
      assert.strictEqual(response.status, 200)
    } else {
      assert.strictEqual(response.status, 500)
    }
  })
})

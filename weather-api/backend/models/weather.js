import { Redis } from 'ioredis'
import { DEFAULTS } from '../config.js'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message)
})

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || DEFAULTS.CACHE_TTL_SECONDS
const API_KEY = process.env.VISUAL_CROSSING_API_KEY

export class WeatherModel {
  static async getByCity ({ city }) {
    const cacheKey = `weather:${city.toLowerCase()}`

    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return { ...JSON.parse(cached), cached: true }
      }
    } catch (err) {
      console.error('Redis read error:', err.message)
    }

    if (!API_KEY) {
      throw new Error('VISUAL_CROSSING_API_KEY no está configurada')
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&include=days%2Chours&key=${API_KEY}&contentType=json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error de la API de Visual Crossing: ${response.status}`)
    }

    const data = await response.json()

    const result = {
      city: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      currentConditions: data.currentConditions,
      days: data.days
    }

    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result))
    } catch (err) {
      console.error('Redis write error:', err.message)
    }

    return { ...result, cached: false }
  }
}

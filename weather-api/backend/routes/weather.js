import { Router } from 'express'
import { WeatherController } from '../controllers/weather.js'
import { validateWeatherQuery } from '../schemas/weather.js'

export const weatherRouter = Router()

function validateQuery (req, res, next) {
  const result = validateWeatherQuery(req.query)
  if (!result.success) {
    return res.status(400).json({ error: 'Parámetros inválidos', details: result.error.errors })
  }
  req.query = result.data
  next()
}

weatherRouter.get('/', validateQuery, WeatherController.getWeather)

import { WeatherModel } from '../models/weather.js'

export class WeatherController {
  static async getWeather (req, res) {
    const { city } = req.query
    try {
      const weatherData = await WeatherModel.getByCity({ city })
      return res.json({ data: weatherData })
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener la información meteorológica' })
    }
  }
}

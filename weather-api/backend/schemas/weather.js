import * as z from 'zod'

const weatherSchema = z.object({
  city: z
    .string({ required_error: 'La ciudad es obligatoria' })
    .min(2, 'El nombre de la ciudad debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la ciudad no puede exceder 100 caracteres')
})

export function validateWeatherQuery (input) {
  return weatherSchema.safeParse(input)
}

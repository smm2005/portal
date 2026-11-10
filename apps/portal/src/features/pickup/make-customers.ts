import { SquareClient, SquareEnvironment, SquareError } from 'square'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

function requiredEnvironment(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const client = new SquareClient({
    token: requiredEnvironment('SQUARE_TOKEN'),
    environment: SquareEnvironment.Sandbox,
})

export const createCustomer = createServerFn({method: 'POST'})
    .validator((data: {givenName: string, familyName: string, emailAddress: string}) => data)
    .handler(async ({data}) => {
    const customer = await client.customers.create({
        givenName: data.givenName,
        familyName: data.familyName ?? '',
        emailAddress: data.emailAddress ?? ''
    })
    return customer
})
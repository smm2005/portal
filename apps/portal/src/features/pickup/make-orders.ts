import { SquareClient, SquareEnvironment, SquareError } from 'square'
import { createServerFn } from '@tanstack/react-start'

function requiredEnvironment(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const client = new SquareClient({
    token: requiredEnvironment('SQUARE_TOKEN'),
    environment: SquareEnvironment.Sandbox,
})

export const createTestOrder = createServerFn({method : 'POST'}).handler(async () => {
    const order = await client.orders.create({
        order: {
            locationId: "LFT1D77946WZ9",
            referenceId: "my-order",
            lineItems: [
                {
                    name: "Order1",
                    quantity: "5",
                    basePriceMoney: {
                        amount: BigInt(519),
                        currency: "CAD"
                    }
                }
            ]
        },
        idempotencyKey: '123'
    })
}) 
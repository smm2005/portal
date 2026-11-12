import { SquareClient, SquareEnvironment, SquareError } from 'square'
import { createServerFn } from '@tanstack/react-start'

import { createCustomer } from './make-customers'
import { randomUUID } from 'crypto'

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

    const customer = await createCustomer({
        data: {
            givenName: 'Suhail',
            familyName: 'Moeen',
            emailAddress: 'suhail.moeen@test.com'
        }
    })

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
            ],
            customerId: customer.customer?.id
        },
        idempotencyKey: randomUUID()
    })
}) 
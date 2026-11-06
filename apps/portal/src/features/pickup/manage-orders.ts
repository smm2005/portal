import { 
    SquareClient, 
    SquareEnvironment, 
    SquareError
} from 'square'

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

type Order = {
    location: string,
    createdAt: string,
    quantity: string,
    catalogId: string
}

const getOrderEntries = createServerFn({method: 'POST'}).handler(async () => {
    try {
        const orders = await client.orders.search({
            locationIds: ["LFT1D77946WZ9"],
            /*
            query: {
                filter: {
                    stateFilter: {
                        states: ['COMPLETED']
                    }
                },
                sort: {
                    sortField: "CLOSED_AT",
                    sortOrder: "DESC"
                }
            },*/
            limit: 10,
            returnEntries: true
        })
        return orders
    }
    catch (err) {
        if (err instanceof SquareError){
            return String(err.rawResponse)
        }
        return String("Unknown error has occured")
    }  
})

const getOrderEntryIds = createServerFn({method: 'POST'}).handler(async () => {
    const orders = await getOrderEntries()
    switch (typeof orders){
        case 'string':
            return
        default:
            const entryList = orders?.orderEntries?.map(entry => {
                    if (entry.orderId == null || entry.orderId == undefined){
                        return ''
                    }
                    else{
                        return entry.orderId
                    }
                }
            )
            return entryList
    }
})

const getOrders = createServerFn({method: 'GET'}).handler(async () => {
    // const client = await getClient()
    const orderIds = await getOrderEntryIds()
    switch (typeof orderIds){
        case 'undefined':
            return 
        default:
            const orderList = orderIds.map(async id => {
                if (id == undefined){
                    return
                }
                const orderCall = await client.orders.get({
                    orderId: id
                })
                return orderCall
            })
            return Promise.all(orderList)
    }
})

export const getPrimaryOrderDetails = createServerFn({method: 'POST'}).handler(async () => {
    const orderDetails = await getOrders()
    switch (typeof orderDetails) {
        case 'undefined':
            return 'no valid orders'
        default:
            var array : Order[] | undefined = []
            const primaryOrderDetails = orderDetails.map(async detail => {
                const order = detail?.order
                const items = order?.lineItems
                const itemArray = items?.forEach(item => {
                    const orderDetail : Order = {
                        location: String(order?.locationId),
                        createdAt: String(order?.createdAt),
                        quantity: item.quantity,
                        catalogId: String(item.catalogObjectId)
                    }
                    array?.push(orderDetail)
                })
            })
            return array
    }
})


import { 
    SquareClient, 
    SquareEnvironment, 
    SquareError
} from 'square'

import { createServerFn } from '@tanstack/react-start'
import { createTestOrder } from './make-orders'
import { test } from 'vitest'

import { getDb } from '../../db/index.js'
import { orders } from '../../db/schema.js'
import { desc } from 'drizzle-orm'

function requiredEnvironment(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const client = new SquareClient({
    token: requiredEnvironment('SQUARE_TOKEN'),
    environment: SquareEnvironment.Sandbox,
})

export type Order = {
    orderId: string,
    orderNumber: string,
    studentName: string,
    email: string,
    itemId: string,
    item: string,
    quantity: number,
    createdAt: string,
    isPickedUp: boolean
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
            limit: 100,
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
            return []
        default:
            const array = await Promise.all(orderDetails.map(async detail => {
                const order = detail?.order

                if (!order) {return []}

                const customer = await client.customers.get({
                    customerId: String(order?.customerId)
                })
                const items = order?.lineItems
                return (items ?? []).map(item => {
                    const orderDetail : Order = {
                        orderId: String(order?.id),
                        orderNumber: String(order?.referenceId),
                        studentName: String(customer.customer?.givenName?.concat(customer.customer?.familyName ?? '')),
                        email: customer.customer?.emailAddress ?? '',
                        itemId: String(item?.uid),
                        item: String(item?.name),
                        quantity: Number(item.quantity),
                        createdAt: String(order?.createdAt),
                        isPickedUp: false
                    }
                    return orderDetail
                })
            }))
            return array.flat()
    }
})

export const insertOrdersInTable = createServerFn({method: 'POST'}).handler(async () => {
    const orderDetails = await getPrimaryOrderDetails()
    
    const db = getDb()

    orderDetails.map(async (detail) => {
        const entry = await db
        .insert(orders)
        .values({
            orderId: detail.orderId,
            orderNumber: detail.orderNumber,
            customerName: detail.studentName,
            customerEmail: detail.email,
            itemId: detail.itemId,
            item: detail.item,
            quantity: detail.quantity,
            status: detail.isPickedUp,
            verifiedBy: null 
        })
        .onConflictDoNothing({ target: [ orders.orderId, orders.itemId ]})
        .returning({id: orders.id})
    })
})

export const getOrdersFromTable = createServerFn({method: 'POST'}).handler(async () => {

    const db = getDb()
    
    const rows = await db.select()
        .from(orders)
    
    console.log(rows)
    return rows
})
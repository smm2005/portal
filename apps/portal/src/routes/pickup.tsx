import { createFileRoute } from '@tanstack/react-router'
import { getPortalShell } from '#/auth/shell'
import { AccessDenied, SignIn } from '../components/auth-state'
import { useState, useEffect } from 'react'

import { getPrimaryOrderDetails } from '../features/pickup/manage-orders'
// import { createTestOrder } from '../features/pickup/make-orders'

import { Suspense } from 'react'

export const Route = createFileRoute('/pickup')({
  component: Pickup,
  loader: async () => {
    return {
        shell: await getPortalShell()
    }
  }
})

function Pickup() {
    const [orders, setOrders] = useState<(string[][] | undefined)[]>()

    useEffect(() => {
        getPrimaryOrderDetails()
        .then(res => res)
        .then(obj => {
            switch (obj){
                case 'no valid orders':
                    break
                default:
                    setOrders(obj)
            }
        })
        .catch(err => err)
    }, [])

    const {shell} = Route.useLoaderData()

    if (shell.kind == 'anonymous') return <SignIn />
    if (shell.kind == 'denied') return <AccessDenied />

    if (shell.kind == 'member' || shell.kind == 'superuser') {
        return (
            <div className="max-w-4xl flex flex-col gap-8">
                
                {/* Page Header */}
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        Pickup
                    </h1>
                </header>

                <main className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        Orders Pending Pickup
                    </h2>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        Completed Orders
                    </h2>
                    <p>
                        <Suspense fallback={<p>Loading data...</p>}>
                            {
                                orders?.map(order => {
                                    const entry = order
                                    return (
                                        <tr>
                                            {
                                                entry?.map(ent => {
                                                    return ent.map(item => {return <td>{item}</td>})
                                                })
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </Suspense>
                    </p>
                </main>
            </div>
        )
    }
    console.log(orders)
}
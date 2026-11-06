import { createFileRoute } from '@tanstack/react-router'
import { getPortalShell } from '#/auth/shell'
import { AccessDenied, SignIn } from '../components/auth-state'
import { useState, useEffect, useMemo } from 'react'

import { getCoreRowModel, getSortedRowModel, flexRender, useReactTable } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'

import { getPrimaryOrderDetails } from '../features/pickup/manage-orders'
import { createTestOrder } from '../features/pickup/make-orders'

import { Suspense } from 'react'

type Order = {
    location: string,
    createdAt: string,
    quantity: string,
    catalogId: string
}

export const Route = createFileRoute('/pickup')({
  component: Pickup,
  loader: async () => {
    return {
        shell: await getPortalShell()
    }
  }
})


function Pickup() {
    
    const [data, setData] = useState<Order[]>([])

    const columns = useMemo(() => [
        {accessorKey: 'location', header: 'Location'},
        {accessorKey: 'createdAt', header: 'Created At'},
        {accessorKey: 'quantity', header: 'Quantity'},
        {accessorKey: 'catalogId', header: 'Catalog ID'}
    ], [])

    useEffect(() => {
        getPrimaryOrderDetails()
        .then(res => res)
        .then(obj => {
            switch (obj){
                case 'no valid orders':
                    break
                case undefined:
                    break
                default:
                    setData([...obj])
            }
        })
        .catch(err => err)
    }, [])

    const table = useReactTable({
        data: [...data],
        columns: columns,
        getCoreRowModel: getCoreRowModel()
    })

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
                        <Suspense fallback={<p>Loading data...</p>}>
                            <table>
                                <thead>
                                    <Suspense fallback={<p>Loading data...</p>}>
                                        {
                                            table.getHeaderGroups().map((headerGroup) => (
                                                <tr key={headerGroup.id}>
                                                    {headerGroup.headers.map(header => (
                                                        <th key={header.id}>
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                        </th>
                                                    ))}
                                                </tr>
                                            ))
                                        }
                                    </Suspense>
                                </thead>
                                <tbody>
                                    <Suspense fallback={<p>Loading data...</p>}>
                                        {table.getRowModel().rows.map(row => (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </Suspense>
                                </tbody>
                            </table>
                        </Suspense>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        Completed Orders
                    </h2>
                </main>
            </div>
        )
    }
    console.log(data)
}
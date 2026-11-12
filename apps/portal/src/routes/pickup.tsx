import { createFileRoute } from '@tanstack/react-router'
import { getPortalShell } from '#/auth/shell'
import { AccessDenied, SignIn } from '../components/auth-state'
import React, { useRef, useState, useEffect, useMemo, type InputHTMLAttributes, type ReactNode } from 'react'

import {
    type Column,
    type ColumnDef,
    type ColumnMeta,
    type RowData,
    type ColumnFiltersState,
    getCoreRowModel,
    getSortedRowModel, 
    getFilteredRowModel,
    flexRender, 
    useReactTable } from '@tanstack/react-table'

import { orderDetails } from '../features/pickup/manage-orders'

import { Suspense } from 'react'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select'
    }
}

type Order = {
    orderNumber: string,
    studentName: string,
    email: string,
    item: string,
    quantity: number,
    createdAt: string,
    isPickedUp: boolean
}

export const Route = createFileRoute('/pickup')({
  component: Pickup,
  loader: async () => {
    return {
        shell: await getPortalShell()
    }
  }
})

// Filter component to support table filtering
const Filter = ({column} : { column: Column<any,unknown> }) => {
    const columnFilterValue = column.getFilterValue()
    const { filterVariant } = column.columnDef.meta ?? {}

    return (
        <div>
            <div>
                <DebouncedInput
                    type="number"
                    value={
                        (columnFilterValue as [number, number])?.[0] ?? ''
                    }
                    onChange={(value) => {
                        column.setFilterValue((old: [number, number]) => [value, old?.[1]])
                    }}
                    placeholder={'Min'}
                />
                <DebouncedInput
                    type="number"
                    value={
                        (columnFilterValue as [number, number])?.[1] ?? ''
                    }
                    onChange={(value) => {
                        column.setFilterValue((old: [number, number]) => [old?.[0],  value])
                    }}
                    placeholder={'Max'}
                />
            </div>
        </div>
    )
}

const DebouncedInput = ({value: initialValue, onChange, debounce=500, ...props}
    : {
        value: string | number
        onChange: (value: string | number) => void
        debounce?: number
    } & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>
) => {
    const [value, setValue] = useState(initialValue)
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <input 
            {...props}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    )

}

const Dialog = ({isOpen, onClose, title, children}: {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}) => {

    const dialogRef = useRef<HTMLDialogElement>(null)

    const [text, setText] = useState<string>('')
    
    useEffect(() => {
        const dialog = dialogRef.current

        if (!dialog) {
            console.log("Dialog not detected")
            return
        }
        if (isOpen) {
            console.log("Dialog set")
            dialog.showModal()
        }
        else {
            console.log("Dialog close")
            dialog.close()
        }

    }, [isOpen])

    return (
        <dialog ref={dialogRef} className="backdrop:bg-black/50 bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-light">{title}</h3>
            </div>
            {children}
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter the Order ID" />
            <button type="button" onClick={onClose}>Close Dialog</button>
        </dialog>
    )

}

function Pickup() {
    
    const {shell} = Route.useLoaderData()
    
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [checked, setChecked] = useState<boolean>(false)
    const [data, setData] = useState<Order[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setData(orderDetails)
    }, [])

    const columns = useMemo<ColumnDef<Order, unknown>[]>(() => [
        {accessorKey: 'orderNumber', header: 'Order Number', meta: {}},
        {accessorKey: 'studentName', header: 'Student Name', meta: {}},
        {accessorKey: 'email', header: 'Email', meta: {}},
        {accessorKey: 'item', header: 'Item', meta: {filterVariant: 'select'}},
        {accessorKey: 'quantity', header: 'Quantity', meta: {filterVariant: 'range'}},
        {accessorKey: 'createdAt', header: 'Created At', meta: {filterVariant: 'range'}},
        {accessorKey: 'isPickedUp', header: 'Confirm Order Pickup', meta: {}},
    ], [])

    const table = useReactTable({
        data: data,
        columns: columns,
        state: {
            columnFilters,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
    })

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
                    <button type="button" onClick={() => setIsOpen(true)}>Click Me</button>
                    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Dialog test">
                        <>
                        </>
                    </Dialog>
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
}
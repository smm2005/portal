import { createFileRoute } from '@tanstack/react-router'
import { getPortalShell } from '#/auth/shell'
import { AccessDenied, SignIn } from '../components/auth-state'
import { useRef, useState, useEffect, useMemo, type InputHTMLAttributes, type ReactNode } from 'react'

import {
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

import { useRouter } from '@tanstack/react-router'

import {
    type Column,
    type ColumnDef,
    type ColumnMeta,
    type RowData,
    type ColumnFiltersState,
    getCoreRowModel,
    getSortedRowModel, 
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender, 
    useReactTable } from '@tanstack/react-table'

import { type Order, insertOrdersInTable, getOrdersFromTable } from '../features/pickup/manage-orders.ts'

import { Suspense } from 'react'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select'
    }
}

export const Route = createFileRoute('/pickup')({
  component: Pickup,
  loader: async () => {
    return {
        details: await getOrdersFromTable(),
        shell: await getPortalShell()
    }
  }
})

/*
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
*/

const DebouncedInput = ({value: initialValue, onChange, debounce=500, ...props}
    : {
        value: string
        onChange: (value: string) => void
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

const Dialog = ({isOpen, onClose, title, value, children}: {
    isOpen: boolean
    onClose: () => void
    title: string
    value: string
    children: ReactNode
}) => {

    const dialogRef = useRef<HTMLDialogElement>(null)

    const [text, setText] = useState<string>('')

    useEffect(() => {
        const dialog = dialogRef.current

        if (!dialog){
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
        <dialog ref={dialogRef} className="backdrop:bg-black/50 bg-white p-6 rounded-lg max-w-sm m-auto w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-light">{title}</h3>
            </div>
            {children}
            <div className="flex justify-center items-center flex-col gap-2">
                <DebouncedInput type="text" className="p-2 m-1 border-2 rounded-sm" value={text} onChange={(e) => {if (e === value) {onClose} }} placeholder="Enter the Order ID" />
                <button type="button" className="p-2 text-white hover:bg-sky-700 bg-sky-600 w-2/5 rounded-sm" onClick={onClose}>Close Dialog</button>
            </div>
        </dialog>
    )

}

function Pickup() {
    
    const {details, shell} = Route.useLoaderData()
    
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [checked, setChecked] = useState<boolean>(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const data : Order[] = details.map((order) => {
        const orderElement : Order = {
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            studentName: order.customerName,
            email: order.customerEmail ?? '',
            itemId: order.itemId ?? '',
            item: order.item,
            quantity: order.quantity ?? 0,
            createdAt: String(order.createdAt),
            isPickedUp: order.status ?? false
        }
        return orderElement
    })

    const SyncOrders = () => {
        const router = useRouter()

        return (
            <button onClick={async () => { 
                await insertOrdersInTable()
                router.invalidate()
                }
            }>
                Sync Orders
            </button>
        )
    }

    const PickupCell = ({ order } : {order: Order}) => {
        const [isOpen, setIsOpen] = useState<boolean>(false)    
            
        return (
                <div>
                    <input type="checkbox" checked={order.isPickedUp} onChange={() => setIsOpen(true)}></input>
                    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Order Pickup" value={order.orderNumber}>
                        <h4>
                            Enter the Order ID provided by Square for the user's order to confirm order pickup.
                        </h4>
                    </Dialog>
                </div>
        )
    }

    const columns = useMemo<ColumnDef<Order, unknown>[]>(() => [
        {accessorKey: 'orderNumber', header: 'Order Number', meta: {}},
        {accessorKey: 'studentName', header: 'Student Name', meta: {}},
        {accessorKey: 'email', header: 'Email', meta: {}},
        {accessorKey: 'item', header: 'Item', meta: {filterVariant: 'select'}},
        {accessorKey: 'quantity', header: 'Quantity', meta: {filterVariant: 'range'}},
        {accessorKey: 'createdAt', header: 'Created At', meta: {filterVariant: 'range'}},
        {accessorKey: 'isPickedUp', 
            header: 'Confirm Order Pickup', 
            meta: {},
            cell: ({row}) => <PickupCell order={row.original} />
        },
    ], [])

    const pendingData = useMemo(() => data.filter(detail => !detail.isPickedUp), [])
    const completedData = useMemo(() => data.filter(detail => detail.isPickedUp), [])

    const inProgress = useReactTable({
        data: pendingData,
        columns: columns,
        state: {
            columnFilters,
            pagination,
        },
        getPaginationRowModel: getPaginationRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
    })

    const completed = useReactTable({
        data: completedData,
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
                    <SyncOrders />
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        Orders Pending Pickup
                    </h2>
                    <Suspense fallback={<p>Loading data...</p>}>
                        <table>
                            <thead>
                                <Suspense fallback={<p>Loading data...</p>}>
                                    {
                                        inProgress.getHeaderGroups().map((headerGroup) => (
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
                                    {inProgress.getRowModel().rows.map(row => (
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
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => inProgress.previousPage()} disabled={!inProgress.getCanPreviousPage()}>
                                <ChevronLeft />
                            </button>
                            <h4>{inProgress.getState().pagination.pageIndex + 1}</h4>
                            <button onClick={() => inProgress.nextPage()} disabled={!inProgress.getCanNextPage()}>
                                <ChevronRight />
                            </button>
                        </div>
                    </Suspense>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        Completed Orders
                    </h2>
                    <Suspense fallback={<p>Loading data...</p>}>
                        <table>
                            <thead>
                                <Suspense fallback={<p>Loading data...</p>}>
                                    {
                                        completed.getHeaderGroups().map((headerGroup) => (
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
                                    {completed.getRowModel().rows.map(row => (
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
                </main>
            </div>
        )
    }
}
import OrderForm from "./order-form"

export default function NewOrderPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Order</h1>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
            <OrderForm initialOrderNumber="OPW-2026-004" />
        </div>
      </div>
    </div>
  )
}

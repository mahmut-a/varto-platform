import { model } from "@medusajs/framework/utils"

const Appointment = model.define("appointment", {
    id: model.id().primaryKey(),
    vendor_id: model.text(),
    customer_id: model.text(),
    service_name: model.text(),
    date: model.dateTime(),
    duration_minutes: model.number().default(30),
    status: model.enum(["pending", "confirmed", "rejected", "cancelled", "completed"]).default("pending"),
    notes: model.text().nullable(),
    rejection_reason: model.text().nullable(),
    metadata: model.json().nullable(),
})

export default Appointment

import { MedusaService } from "@medusajs/framework/utils"
import Customer from "./models/customer"

class CustomerModuleService extends MedusaService({
    Customer,
}) {
    // MedusaService auto-generates: createCustomers, updateCustomers,
    // retrieveCustomer, listCustomers, deleteCustomers at runtime
}

// Augment the class type so TS recognizes auto-generated methods
interface CustomerModuleService {
    createCustomers(data: any): Promise<any>
    updateCustomers(data: any): Promise<any>
    retrieveCustomer(id: string): Promise<any>
    listCustomers(filters?: any, config?: any): Promise<any[]>
    deleteCustomers(ids: string[]): Promise<void>
}

export default CustomerModuleService

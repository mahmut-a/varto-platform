import CustomerModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CUSTOMER_MODULE = "customerModule"

export default Module(CUSTOMER_MODULE, {
    service: CustomerModuleService,
})

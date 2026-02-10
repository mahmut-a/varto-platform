import OrderExtensionModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ORDER_EXTENSION_MODULE = "order_extension"

export default Module(ORDER_EXTENSION_MODULE, {
    service: OrderExtensionModuleService,
})

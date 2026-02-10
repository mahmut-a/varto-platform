import CourierModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const COURIER_MODULE = "courier"

export default Module(COURIER_MODULE, {
    service: CourierModuleService,
})

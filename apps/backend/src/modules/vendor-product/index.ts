import VendorProductModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const VENDOR_PRODUCT_MODULE = "vendorProduct"

export default Module(VENDOR_PRODUCT_MODULE, {
    service: VendorProductModuleService,
})

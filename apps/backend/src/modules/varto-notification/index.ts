import VartoNotificationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const VARTO_NOTIFICATION_MODULE = "varto_notification"

export default Module(VARTO_NOTIFICATION_MODULE, {
    service: VartoNotificationModuleService,
})

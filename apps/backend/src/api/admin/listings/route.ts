import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LISTING_MODULE } from "../../../modules/listing"
import ListingModuleService from "../../../modules/listing/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const listingService: ListingModuleService = req.scope.resolve(LISTING_MODULE)
    const listings = await listingService.listListings()
    res.json({ listings })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const listingService: ListingModuleService = req.scope.resolve(LISTING_MODULE)
    const listing = await listingService.createListings(req.body as any)
    res.status(201).json({ listing })
}

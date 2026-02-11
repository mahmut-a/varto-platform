import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LISTING_MODULE } from "../../../../modules/listing"
import ListingModuleService from "../../../../modules/listing/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const listingService: ListingModuleService = req.scope.resolve(LISTING_MODULE)
    const listing = await listingService.retrieveListing(req.params.id)
    res.json({ listing })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const listingService: ListingModuleService = req.scope.resolve(LISTING_MODULE)
    const listing = await listingService.updateListings({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ listing })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const listingService: ListingModuleService = req.scope.resolve(LISTING_MODULE)
    await listingService.deleteListings(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}

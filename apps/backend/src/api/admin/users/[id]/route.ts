import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const userService = req.scope.resolve("user") as any
    const user = await userService.retrieveUser(req.params.id)
    res.json({ user })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const userService = req.scope.resolve("user") as any
    const user = await userService.updateUsers({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ user })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const userService = req.scope.resolve("user") as any
    await userService.deleteUsers(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const userService = req.scope.resolve("user") as any
    const [users, count] = await userService.listAndCountUsers({}, { select: ["id", "email", "first_name", "last_name", "created_at", "updated_at"] })
    res.json({ users, count })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const userService = req.scope.resolve("user") as any
    const authService = req.scope.resolve("auth") as any
    const body = req.body as any

    // Create the user
    const user = await userService.createUsers({
        email: body.email,
        first_name: body.first_name || "",
        last_name: body.last_name || "",
    })

    // Create auth identity with password
    if (body.password) {
        await authService.createProviderIdentities({
            entity_id: user.id,
            provider: "emailpass",
            provider_metadata: {},
            user_metadata: { email: body.email },
        })
    }

    res.status(201).json({ user })
}

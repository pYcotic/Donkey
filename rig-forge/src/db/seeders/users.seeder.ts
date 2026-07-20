import bcrypt from "bcryptjs"
import { faker } from '@faker-js/faker'
import { users } from "../schema"
import { db } from ".."

export async function seedUsers(count: number) {
    const hash = await bcrypt.hash("password", 10)

    const rows = Array.from({ length: count }, () => ({
        email: faker.internet.email(),
        username: faker.internet.username(),
        passwordHash: hash,
    }))

    const inserted = await db
        .insert(users)
        .values(rows)
        .returning({ id: users.id })

    return inserted.map(x => x.id)
}
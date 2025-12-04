import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        // Check if any user already exists
        const existingUserCount = await prisma.user.count()

        if (existingUserCount > 0) {
            return NextResponse.json(
                { error: 'Admin account already exists' },
                { status: 400 }
            )
        }

        const { name, email, password } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json(
            { message: 'Admin account created successfully', userId: user.id },
            { status: 201 }
        )
    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json(
            { error: 'Failed to create admin account' },
            { status: 500 }
        )
    }
}

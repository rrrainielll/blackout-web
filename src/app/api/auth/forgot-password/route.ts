import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, do not reveal if the user exists
            return NextResponse.json({ message: 'If an account exists, a reset email has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        await sendPasswordResetEmail(email, resetToken);

        return NextResponse.json({ message: 'If an account exists, a reset email has been sent.' });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

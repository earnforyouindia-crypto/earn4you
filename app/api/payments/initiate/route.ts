import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Plan from '@/models/Plan';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    console.log("PAYMENT_INITIATE: Started");

    // 1. Env Var Check
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("PAYMENT_INITIATE: Missing Cloudinary Environment Variables");
        return NextResponse.json({ message: 'Server Configuration Error: Missing Cloudinary Credentials' }, { status: 500 });
    }

    try {
        await connectDB();
        console.log("PAYMENT_INITIATE: DB Connected");

        const userPayload = await authenticate(request);
        if (!userPayload) {
            console.warn("PAYMENT_INITIATE: Unauthorized");
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log("PAYMENT_INITIATE: Authenticated User", userPayload.id);

        const formData = await request.formData();
        const planId = formData.get('planId');
        const walletAddress = formData.get('walletAddress');
        const transactionHash = formData.get('transactionHash');
        const file = formData.get('screenshot');

        console.log("PAYMENT_INITIATE: Form Data Parsed", { planId, walletAddress, hasFile: !!file });

        if (!file || typeof file === 'string') {
            return NextResponse.json({ message: 'Please upload a payment screenshot' }, { status: 400 });
        }

        // Get plan details
        const plan = await Plan.findById(planId);
        if (!plan) {
            console.error("PAYMENT_INITIATE: Plan not found", planId);
            return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        }

        // Upload to Cloudinary
        console.log("PAYMENT_INITIATE: Starting Cloudinary Upload...");
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'earn4you_payments' },
                (error, result) => {
                    if (error) {
                        console.error("PAYMENT_INITIATE: Cloudinary Error", error);
                        reject(error);
                    }
                    else resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

        console.log("PAYMENT_INITIATE: Cloudinary Upload Success", uploadResult.secure_url);
        const screenshotUrl = uploadResult.secure_url;

        // Create payment record
        const payment = await Payment.create({
            userId: userPayload.id,
            planId,
            amount: plan.price,
            walletAddress,
            transactionHash: transactionHash || '',
            screenshotUrl,
        });

        console.log("PAYMENT_INITIATE: Payment Record Created", payment._id);

        // Update User's paymentStatus to 'pending' so the dashboard updates correctly
        await User.findByIdAndUpdate(userPayload.id, { paymentStatus: 'pending' });

        return NextResponse.json({
            success: true,
            message: 'Payment submitted successfully. Pending admin approval.',
            data: payment
        }, { status: 201 });

    } catch (error) {
        console.error('Payment Initiation Error (Catch Block):', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}

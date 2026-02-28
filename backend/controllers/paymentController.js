const Razorpay = require('razorpay');
const crypto = require('crypto');
const TranscriptRequest = require('../models/TranscriptRequest');
const asyncHandler = require('../utils/asyncHandler');

// Initialize Razorpay
// Fallback keys if not present so app doesn't crash, but payments will fail verification
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

/* ── POST /api/payment/create-order ───────────────────────────────── */
exports.createOrder = asyncHandler(async (req, res) => {
    // Fixed amount of 9 (assumed INR), which is 900 paise
    const amount = 900; 
    
    const options = {
        amount: amount, 
        currency: "INR",
        receipt: `receipt_req_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, error: 'Could not create Razorpay order' });
    }
});

/* ── POST /api/payment/verify-payment ────────────────────────────── */
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        title,
        author,
        format,
        context
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        // Payment is verified
        // Save the transcript request to DB
        const requestDoc = await TranscriptRequest.create({
            userId: req.user._id,
            title,
            author,
            format,
            context,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
        });

        return res.status(200).json({ 
            success: true, 
            message: "Payment verified successfully",
            transcriptRequest: requestDoc
        });
    } else {
        return res.status(400).json({ 
            success: false, 
            message: "Payment verification failed" 
        });
    }
});

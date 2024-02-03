import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    products: [
        {
            product_id: String,
            name: String,
            description: String,
            price: String
        },
    ],
    user: String,
    total_price: Number,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

export const Order = mongoose.model('orders', OrderSchema);
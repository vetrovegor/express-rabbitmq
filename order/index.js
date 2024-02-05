import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import { Order } from "./Order.js";
import { channel } from "./channel.js";

function createOrder(products, userNickname) {
    let total = 0;

    for (let t = 0; t < products.length; ++t) {
        total += products[t].price;
    }

    const order = new Order({
        products,
        user: userNickname,
        total_price: total,
    });

    order.save();

    return order;
}

const app = express();

const start = async () => {
    mongoose.connect(
        process.env.DB_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        () => console.log('Product db connected')
    );

    const PORT = process.env.PORT || 8082;

    app.listen(PORT, () => console.log('Product service started'));

    await channel.assertQueue("ORDER");
    
    channel.consume("ORDER", (msg) => {
        console.log("Consuming ORDER service");
        channel.ack(msg);
        const { products, userNickname } = JSON.parse(msg.content);
        const order = createOrder(products, userNickname);
        channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ order }))
        );
    });
};

start();
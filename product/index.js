import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import { Product } from "./Product.js";
import { channel } from "./channel.js";
import { authMiddleware } from "./authMiddleware.js"

const app = express();

app.use(express.json());

app.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, price } = req.body;

        if (!name || !description || !price) {
            return res.status(400).json({
                msg: 'name, description, price - обязательные поля'
            });
        }

        const createdProduct = new Product({
            name,
            description,
            price,
        });

        createdProduct.save();

        return res.json(createdProduct);
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            msg: error.toString()
        });
    }
});

app.post("/buy", authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids) {
            return res.status(400).json({
                msg: 'ids - обязательное поле'
            });
        }

        const products = await Product.find({ _id: { $in: ids } });

        if (!products.length) {
            return res.status(404).json({
                msg: "Продукты не найдены"
            })
        };

        channel.sendToQueue(
            "ORDER",
            Buffer.from(
                JSON.stringify({
                    products,
                    userNickname: req.user.nickname,
                })
            )
        );

        let order;

        await channel.consume("PRODUCT", (data) => {
            console.log("Consuming PRODUCT service");
            channel.ack(data);
            order = JSON.parse(data.content);
        });

        return res.json(order);
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            msg: error.toString()
        });
    }
});

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

    await channel.assertQueue("PRODUCT");
};

start();
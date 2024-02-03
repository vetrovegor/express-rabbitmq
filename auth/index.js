import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { User } from "./User.js";

mongoose.connect(
    process.env.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('Auth db connected')
);

const app = express();

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        console.log({ nickname, password });

        if (!nickname || !password) {
            return res.status(400).json({
                msg: 'nickname и password - обязательные поля'
            });
        }

        const existedUser = await User.findOne({ nickname });

        console.log({ existedUser });

        if (existedUser) {
            return res.status(400).json({ message: 'Пользователь с таким никнеймом уже существует' });
        }

        const createdUser = new User({
            nickname,
            password: bcrypt.hashSync(password.toString(), 3)
        });

        createdUser.save();

        return res.json(createdUser);
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            msg: error.toString()
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        if (!nickname || !password) {
            return res.status(400).json({
                msg: 'nickname и password - обязательные поля'
            });
        }

        const user = await User.findOne({ nickname });

        if (!user) {
            return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
        }

        if (!bcrypt.compareSync(password.toString(), user.password)) {
            return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
        }

        const payload = {
            id: user.id,
            nickname: user.nickname
        };

        const token = jwt.sign(payload, 'secret', { expiresIn: '24h' });

        return res.json({ token });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            msg: error.toString()
        });
    }
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => console.log('Auth service started'));
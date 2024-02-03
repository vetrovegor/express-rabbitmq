import 'dotenv/config';
import amqp from "amqplib";

const conn = await amqp.connect(process.env.RABBITMQ_URL);

export const channel = await conn.createChannel();
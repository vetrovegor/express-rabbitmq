import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer')) {
            return res.sendStatus(401);
        }

        const token = authorization.split(' ')[1];

        if (!token) {
            return res.sendStatus(401);
        }

        const user = jwt.verify(token, "secret");

        req.user = user;

        next();
    } catch (error) {
        return res.sendStatus(401);
    }
};
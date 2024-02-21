const express = require('express');
const router = express.Router();
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const isLogin = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({result: "Please Login!"})
    }
    next()
}
router.post("/start", isLogin, async (req, res, next) => {
    const {bookId} = req.body;
    try {
        const rental = await prisma.rental.findFirst({
            where: {
                bookId,
                returnDate: null,
            },
        });
        if (rental) {
            return res.status(409).send(" 貸出中");
        }

        const now = new Date();
        const returnDeadline = new Date(now);
        returnDeadline.setDate(now.getDate() + 7);

        const rentalStart = await prisma.rental.create({
            data: {
                bookId,
                userId: req.user.id,
                returnDeadline,
            },
        });

        const resposen = {
            id: Number(rentalStart.id),
            bookId,
            rentalDate: rentalStart.rentalDate,
            returnDeadline: rentalStart.returnDeadline
        }

        return res.status(200).json(resposen)
    } catch (e) {
        return res.status(400).json(e)
    }
});


module.exports = router;

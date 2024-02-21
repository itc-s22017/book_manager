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

router.put("/return", isLogin, async (req, res, next) => {
    const {rentalId} = req.body;

    try {
        const rental = await prisma.rental.findFirst({
            where: {
                id: rentalId,
                returnDate: null
            },
            include: {
                user: {
                    select: {
                        id: true
                    }
                }
            }
        })

        if (!rental) {
            return res.status(404).json({result: "NG"});
        }

        if (req.user.id !== rental.user.id.toString()) {
            return res.status(400).json({result: "NG"});
        }

        const updatedRental = await prisma.rental.update({
            where: {
                id: rentalId,
                returnDate: null
            },
            data: {
                returnDate: new Date()
            }
        });
        // console.log(typeof req.user.id,typeof rental.user.id.toString())
        return res.status(200).json({result: "OK"});

    } catch (e) {
        return res.status(400).json({result: "NG"});
    }
});

router.get("/current", isLogin, async (req, res, next) => {
    const currentRental = await prisma.rental.findMany({
        where: {
            returnDate: null
        },
        include: {
            book: {
                select: {
                    title: true
                }
            }
        }
    });

    const response = currentRental.map(info => {
        return {
            rentalId: Number(info.id),
            bookId: Number(info.bookId),
            bookName: info.book.title,
            rentalDate: info.rentalDate,
            returnDeadline: info.returnDeadline
        }
    })

    return res.status(200).json({rentalBooks: response})
});


module.exports = router;

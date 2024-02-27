const express = require('express');
const router = express.Router();
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({result: "you are not admin"})
    }
    next()
}

router.post("/book/create", isAdmin, async (req, res, next) => {
    const {isbn13, title, publishDate, author} = req.body;
    try {
        await prisma.book.create({
            data: {
                isbn13,
                title,
                publishDate: new Date(publishDate),
                author
            }
        })
        return res.status(201).json({result: "OK"})
    } catch (e) {
        console.log(e)
        return res.status(400).json({result: "NG"})

    }
})

router.put("/book/update", isAdmin, async (req, res, next) => {
    const {isbn13, title, publishDate, author, bookId} = req.body;
    try {
        await prisma.book.update({
            where: {
                id: bookId,
            },
            data: {
                isbn13,
                title,
                publishDate: new Date(publishDate),
                author
            }
        })
        return res.status(201).json({result: "OK"})
    } catch (e) {
        console.log(e)
        return res.status(400).json({result: "NG"})

    }
});

router.get("/rental/current", isAdmin, async (req, res, next) => {
    const allUsersCurrentRental = await prisma.rental.findMany({
        where: {
            returnDate: null,
        },
        include: {
            book: {
                select: {
                    title: true
                },
            },
            user: {
                select: {
                    name: true
                }
            }
        }
    });

    const response = allUsersCurrentRental.map(info => {
        return {
            rentalId: Number(info.id),
            userId: Number(info.userId),
            userName: info.user.name,
            bookId: Number(info.bookId),
            bookName: info.book.title,
            rentalDate: info.rentalDate,
            returnDeadline: info.returnDeadline
        }
    })
    return res.status(200).json({rentalBooks: response})
});

router.get("/rental/current/:uid", isAdmin, async (req, res, next) => {
    const {uid} = req.params;

    const userRentals = await prisma.rental.findMany({
        where: {
            returnDate: null,
            userId: uid
        },
        include: {
            book: {
                select: {
                    title: true
                }
            },
            user: {
                select: {
                    name: true
                }
            }
        }
    });

    const response = userRentals.map(info => {
        return {
            rentalId: Number(info.id),
            bookId: Number(info.bookId),
            bookName: info.book.title,
            rentalDate: info.rentalDate,
            returnDeadline: info.returnDeadline
        }
    });

    const userName = userRentals[0]?.user.name;

    return res.status(200).json({userId: Number(uid), userName, response})
});


module.exports = router;

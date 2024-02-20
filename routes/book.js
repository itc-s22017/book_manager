const express = require('express');
const router = express.Router();
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const pagesize = 5;

const isLogin = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({result: "Please Login!"})
    }
    next()
}
router.get("/list", isLogin, async (req, res, next) => {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const skip = pagesize * (page - 1);
    let bookRentals = await prisma.book.findMany({
        skip,
        take: pagesize,
        select: {
            id: true,
            title: true,
            author: true,
            Rental: {
                select: {
                    returnDate: true
                }
            }
        }
    });

    bookRentals = bookRentals.map(book => ({
        ...book,
        isRental: book.Rental.some(rental => rental.returnDate === null)
    }));

    bookRentals = bookRentals.map(({ id, title, author, isRental }) => ({
        id: Number(id),
        title,
        author,
        isRental
    }));

    return res.json({books:bookRentals});
})


module.exports = router;

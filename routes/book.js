const express = require('express');
const router = express.Router();
const {PrismaClient} = require("@prisma/client");
const {login} = require("passport/lib/http/request");
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
    const totalCount = await prisma.book.count();
    const maxPage = Math.ceil(totalCount / pagesize);
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
        isRental: book.Rental.some(rental => rental.returnDate === null) ? "true" : "false"
    }));

    bookRentals = bookRentals.map(({id, title, author, isRental}) => ({
        id:Number(id),
        title,
        author,
        isRental
    }));

    return res.status(200).json({books: bookRentals, maxPage});
})

router.get("/detail/:id", login, async (req, res, next) => {
    const id = +req.params.id
    // const rentalInfo = await prisma.rental.findFirst({
    //     where: {
    //         bookId: id,
    //         returnDate: null
    //     },
    //     include: {
    //         user: true
    //     }
    // })
    //
    // const bookDetail = await prisma.book.findUnique({
    //     where: {
    //         id
    //     }
    // })
    // const rInfo = rentalInfo
    //     ? {
    //         username: rentalInfo.user.name,
    //         rentalDate: rentalInfo.rentalDate,
    //         returnDeadline: rentalInfo.returnDeadline
    //     }
    //     : null;
    // const result = {
    //     ...bookDetail,
    //     rentalInfo:rInfo
    // }
    // console.log(result)

    const bookDetails = await prisma.book.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            isbn13: true,
            title: true,
            author: true,
            publishDate: true,
            Rental: {
                where: {
                    returnDate: null // returnDateがnullのレンタル情報のみを取得
                },
                select: {
                    rentalDate: true,
                    returnDeadline: true,
                    user: {
                        select: {
                            name: true,

                        }
                    }
                }
            }
        }
    });
    const isRental = bookDetails.Rental[0];
    const rInfo = isRental ? {
        userName: isRental.user.name,
        rentalDate: isRental.rentalDate,
        returnDeadline: isRental.returnDeadline
    } : null;

    const response = {
        id: Number(bookDetails.id),
        isbn13: Number(bookDetails.isbn13),
        title: bookDetails.title,
        author: bookDetails.author,
        publishDate: bookDetails.publishDate,
        rentalInfo: rInfo
    };
    return res.status(200).json(response);
});

module.exports = router;

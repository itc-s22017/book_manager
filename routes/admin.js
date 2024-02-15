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

router.post("/book/update", async (req, res, next) => {
    const {isbn13, title, publishDate, author,bookId} = req.body;
    try {
        await prisma.book.update({
            where:{
                id:bookId
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
})


module.exports = router;

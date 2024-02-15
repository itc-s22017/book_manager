const express = require('express');
const router = express.Router();
const {calcHash, generateSalt} = require("../utils/auth");
const { PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();



/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post("/register", async (req, res, next) => {
    const {email, pass} = req.body;
    const name = req.body?.name
    try {
        const salt = generateSalt();
        const hashedPassword = calcHash(pass, salt);
        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                salt
            },
        });
        return res.status(201).json({ result: 'created' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ result: 'NG', message: 'メールアドレス重複エラー' });
        }
        return res.status(500).json({ result: 'NG' });
    }
});


module.exports = router;

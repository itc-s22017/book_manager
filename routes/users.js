const express = require('express');
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const {calcHash, generateSalt} = require("../utils/auth");
const {PrismaClient} = require("@prisma/client");
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
        return res.status(201).json({result: 'created'});
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({result: 'NG', message: 'メールアドレス重複エラー'});
        }
        return res.status(500).json({result: 'NG'});
    }
});

router.post("/login", async (req, res, next) => {
    passport.authenticate('local', {keepSessionInfo: true, failWithError: true}, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({result: "NG"});
        }
        req.logIn(user, {keepSessionInfo: true}, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            return res.json({result: 'OK', isAdmin: user});
        });
    })(req, res, next);
})


module.exports = router;

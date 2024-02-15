const LocalStrategy = require("passport-local");
const { PrismaClient } = require("@prisma/client");
const crypto = require("node:crypto")
const N = Math.pow(2, 17);
const maxmem = 144 * 1024 * 1024;
const keyLen = 192;
const saltSize = 64;


const generateSalt = () => crypto.randomBytes(saltSize);


const calcHash = (plain, salt) => {
    const normalized = plain.normalize();
    const hash = crypto.scryptSync(normalized, salt, keyLen, {N, maxmem});
    if (!hash) {
        throw Error("ハッシュ計算エラー");
    }
    return hash;
};
const config = passport => {
    const prisma = new PrismaClient();
    // 認証処理の実装
    passport.use(new LocalStrategy(
        { emailField: "email", passwordField: "pass" },
        async (email, password, cb) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { email }
                });
                if (!user) {
                    return cb(null, false, { message: "ユーザ名かパスワードが違います" });
                }
                const hashedPassword = calcHash(password, user.salt);
                if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                    return cb(null, false, {message: "ユーザ名かパスワードが違います2"});
                }
                // ユーザもパスワードも正しい場合
                return cb(null, user);
            } catch (e) {
                return cb(e);
            }
        }
    ));

    // // ユーザ情報をセッションに保存するルールの定義
    passport.serializeUser((user, done) => {
        process.nextTick(() => {
            done(null, { id: user.id, name: user.name });
        });
    });

    // // セッションからユーザ情報を復元するルールの定義
    passport.deserializeUser((user, done) => {
        process.nextTick(() => {
            return done(null, user);
        });
    });

    return (req, res, next) => {
        next();
    }
}

module.exports = { config, generateSalt, calcHash };

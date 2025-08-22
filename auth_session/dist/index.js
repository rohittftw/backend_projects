"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const app = (0, express_1.default)();
const port = 3000;
const mongoURI = "mongodb://localhost:27017/";
require("express-session");
app.use(express_1.default.json()); // for parsing application/json
app.use(express_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
(0, db_1.connectDB)();
app.use((0, express_session_1.default)({
    secret: "rowdy_rathore",
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: mongoURI, // MongoDB connection URI
        collectionName: 'sessions', // Collection where sessions will be stored
        ttl: 14 * 24 * 60 * 60, // TTL for session in seconds (14 days here)
    }),
    cookie: {
        httpOnly: true, // Only accessible by the server (not client-side JavaScript)
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        maxAge: 14 * 24 * 60 * 60 * 1000, // Cookie expiry time (14 days)
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        if (!username) {
            return res.json({ msg: "please provide username" });
        }
        if (!password) {
            return res.json({ msg: "please provide password" });
        }
        const user = yield db_1.User.findOne({ username });
        if (!user) {
            return res.json({ msg: "user does not exist" });
        }
        const matchedPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!matchedPassword) {
            return res.json({ msg: "password is wrong" });
        }
        req.session.User = { username };
        return res.json({ msg: "login success" });
    }
    catch (error) {
        return res.json({ error });
    }
}));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ msg: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ msg: 'Logged out successfully' });
    });
});
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

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
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const port = 3000;
(0, db_1.connectDB)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
const hash_secret_key = "rowdy_rathore";
app.get("/signup", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "signup.html"));
});
app.post("/sign-up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        if (!username) {
            return res.json({ msg: "please provide username" });
        }
        if (!password) {
            return res.json({ msg: "please provide password" });
        }
        const user = yield db_1.User.findOne({ username });
        if (user) {
            return res.json({ msg: "user already exist" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new db_1.User({
            username,
            password: hashedPassword
        });
        yield newUser.save();
        return res.json({ newUser });
    }
    catch (error) {
        return res.json({ error });
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
        const token = jsonwebtoken_1.default.sign({
            username: user.username,
            password: user.password
        }, hash_secret_key, {
            expiresIn: "1h"
        });
        return res.json({ token });
    }
    catch (error) {
        return res.json({ error });
    }
}));
app.listen(port, () => {
    console.log(`Server is runnig on ${port}`);
});

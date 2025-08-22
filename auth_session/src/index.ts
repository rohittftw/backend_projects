import express, { Request, Response } from "express";
import { User,connectDB } from "./db";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import  session  from "express-session";
import MongoStore from "connect-mongo";
const app = express();
const port = 3000;
const mongoURI = "mongodb://localhost:27017/";
import 'express-session';
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

declare module 'express-session' {
  interface SessionData {
    User?: { username: string };
  }
}
connectDB();
interface UserRequest{
  username:string,
  password:string
}

app.use(session({
  secret:"rowdy_rathore",
  resave:false,
  saveUninitialized:false,
  store: MongoStore.create({
      mongoUrl: mongoURI, // MongoDB connection URI
      collectionName: 'sessions', // Collection where sessions will be stored
      ttl: 14 * 24 * 60 * 60, // TTL for session in seconds (14 days here)
    }),

  cookie: {
      httpOnly: true, // Only accessible by the server (not client-side JavaScript)
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
      maxAge: 14 * 24 * 60 * 60 * 1000, // Cookie expiry time (14 days)
    }

}))

app.post("/login",async(req:Request<{},{},UserRequest>,res:Response):Promise<Response>=>{
  const { username, password } = req.body;
  try{
    if(!username){
      return res.json({ msg: "please provide username" });
    }
    if(!password){
      return res.json({ msg:"please provide password"});
    }

    const user = await User.findOne({ username });
    if(!user){
      return res.json({ msg: "user does not exist" });
    }

    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) {
      return res.json({ msg: "password is wrong" });
    }

    req.session.User = { username };

    return res.json({ msg:"login success"});
  }catch(error){
    return res.json({ error });
  }


})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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


app.listen(port,()=>{
  console.log(`Server is running on ${port}`);
})

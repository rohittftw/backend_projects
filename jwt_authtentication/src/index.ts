import express, { json ,Request,Response} from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { connectDB,User } from "./db";
const app = express();
const port = 3000;

connectDB();
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const hash_secret_key = "rowdy_rathore";

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

interface UserRequest{
  username:string,
  password:string
}
app.post("/sign-up",async (req:Request<{},{},UserRequest>,res:Response):Promise<Response>=>{
  const { username, password } = req.body;
  try{
    if(!username){
      return res.json({ msg: "please provide username" });
    }
    if(!password){
      return res.json({ msg:"please provide password"});
    }

    const user = await User.findOne({ username });
    if(user){
      return res.json({ msg: "user already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password:hashedPassword
    })

    await newUser.save();

    return res.json({ newUser });
  }catch(error){
    return res.json({ error });
  }
})

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

    const token = jwt.sign({
      username:user.username,
      password:user.password
    },
    hash_secret_key,
    {
      expiresIn:"1h"
    })

    return res.json({ token });
  }catch(error){
    return res.json({ error });
  }


})

app.listen(port,()=>{
  console.log(`Server is runnig on ${port}`);
})

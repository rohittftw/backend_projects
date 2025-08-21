import mongoose,{Document,Schema} from "mongoose";
const connectionString = "mongodb://localhost:27017/";


interface IUser extends Document{
  username:string,
  password:string

}

const UserSchema = new Schema<IUser>({
  username: { type: String,required:true },
  password:{type:String,required:true}
});

export const User = mongoose.model<IUser>('User', UserSchema);
export const connectDB = async()=>{
  try{
    await mongoose.connect(connectionString);
    console.log("mongodb connected successfully");
  }catch(error){
    console.log(error);
  }
}

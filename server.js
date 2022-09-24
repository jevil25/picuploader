//packages
const express = require("express"); //interact with html file
const bodyParser=require("body-parser"); //to get data from user
const mongoose=require("mongoose"); //package to connect to db
const bcrypt=require("bcryptjs");//package to hash the password (one way)
mongoose.connect("mongodb+srv://jevil2002:aaron2002@jevil257.lipykl5.mongodb.net/test",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    //useCreateIndex:true
}).then(()=>{
    console.log("connection sucessfull");
}).catch((e)=>{
    console.log(e);
});
const { response } = require("express");
//db declaration
const regSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    number:{
        type:Number,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

regSchema.pre("save",async function(next){
    this.password= await bcrypt.hash(this.password,10);
    next();
});

const Register = new mongoose.model("Project1", regSchema);

module.exports=Register;

const app=express();
app.use(express.static(__dirname + '/public'));
const path=__dirname + '/public';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());

app.get("/",function(req,res){
    res.sendFile(path+"/index.html");
});

app.post("/send",async function(req,res){
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await Register.findOne({email:email});
        const verify=await bcrypt.compare(password,useremail.password);
        if(verify){
            res.status(201).sendFile(path+"/sucess.html");
        }else{
            res.send("invalid email or password")
        }
    }catch(error){
        res.status(400).send("invalid email or password");
    }
});

app.post("/forpass",function(req,res){
    res.sendFile(path+"/fp.html");
});

app.post("/signup",function(req,res){
    res.sendFile(path+"/signup.html");
})

app.post("/contact",function(req,res){
    res.sendFile(path+"/contact.html");
});

//signup data sent to db
app.post("/senddata",async function(req,res){
    try{
        const password=req.body.password;
        const confirmpassword=req.body.confirmpassword;
        if(password===confirmpassword){
            const register1= new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                number:req.body.number,
                gender:req.body.gender,
                password:password
            })
            const registered=await register1.save();
            res.status(201).sendFile(path+"/index.html");
        }else{
            res.send("passwords are not same");
        }
    }catch(e){
        res.status(400).send(e);
    }
    res.sendFile(path+"/index.html");
})

app.post("/check", async function(req,res){
    try{
        const email=req.body.email;
        const username=await Register.findOne({email:email});
        res.send("Your password is "+username.password);
    }catch(e){
        res.send("No such email exists");
    }
})

app.listen(3000,function(){
    console.log("server is live on 3000")
});
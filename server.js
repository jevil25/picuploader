//packages
const express = require("express"); //interact with html file
const bodyParser=require("body-parser"); //to get data from user
const mongoose=require("mongoose"); //package to connect to db
const bcrypt=require("bcryptjs");//package to hash the password (one way)
const multer = require('multer');//package to upload and fetch images
const fs=require("fs");//package to read files given by the user
const hbs=require("express-handlebars");//used for hbs file soo as to use js componenets for displaying images
// let global_id;//used to store id to retrieve images
const {execSync} = require('child_process');//used to cause delays and sleeps
const cookieParser = require("cookie-parser");//used to store cookies for user sessions
const sessions = require('express-session');//used to create sessions
const oneDay = 1000 * 60 * 60 * 24;//1 day time for new sessions

mongoose.connect("mongodb+srv://jevil2002:aaron2002@jevil257.lipykl5.mongodb.net/test",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    //useCreateIndex:true
}).then(()=>{
    console.log("connection sucessfull");
}).catch((e)=>{
    console.log(e);
});

//db declaration
const regSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
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
    },
    recoveryCode:{
        type:String,
        required:true
    }
});

const imageSchema=new mongoose.Schema({
    filename:{
        type:String
    },
    imageBased64:{
        type:String
    },
    contentType:{
        type:String
    },
    email:{
        type:String
    }
})

regSchema.pre("save",async function(next){
    this.password= await bcrypt.hash(this.password,10);
    this.recoveryCode= await bcrypt.hash(this.recoveryCode, 10);
    next();
});

const Register = new mongoose.model("Project1", regSchema);
const images=new mongoose.model("pics",imageSchema);

module.exports={Register,images}; //sends data to database

const app=express();
app.use(express.static(__dirname));
app.use(cookieParser());
const path=__dirname+"/public/views";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(sessions({ //this the data sent and stored in brower cookie
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

var session;
app.get('/',function(req,res){ //used to identify user sessions
    session=req.session;
    if(session.userid){
        res.sendFile(path+"/sucess.html");
    }else
    res.sendFile(path+"/index.html");
});

app.post("/index",function(req,res){
    res.sendFile(path+"/index.html");
    // global_id=null;
});

app.post("/logout",function(req,res){
    console.log("bye")
    req.session.destroy();
    res.sendFile(path+"/index.html");
    // global_id=null;
});

app.post("/send",async function(req,res){//login verification
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await Register.findOne({email:email});
        const verify=await bcrypt.compare(password,useremail.password);
        if(verify){
            // global_id=email;
            session=req.session;
            session.userid=useremail.email;
            console.log(req.session)
            res.status(201).sendFile(path+"/sucess.html");
        }else{
            res.send("invalid email or password")
        }
    }catch(error){
        res.status(400).send(error);
    }
});

//these routes for user interaction

app.post("/forpass",function(req,res){
    res.sendFile(path+"/fp.html");
});

app.post("/signup",function(req,res){
    res.sendFile(path+"/signup.html");
})

app.post("/contact",function(req,res){
    res.sendFile(path+"/contact.html");
})
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
                password:password,
                recoveryCode:req.body.recoveryCode
            })
            const registered=await register1.save();
            res.status(201).sendFile(path+"/index.html");
        }else{
            res.send("passwords are not same");
        }
    }catch(e){
        res.status(400).send(e);
    }
})

app.post("/reset", async function(req,res){// used to reset the password
    try{
        const password=req.body.password;
        const confirmpassword=req.body.confirmpassword;
        if(password===confirmpassword){
        const newpassword=await bcrypt.hash(password,10)
        try{
        await Register.updateOne({email:session.userid},{
            $set:{
                password:newpassword                 //password field gets updated in db
            }
        });
        }catch(err){
            res.status(400).send(err);
            console.log("upadating error")
        }
        res.status(201).sendFile(path+"/sucess.html");
        }else{
            res.send("passwords are not same");
        }
    }catch(error){
        res.status(400).send(error);
        console.log(error);
    }
});

app.post("/check", async function(req,res){   //this is used to check if credentials are proper to change password
    try{
        const email=req.body.email;
        const recoveryCode=req.body.recoveryCode;
        const username=await Register.findOne({email:email});
        const verify=await bcrypt.compare(recoveryCode,username.recoveryCode);
        if(verify){
            // global_id=email;
            res.status(201).sendFile(path+"/reset.html");
        }else{
            res.send("invalid email or recovery code")
        }
    }catch(e){
        res.send("No such email exists");
    }
})

app.listen(3000,function(){
    console.log("server is live on 3000")
});

//set local storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.substring(file.originalname.lastIndexOf('.'));
      cb(null, file.fieldname+'-'+Date.now()+ext);
    }
})
 var upload = multer({ storage: storage })
 let img;
 var array=[];
//set database storage
app.use('/uploads',express.static('uploads'));
//used to upload pics to db
app.post('/upload', upload.array("images",100),async function (req, res, next) {
    // req.files is array of `profile-files` files
    // req.body will contain the text fields, if there were any
    //var response = '<a href="/pictures">View pics</a><br>'
    //response += "Files uploaded successfully.<br>"
    //convert image to base64 encoding
    let files= req.files;
    let imgArray = files.map((file)=>{
        img=fs.readFileSync(file.path);
        return img.toString('base64');  //image encoded to base64
    })
    imgArray.map(async (src,index)=>{
        //sending data to db
        let finalimg=new images({        //schema to send image to database
            filename:files[index].originalname,
            contentType:files[index].mimetype,
            imageBased64:src,
            email:session.userid
        });
        let result=new images(finalimg);
        await result.save();
    })
    })

    app.set('view engine', 'hbs') //view engine for handlebars page

    app.post('/pictures',async (req,res)=>{  //used when my pictures is clicked
        const useremail=await images.find({email:session.userid});  //finds all the images of logged in user
        return res.render(path+"/pictures.hbs",{images:useremail});  //sends details to hbs file
    })    
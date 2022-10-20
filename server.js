//packages
const express = require("express"); //interact with html file
const bodyParser=require("body-parser"); //to get data from user
const mongoose=require("mongoose"); //package to connect to db
const bcrypt=require("bcryptjs");//package to hash the password (one way)
const multer = require('multer');//package to upload and fetch images
const fs=require("fs");//package to read files given by the user
const hbs=require("express-handlebars");//used for hbs file soo as to use js componenets for displaying images
let global_id;//used to store id to retrieve images

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
    next();
});

const Register = new mongoose.model("Project1", regSchema);
const images=new mongoose.model("pics",imageSchema);

module.exports={Register,images};


const app=express();
app.use(express.static(__dirname + '/public'));
const path=__dirname + '/public';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());

app.get("/",function(req,res){
    res.render(path+"/index.html");
});

app.post("/send",async function(req,res){
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await Register.findOne({email:email});
        const verify=await bcrypt.compare(password,useremail.password);
        if(verify){
            global_id=email;
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
        return img.toString('base64');
    })
    imgArray.map(async (src,index)=>{
        //sending data to db
        let finalimg=new images({
            filename:files[index].originalname,
            contentType:files[index].mimetype,
            imageBased64:src,
            email:global_id
        });
        let result=new images(finalimg);
        return result.save();
        })
        app.set('view engine', 'hbs') //view engine for handlebars page
        const useremail=await images.find({email:global_id}); //finds all the images of logged in user
        return res.render(path+"/pictures.hbs",{images:useremail}); //sends details to hbs file
    })

    app.set('view engine', 'hbs') //view engine for handlebars page

    app.post('/pictures',async (req,res)=>{  //used when my pictures is clicked
        const useremail=await images.find({email:global_id});  //finds all the images of logged in user
        return res.render(path+"/pictures.hbs",{images:useremail});  //sends details to hbs file
    })
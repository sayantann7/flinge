const express = require('express');
const app = express();
const port = 3000;
const userModel = require('./models/users');
const postModel = require('./models/posts');
const fanPageModel = require('./models/fanpage');
const passport = require('passport');
const flash = require('connect-flash');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const expressSession = require('express-session');
const upload = require("./models/multer");


app.set("view engine","ejs");
app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true }));

app.use(flash());

app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.post("/register", function (req, res) {
    const { username, email, fullname } = req.body;
    const userData = new userModel({ username, email, fullname });
  
    userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      })
    })
});

app.post("/login",passport.authenticate("local",{
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}), function(req,res){});

app.get("/",function(req,res){
    res.render("signup");
});

app.get("/login",function(req,res){
    res.render("login",{error:req.flash('error')});
});

app.get("/home",isLoggedIn,function(req,res){
    res.render("index");
});

app.get("/profile",isLoggedIn,async function(req,res){
    const user = await userModel.findOne({
        username : req.session.passport.user
    });
    res.render("profile",{user:user,joinedDate:formatJoinedDate(user.createdAt)});
});

app.post("/edit-about",isLoggedIn,async function(req,res){
    const user = await userModel.findOne({
        username : req.session.passport.user
    });
    user.about.genres = req.body.genres;
    user.about.directors = req.body.directors;
    await user.save();
    res.redirect("/profile");
});

app.post("/edit-bio",isLoggedIn,async function(req,res){
    const user = await userModel.findOne({
        username : req.session.passport.user
    });
    user.bio = req.body.bio;
    await user.save();
    res.redirect("/profile");
});

app.post("/edit-profilePic",isLoggedIn,upload.single("profilePic"),async function(req,res){
    if (!req.file){
        return res.status(400).send("No file uploaded");
    }
    const user = await userModel.findOne({username:req.session.passport.user});
    user.profilePic = req.file.filename;
    await user.save();
    res.redirect("/profile");
});

app.get("/fanpage",isLoggedIn,function(req,res){
    res.render("fanpage");
});

app.get("/logout",function(req,res,next){
    req.logout(function(err){
        if (err) { return next(err);}
        res.redirect('/');
    });
});

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function formatJoinedDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

app.listen(port,()=>{
    console.log("Server started on port 3000");
});
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const User = require('./models/user');
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/kollabkaro', { useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        console.log("MONGO CONNECTION IS OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const app = express();

app.set('view engine', 'ejs');
app.set('views','views');

app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'notagoodsecret'}))

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); 

const requireLogin = (req, res, next) => {
  if(!req.session.user_id){
      return res.redirect('/login');
  }
  next();
}

app.post('/login', async (req,res) => {
  const { username,password } = req.body;
  const user = await User.findOne({ username });
  const validPassword = await bcrypt.compare(password, user.password);
  if(validPassword){
      req.session.user_id = user._id;
      // res.send("YAY WELCOME!!");
      res.redirect('/secret')
  }else{
      // res.send("TRY AGAIN!");
      res.redirect('/login');
  }
})

app.post('/signup', async (req, res) =>{
  const {password, username, email } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
      email,
      username,
      password: hash
  })
  await user.save();
  req.session.user_id = user._id;
  res.redirect('/')
})

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
})

app.get('/secret', requireLogin, (req,res) => {
  res.render('secret');
})

app.get("/", function(req,res){
    res.render('home');
  });

app.get("/main", function(req,res){
    res.render('main');
  });

app.get("/people", function(req,res){
    res.render('people');
  });

app.get("/slides", function(req,res){
    res.render('slides');
  });

app.get("/stat", function(req,res){
    res.render('stat');
});

app.get("/about", function(req,res){
    res.render('about');
  });

app.get("/login", function(req,res){
    res.render('login');
  });

app.get("/signup", function(req,res){
    res.render('signup');
  });



app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
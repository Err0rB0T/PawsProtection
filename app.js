

var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/Campgrounds");
var methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoosse = require('passport-local-mongoose');
var Comment = require("./models/comments");
var User = require("./models/user");
var session = require('express-session');
flash = require("connect-flash");

app.use(session({
    
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
}));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


var fs = require('fs');
var path = require('path');
require('dotenv/config');
var multer = require('multer');
const comments = require('./models/comments');
const { isBuffer } = require('util');
const Campgrounds = require('./models/Campgrounds');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });
var update = multer({ storage: storage });


app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost/yelp_camp",{ useNewUrlParser: true }, { useUnifiedTopology: true });




app.get("/",function(req,res){
    res.render("landing.ejs");
});

//======================================================================================================

app.get("/campgrounds",function(req,res){
    Campground.find({},function(err,camps){
        if(err)
        console.log(err);
        else
        res.render("campgrounds.ejs",{camps:camps,currentUser:req.user});
    });
    
});

app.post('/campgrounds',isLoggedIn , upload.single('image'), (req, res, next) => {
  console.log(req.file);
  var author = {
      id: req.user.id,
      username: req.user.username
  };
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        },
        author:author
    }
    Campground.create(obj, (err, item) => {
        if (err) {
          req.flash("error", err.message);
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/campgrounds');
        }
    });
});

app.get("/campgrounds/new",isLoggedIn ,function(req,res){
    res.render("new.ejs");
})

app.get("/campgrounds/:id",function(req,res){
     Campground.findById(req.params.id).populate("comments").exec(function(err,camp){
         if(err)
         { req.flash("error", err.message);
         console.log(err);
     }
         else 
         res.render("show.ejs",{image:camp});
     });
    
});

app.get("/campgrounds/:id/edit",checkOwner,function(req,res){

  Campground.findById(req.params.id,function(err,image){
   if(err)
   {
    req.flash("error", err.message);
   res.redirect("/campgrounds")
   }
   else
   res.render("editcamps",{image:image});
  });
    
});

app.put("/campgrounds/:id", upload.single('image'), checkOwner,(req, res, next) => {
  
  
 if(req.file){
  var newobj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: 'image/png'
    }
     };
    
     Campground.findByIdAndUpdate(req.params.id,newobj,function(err,UpdatedCampground){
       if(err)
       {
        req.flash("error", err.message);
        res.redirect("/campgrounds/" + UpdatedCampground._id);
       }
        else
        res.redirect("/campgrounds/" + UpdatedCampground._id);

     });
    }
    else{
      var newobj = {
        name: req.body.name,
        desc: req.body.desc
      };
      Campground.findByIdAndUpdate(req.params.id,newobj,function(err,UpdatedCampground){
        if(err)
         res.redirect("/campgrounds/" + UpdatedCampground._id);
         else
         res.redirect("/campgrounds/" + UpdatedCampground._id);
 

    });
  }
   

});

app.delete("/campgrounds/:id",checkOwner,function(req,res){
      Campground.findByIdAndRemove(req.params.id,function(err){
        if(err)
        res.redirect("/campgrounds");
        else
        res.redirect("/campgrounds");
      });
});

//==========================================================================================================
app.get("/campgrounds/:id/comments/new",isLoggedIn ,function(req,res){
    Campground.findById(req.params.id,function(err,camp){
        if(err)
        {
          req.flash("error", err.message);
        console.log(err);}
        else 
        res.render("newcomment.ejs",{image:camp});
    });
});

app.post("/campgrounds/:id/comments",isLoggedIn ,function(req,res){
    var newComment = {text:req.body.comment,
        author:{
            id:req.user._id,
            username: req.user.username
        }};  
    Campground.findById(req.params.id,function(err,camp){
        if(err)
        {
          req.flash("error", err.message);
        console.log(err);}
        else {
            Comment.create(newComment,function(err,comment){
        if(err)
        console.log(err);
        else{
        console.log(comment);
        comment.save();
        camp.comments.push(comment);
        camp.save();
        res.redirect("/campgrounds/"+camp._id);
        }
    });
}

    


    });

});
//==========================================================================================================
app.get("/register", function(req, res) {
    if (req.user) {
      return res.redirect("/campgrounds");
    } else {
      res.render("register.ejs");
    }
  });

  app.post("/register",  function(req, res) {
      var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        fullName: req.body.fullName
      
      });
      User.register(newUser, req.body.password, function(err, user) {
        if (err) {
          req.flash("error", err.message);
         console.log (err);
        }
        passport.authenticate("local")(req, res, function() {
          res.redirect("/campgrounds");
        
        });
      });
    });


     app.get("/login", function(req, res) {
        if (req.user) {
          return res.redirect("/campgrounds");
        } else {
          res.render("login.ejs");
        }
      });

      app.post(
        "/login",
        passport.authenticate("local", {
          successRedirect: "/campgrounds",
          failureRedirect: "/login",
          failureFlash: true
        }),
        function(req, res) {}
      );

      app.get("/logout", function(req, res) {
        req.logout();
        req.flash("success", "Logged Out");
        res.redirect("/campgrounds");
      });

      function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
         
          return next();
        }
        req.flash("error", "Please Log In");
        res.redirect("/login");
      };

      function checkOwner(req, res, next) {
         if(req.isAuthenticated())
         {
           Campground.findById(req.params.id,function(err,foundCamp){
             if(err){
              req.flash("error", err.message);
             res.redirect("back");
             }
             else{
             if(foundCamp.author.id.equals(req.user._id))
              next();
              else{
                req.flash("error",err.message);
              res.redirect("back");
              }
             }

           });
         }
         else
         res.redirect("back");
      };



//==========================================================================================================

app.listen(3000,function(){
    console.log("Running on server 3000");
});
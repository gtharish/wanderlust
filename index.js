const express = require("express");
const mongoose = require("mongoose");
const app = express();

const Listing = require("./models/listining.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const {isLoggedIn} = require("./middleware.js");
const {redirectUrl} = require("./middleware.js");
const port = 8080;

//
// ─── DATABASE CONNECTION ─────────────────────────────────────────────────────
//
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

//
// ─── SESSION CONFIG ───────────────────────────────────────────────────────────
//
const sessionConfig = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

//
// ─── VIEW ENGINE SETUP ───────────────────────────────────────────────────────
//
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//
// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
//
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash message global middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//



// Show all listings
app.get("/listings", async (req, res) => {
  const samplelistings = await Listing.find();
  res.render("listings/index.ejs", { samplelistings });
});

// Add form
app.get("/listings/add", isLoggedIn,(req, res) => {
  res.render("listings/add");
});

// Create new listing
app.post(
  "/listings",isLoggedIn,
  wrapAsync(async (req, res) => {
    const newlisting = new Listing(req.boy.items);
    newlisting.owner = req.user._id;
    await newlisting.save();
    // await Listing.create(req.body.items);
    req.flash("success", "Your new data is saved successfully!");
    res.redirect("/listings");
  })
);

// Edit listing
app.get("/listings/:id/edit",isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const items = await Listing.findById(id);
  res.render("listings/edit", { items });
});

// Update listing
app.put("/listings/:id",isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.items });
  res.redirect("/listings");
});

// Delete listing
app.delete("/listings/:id",isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

// Show listing details
app.get("/listings/:id/show", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show", { listing });
});

// Add review
app.post(
  "/listings/:id/reviews",isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    const review = new Review({
      rating: Number(req.body.rating),
      content: req.body.content,
    });

    await review.save();
    listing.reviews.push(review);
    await listing.save();

    console.log("Review saved successfully");
    res.send("Your review is posted successfully");
  })
);


// sign up route
app.get("/signup",(req,res)=>{
    res.render("listings/signup");
})

app.post("/signup",async(req,res)=>{

 let{username,email,password} = req.body;
 
 const newUser = new User({username,email});
 const registeredUser = await User.register(newUser,password);
 res.login(registeredUser,(req,res,next)=>{
  if(err){
    next(err);
  }
  else{
 req.flash("success","hello");
 res.redirect("/listings");
  }
 })

});

//login route 
app.get("/login",(req,res)=>{
  res.render("listings/login");
});
app.post("/login",redirectUrl,passport.authenticate("local",
  {failureRedirect:"/login",
    failureFlash:"true"
  }),async(req,res)=>{
    req.flash("success","welcome to wandelust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  })

  //logout
  app.get("/logout",(req,res,next)=>{
     req.logout((err)=>{
      if(err){
        next(err);
      }
      else{
        req.flash("success","you are successfully logout");
        res.redirect("/listings");
      }
     })
  })
//
// ─── 404 ERROR HANDLER ───────────────────────────────────────────────────────
//
app.use((req, res, next) => {
  next(new expressError(404, "Page not found!"));
});

//
// ─── GENERIC ERROR HANDLER ───────────────────────────────────────────────────
//
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).send(err.message);
});

app.listen(port, () => {
  console.log("Server running on port", port);
});

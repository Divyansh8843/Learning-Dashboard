const express=require("express")
const app=express()
const session=require("express-session")
const http = require('http');
const socketio = require('socket.io');
const cors=require("cors")
const User=require("./models/User")

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

require("dotenv").config()

const PORT = process.env.PORT || 3005
try {
  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
  })
} catch (error) {
  console.error("Error starting server:", error);
}

const passport=require("passport")
const LocalStrategy=require("passport-local").Strategy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const MONGO_URL=process.env.MONGO_URL
const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() 
{
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB Successfully")
}

const sessionOptions=
{
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}

app.use(session(sessionOptions))
// Routers 
const authRouter=require("./routes/AuthRouter")
const profileRouter=require("./routes/dashboard")
app.use("/api/auth",authRouter)
app.use("/api",profileRouter)
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/realtime', require('./routes/realtimeRoutes'));
//socket manager
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('io', io);


var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Use Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL, // Verify this value
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Ensures email is used instead of username
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        console.error("Local Authentication Error:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found during deserialization");
    done(null, user);
  } catch (error) {
    console.error("Deserialization Error:", error);
    done(error, null);
  }
});

app.use((req,res,next)=>
{
  res.locals.currUser=req.user;
  next()
})


// app.get("/api/auth/dashboard",(req,res,next)=>
// {
//     res.send("Dashboard page open successfully")
// })
app.get("*",(req,res,next)=>
{
     res.status(404).json({message: "Page not found"})
})

app.use((err,req,res,next)=>
{
    let {status=500,message="Something went wrong"}=err;
    res.status(status).send(message)
})


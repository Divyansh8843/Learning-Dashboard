const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
    try {
        console.log("register route start")
        const { name, email, password } = req.body;
        console.log(name,email,password)
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Enter all details" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).json({ message: "Login after registration failed" });
            }
            return res.status(200).json({ message: "User registered successfully" });
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Enter all details" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: "Login failed" });
            }
            return res.status(200).json({ message: "User logged in successfully" });
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports.logout = async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        return res.status(200).json({ message: "User logged out successfully" });
    });
};

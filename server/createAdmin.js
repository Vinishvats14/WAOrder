const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const create = async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt); // Password yahan badal sakte ho

    const newAdmin = new Admin({
        email: "admin@test.com",
        password: hashedPassword
    });

    await newAdmin.save();
    console.log("Admin Created! Now you can login.");
    process.exit();
};

create();
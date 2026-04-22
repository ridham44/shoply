const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
  if (existingAdmin) {
    console.log('Admin user already exists.');
    process.exit(0);
  }
  const admin = new User({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: '121212',
    mobile: '9725247990',
    gender: 'male'
  });
  await admin.save();
  console.log('Admin user created.');
  process.exit(0);
}

createAdmin();

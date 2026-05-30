/**
 * Run this script to promote a user to admin by email.
 * Usage: node makeAdmin.js your@email.com
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
    } else {
      console.log(`✅ ${user.name} (${user.email}) is now an ADMIN`);
    }
    mongoose.disconnect();
  })
  .catch(err => { console.error(err); process.exit(1); });

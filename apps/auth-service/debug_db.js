const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri ? 'URI Found' : 'URI Missing');

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to MongoDB', err);
    process.exit(1);
  });

const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in .env');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10
  });

  // enough logging for bootstrap stage
  console.log('MongoDB Connected Successfully');
};

module.exports = connectDB;
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const storeRoutes = require('./routes/storeRoutes');
const petRoutes = require('./routes/petRoutes');


const app = express();

// keeping middleware simple for now
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ message: 'GrowFriend API running!' });
});

app.use('/api/store', storeRoutes);
app.use('/api/pets', petRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server boot failed:', err.message);
    process.exit(1);
  }
})();
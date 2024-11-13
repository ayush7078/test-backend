const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const sequelize = require('./config/db');  

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());


sequelize.sync()
    .then(() => console.log('MySQL Database connected'))
    .catch((err) => console.error('Database connection error:', err));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

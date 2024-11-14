const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car API',
      version: '1.0.0',
      description: 'API documentation for managing cars and user authentication',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

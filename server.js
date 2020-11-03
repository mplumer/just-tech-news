const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;
// This uses Heroku's process.env.PORT value when deployed and 3001 when run locally. Having a dynamic port number is important, because it is very unlikely that the port number you hardcode (e.g., 3001) would be the port Heroku runs your app on.

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// turn on routes
app.use(routes);

// turn on connection to db and server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});
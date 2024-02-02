const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const keys = require('./config/keys')
const { redisClient } = require('./utils/redis')

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  User.findById("65bbd0d085af2662624fcb3e")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("user findById err: ", err);
    })
});

const authRoutes = require('./routes/auth')
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(authRoutes)
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(keys.mongoURI + '/' + process.env.DB_NAME)
  .then(() => {
    console.log("Connected to db! ", keys.mongoURI)
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "John",
          email: "john@email.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    if(!redisClient.isOpen) {
      redisClient.connect()
      .then(() => console.log(`redis connected at port ${keys.redisPort}`))
      .catch(err => console.log('redis connection error: ', err))
      .finally(() => console.log('redised!'))
    }
    const PORT = process.env.PORT
    app.listen(PORT, console.log(`listening at ${PORT}`));
  })
  .catch((err) => console.log("db connection error: ", err));

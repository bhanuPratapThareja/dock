const Product = require("../models/product");
const User = require("../models/user");
const {
  getFromRedis,
  saveInRedis,
  clearDataInRedis
} = require("../utils/redis");


exports.getProducts = async (req, res, next) => {
  let products;

  try {
    // const result = await Product.aggregate([
    //   { $project: { title: 1, price: 1, userId: 1 }},
    //   { $lookup: { from: 'users', foreignField: '_id', localField: 'userId', as: 'users' }}
    // ])

    // console.log('res: ', result[0])

    const query = Product.find().where('price')

    const cachedProducts = await getFromRedis(query, req.user.id);
    // const cachedProducts = null;
    // console.log('cachedProducts: ', cachedProducts)

    if (cachedProducts) {
      products = cachedProducts;
   
      console.log("SERVING FROM CACHE");
      console.log("cache products: ", products);
      console.log("SERVED FROM CACHE");

      // get userIds populated after fetching products

    } else {
      products = await query.exec();

      console.log('products: ', products)
      console.log("SERVING FROM MONGO DB");
      console.log("db products: ", products);
      console.log("SERVED FROM MONGO DB");
      await saveInRedis(query, req.user.id, products);
    }

    res.render("shop/product-list", {
      prods: products ?? [],
      pageTitle: "All Products",
      path: "/products",
    });

  } catch (error) {
    console.log('error:: ', error);
  }
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getCart = (req, res, next) => {
  const userId = req.user._id;
  User.findOne({ _id: userId }, { cart: 1 })
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.user._id;

  const updatedCartItems = req.user.cart.items.filter((item) => {
    if (item.productId.toString() !== prodId) {
      return item;
    }
  });

  User.updateOne(
    { _id: userId },
    { $set: { cart: { items: updatedCartItems } } }
  ).then((user) => {
    res.redirect("/cart");
  });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .addOrder()
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

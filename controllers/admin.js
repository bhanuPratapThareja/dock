const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user

  console.log('userIduserId:: ', userId)

  Product.create({title, price, description, imageUrl, userId })
    .then(result => {
      console.log('Created Product :)');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  try {
    await Product.updateOne({ _id: prodId }, {
      title, price, imageUrl, description
    })
    console.log('UPDATED PRODUCT!');
    res.redirect('/admin/products');
  } catch (error) {
    console.log('update errror: ', error)
  }  
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}, { title: 1, price: 1, description: 1 }).populate('userId', 'name')
    console.log(products)
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  } catch (error) {
    console.log(error)
  }
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findByIdAndDelete(prodId)
     .then(() => {
      console.log('DESTROYED PRODUCT!!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));

  // Product.deleteOne({ _id: prodId })
  //   .then(() => {
  //     console.log('DESTROYED PRODUCT');
  //     res.redirect('/admin/products');
  //   })
  //   .catch(err => console.log(err));
};

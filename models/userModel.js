const mongoose = require("mongoose")
const Product = require('../models/productModel');
const userSchema = mongoose.Schema({
  
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
    cart: {
        item: [{
            productId: {
                type: mongoose.Types.ObjectId,
                ref: 'product',
                required: true
            },
            qty: {
                type: Number,
                required: true
            },
            price: {
                type: Number
            },
        }],
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    wishlist: {
        item: [{
            productId: {
                type: mongoose.Types.ObjectId,
                ref: 'product',
                required: true
            },
            price: {
                type: Number
            },
        }]
    },
    wallet: {
        type: Number,
        default: 0
    },
    is_verified: {
        type: Number,
        default: 1,
        required: true
    }
});



userSchema.methods.addToCart = async function (product) {
  const cart = this.cart;
  const isExisting = cart.item.findIndex(objInItems => objInItems.productId.equals(product._id));

  if (isExisting >= 0) {
    cart.item[isExisting].qty += 1;
  } else {
    cart.item.push({
      productId: product._id,
      qty: 1,
      price: product.price
    });
  }

  cart.totalPrice += product.price;
  await this.save();
  console.log("User in schema:", this);
  return this;
};

userSchema.methods.removeFromCart = async function (productId) {
  const cart = this.cart;
  const isExisting = cart.item.findIndex(objInItems => objInItems.productId.equals(productId));

  if (isExisting >= 0) {
    const prod = await Product.findById(productId);
    cart.totalPrice -= prod.price * cart.item[isExisting].qty;
    cart.item.splice(isExisting, 1);
    await this.save();
    console.log("User in schema:", this);
  }

  return this;
};

userSchema.methods.addToWishlist = async function (product) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex(objInItems => objInItems.productId.equals(product._id));

  if (isExisting < 0) {
    wishlist.item.push({
      productId: product._id,
      price: product.price
    });
  }

  await this.save();
  return this;
};

userSchema.methods.updateCart = async function (id, qty) {
  const cart = this.cart;
  const product = await Product.findById(id);
  const index = cart.item.findIndex(objInItems => objInItems.productId.equals(product._id));

  if (index >= 0) {
    if (qty > cart.item[index].qty) {
      cart.item[index].qty += 1;
      cart.totalPrice += product.price;
    } else if (qty < cart.item[index].qty) {
      cart.item[index].qty -= 1;
      cart.totalPrice -= product.price;
    }

    await this.save();
  }

  return cart.totalPrice;
};
userSchema.methods.removefromWishlist = async function (productId) {
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  if (isExisting >= 0) {
      const prod = await Product.findById(productId)
      wishlist.item.splice(isExisting, 1)
      return this.save()
  }

}

module.exports = mongoose.model('user', userSchema)   
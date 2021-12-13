const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
	name: String,
	image: String,
	countInStock: Number,
});

exports.Product = new mongoose.model("Product", productSchema);

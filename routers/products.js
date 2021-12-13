const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
	const productList = await Product.find();

	if (!productList) {
		res.status(500).json({ success: false });
	}
	res.send(productList);
});

router.post(`/`, async (req, res) => {
	// Category.findById(req.body.category)
	// 	.then((category) => {
	// 		if (!category) {
	// 			return res.status(404).json({ message: "Invalid Category" });
	// 		}
	// 	})
	// 	.catch((err) => res.status(500).json({ success: false, message: err }));

	try {
		let category = await Category.findById(req.body.category);
		if (!category) return res.status(400).send("Invalid Category");
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}

	const product = new Product({
		name: req.body.name,
		description: req.body.description,
		richDescription: req.body.richDescription,
		image: req.body.image,
		images: req.body.images,
		brand: req.body.brand,
		price: req.body.price,
		category: req.body.category,
		countInStock: req.body.countInStock,
		rating: req.body.rating,
		numReviews: req.body.numReviews,
		isFeatured: req.body.isFeatured,
		dateCreated: req.body.dateCreated,
	});

	product
		.save()
		.then((createdProduct) => {
			if (category) {
				return res.status(201).send(createdProduct);
			} else {
				return res.status(500).send("Product can not be created");
			}
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				success: false,
			});
		});
});

module.exports = router;

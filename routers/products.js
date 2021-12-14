const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
	//this is to include only specific fields and exlude id,
	//because without exluding the id, it will be returned
	// const productList = await Product.find().select("name image -_id");

	let filter = {};
	if (req.query.categories) {
		filter = { category: req.query.categories.split(",") };
	}

	//populating category with ref
	const productList = await Product.find(filter).populate("category");
	if (!productList) {
		res.status(500).json({ success: false });
	}
	res.send(productList);
});

router.get("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate("category");
		if (!product) {
			res.status(500).json({ success: fail });
		}

		res.status(200).send(product);
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}
});

router.post(`/`, async (req, res) => {
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

	try {
		let createdCategory = await product.save();
		res.status(201).send(createdCategory);
	} catch (err) {
		return res.status(500).json({
			error: err,
			success: false,
		});
	}
});

router.put("/:id", async (req, res) => {
	//try catch - ში რომ გვქონდეს ფროდაქქთის დააფდეითება მაშინ შეგვიძლია
	//ამის გამოყენების რეზალთი მივიღოთ, ახლა კი იქვე იჰენდლება ყველაფერი
	//ტუტორიალშ ნოთ ვალიდ გამოიყენა და მგონი შეიცვალა მას შემდეგ რაღაცეები
	// if (mongoose.isValidObjectId(req.params.id)) {
	// 	res.status(400).send("Invalid Product Id");
	// }
	try {
		let category = await Category.findById(req.body.category);
		if (!category) return res.status(400).send("Invalid Category");
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}

	Product.findByIdAndUpdate(
		req.params.id,
		{
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
		},
		{ new: true }, //to get updated data, not old one
	)
		.then((product) => {
			if (product) {
				return res.status(200).send(product);
			} else {
				return res.status(400).send("The product can not be updated");
			}
		})
		.catch((err) => res.status(500).json({ success: false, message: err }));
});

router.delete("/:id", async (req, res) => {
	try {
		let product = await Product.findByIdAndRemove(req.params.id);
		if (product) {
			return res
				.status(200)
				.json({ success: true, message: "Product has been deleted" });
		} else {
			return res
				.status(404)
				.json({ succes: false, message: "Product not found" });
		}
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}
});

router.get(`/get/count`, async (req, res) => {
	Product.countDocuments()
		.then((count) => {
			if (count) {
				return res.status(200).send({ productCount: count + "" });
			} else {
				return res.status(400).json({ success: fail, message: "Some error" });
			}
		})
		.catch((err) => res.status(500).json({ message: err }));

	// const productCount = await Product.countDocuments((count) => count);
	// productCount += "";
	// if (!productCount) {
	// 	res.status(500).json({ success: false });
	// }
	// res.send(productCount);
});

router.get(`/get/featured/:count`, async (req, res) => {
	let count = req.params.count ? req.params.count : 0;
	Product.find({ isFeatured: true })
		.limit(+count)
		.then((featiredProducts) => {
			if (featiredProducts) {
				return res.status(200).send(featiredProducts);
			} else {
				return res.status(400).json({ success: fail, message: "Some error" });
			}
		})
		.catch((err) => res.status(500).json({ message: err }));
});

module.exports = router;

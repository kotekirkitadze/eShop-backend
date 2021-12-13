const { Category } = require("../models/category");
const express = require("express");
const res = require("express/lib/response");
const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const categoryList = await Category.find();
		if (!categoryList) {
			res.status(500).json({ success: fail });
		}

		res.status(200).send(categoryList);
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}
});

router.get("/:id", async (req, res) => {
	try {
		let category = await Category.findById(req.params.id);
		if (category) {
			return res.status(200).send(category);
		} else {
			return res.status(500).json({
				success: fail,
				message: "The category with given ID was not found",
			});
		}
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}

	// Category.findById(req.params.id)
	// 	.then((category) => {
	// 		if (category) {
	// 			return res.status(200).send(category);
	// 		} else {
	// 			return res.status(500).json({
	// 				success: fail,
	// 				message: "The category with given ID was not found",
	// 			});
	// 		}
	// 	})
	// 	.catch((err) => res.status(400).json({ success: false, message: err }));
});

router.post("/", (req, res) => {
	let category = new Category({
		name: req.body.name,
		icon: req.body.icon,
		color: req.body.color,
	});

	category
		.save()
		.then((createdCategory) => {
			res.status(201).json(createdCategory);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				success: false,
			});
		});

	// category = await category.save();

	// if (!category) {
	// 	return res.status(404).send("The category can not be crated");
	// }

	// res.send(category);
});

router.put("/:id", (req, res) => {
	Category.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		},
		{ new: true }, //to get updated data, not old one
	)
		.then((category) => {
			if (category) {
				return res.status(200).send(category);
			} else {
				return res.status(400).send("The category can not be created");
			}
		})
		.catch((err) => res.status(500).json({ success: false, message: err }));
});

router.delete("/:id", async (req, res) => {
	try {
		let category = await Category.findByIdAndRemove(req.params.id);
		if (category) {
			return res
				.status(200)
				.json({ success: true, message: "Category has been deleted" });
		} else {
			return res
				.status(404)
				.json({ succes: false, message: "Category not found" });
		}
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}
});

module.exports = router;

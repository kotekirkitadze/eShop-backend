const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValid = FILE_TYPE_MAP[file.mimetype];
		let uploadError = new Error("Invalid image type");
		if (isValid) {
			uploadError = null;
		}
		cb(uploadError, "public/uploads");
	},
	filename: function (req, file, cb) {
		const fileName = file.originalname.replace(" ", "-");
		const extension = FILE_TYPE_MAP[file.mimetype];
		cb(null, `${fileName}-${Date.now()}.${extension}`);
	},
});
const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res) => {
	const userList = await User.find().select("-passwordHash");

	if (!userList) {
		res.status(500).json({ success: fail });
	}

	res.send(userList);
});

router.get("/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-passwordHash");
		if (!user) {
			res.status(500).json({ success: fail });
		}

		res.status(200).send(user);
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}
});

router.post("/", async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.password, 11),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});

	try {
		user = await user.save();
		if (user) {
			return res.send(user);
		} else {
			return res.status(400).send("The user can not be created");
		}
	} catch (err) {
		return res.status(500).json({ success: fail, message: err });
	}
});

router.post("/register", async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.password, 11),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});

	try {
		user = await user.save();
		if (user) {
			return res.send(user);
		} else {
			return res.status(400).send("The user can not be created");
		}
	} catch (err) {
		return res.status(500).json({ success: fail, message: err });
	}
});

router.put("/:id", async (req, res) => {
	let newPassword = "";

	try {
		let userExist = await User.findById(req.params.id);
		if (req.body.password) {
			newPassword = bcrypt.hashSync(req.body.password, 11);
		} else {
			newPassword = userExist.passwordHash;
		}
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}

	User.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			email: req.body.email,
			passwordHash: newPassword,
			phone: req.body.phone,
			isAdmin: req.body.isAdmin,
			street: req.body.street,
			apartment: req.body.apartment,
			zip: req.body.zip,
			city: req.body.city,
			country: req.body.country,
		},
		{ new: true }, //to get updated data, not old one
	)
		.then((user) => {
			if (user) {
				return res.status(200).send(user);
			} else {
				return res.status(400).send("The user can not be created");
			}
		})
		.catch((err) => res.status(500).json({ success: false, message: err }));
});

router.post("/login", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		// res.status(500).json({ success: false, message: err });

		if (!user) {
			return res.status(404).send("The user not found");
		}

		if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
			const secret = process.env.secret;
			const token = jwt.sign(
				{
					userId: user.id,
					isAdmin: user.isAdmin,
					isSupport: user.isSupport,
				},
				secret,
				{ expiresIn: "1d" },
			);
			console.log(token);
			res.status(200).send({ email: user.email, token: token });
		} else {
			return res.status(404).send("Password is wrong!");
		}
	} catch (err) {
		res.status(500).json({ succes: false, message: err });
	}
});

router.get(`/get/count`, async (req, res) => {
	User.countDocuments()
		.then((count) => {
			if (count) {
				return res.status(200).send({ userCount: count + "" });
			} else {
				return res.status(400).json({ success: fail, message: "Some error" });
			}
		})
		.catch((err) => res.status(500).json({ message: err }));
});

router.delete("/:id", async (req, res) => {
	try {
		let user = await User.findByIdAndRemove(req.params.id);
		if (user) {
			return res
				.status(200)
				.json({ success: true, message: "User has been deleted" });
		} else {
			return res.status(404).json({ succes: false, message: "User not found" });
		}
	} catch (err) {
		return res.status(400).json({ success: false, message: err });
	}
});

router.put(
	"/updateUserProfile/:id",
	uploadOptions.single("image"),
	async (req, res) => {
		let userFetched;

		User.findById(req.params.id)
			.then((user) => {
				if (!user) {
					return res.status(400).send("Invalid Product");
				}
				userFetched = user;
			})
			.catch((err) => res.status(500).json({ success: false, message: err }));

		const file = req.file;
		let imagePath;

		if (file) {
			const fileName = file.filename;
			const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
			imagePath = `${basePath}${fileName}`;
		} else {
			imagePath = userFetched?.image;
		}

		User.findByIdAndUpdate(
			req.params.id,
			{
				...userFetched,
				image: imagePath,
			},
			{ new: true }, //to get updated data, not old one
		)
			.then((updatedUser) => {
				if (updatedUser) {
					return res.status(200).send(updatedUser);
				} else {
					return res.status(400).send("The user can not be updated");
				}
			})
			.catch((err) => res.status(500).json({ success: false, message: err }));
	},
);

module.exports = router;

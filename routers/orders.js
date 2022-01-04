const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const express = require("express");
const { Product } = require("../models/product");
const router = express.Router();
const stripe = require("stripe")(
	"sk_test_51KAzSoFWBvgcccXyOaYFiws8d1DOZfETw4ObVTlyfPks1fnHF3TuJdXyaot8ms9oWkc2yRfTgLdvVX5KRGCIlpTJ00HiFbzGIY",
);

router.get("/", async (req, res) => {
	try {
		const orderList = await Order.find()
			.populate("user", "name")
			.sort({ dateOrdered: -1 });
		if (!orderList) {
			res.status(500).json({ success: fails });
		}
		res.send(orderList);
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user", "name")
			.populate({
				path: "orderItems",
				populate: { path: "product", populate: "category" },
			});
		if (!order) {
			res.status(500).json({ success: fails });
		}
		res.send(order);
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}
});

router.get("/listOrders/:id", async (req, res) => {
	try {
		const orders = await Order.find().populate("orderItems");
		// ({
		// 	path: "user",
		// 	// path: "orderItems",
		// 	// populate: { path: "orderItems", populate: "product" },
		// });

		let requestedOrders = orders.filter(
			(list) => list.user.toString() == req.params.id,
		);
		console.log(requestedOrders);

		if (!requestedOrders) {
			res.status(500).json({ success: fails });
		}
		res.send(requestedOrders);
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}
});

router.post("/", async (req, res) => {
	const orderItemsIds = Promise.all(
		req.body.orderItems.map(async (orderItem) => {
			let newOrderItem = new OrderItem({
				quantity: orderItem.quantity,
				product: orderItem.product,
			});

			newOrderItem = await newOrderItem.save();

			return newOrderItem._id;
		}),
	);

	const orderItemsIdsResolved = await orderItemsIds;

	const totalPrices = await Promise.all(
		orderItemsIdsResolved.map(async (orderItemId) => {
			const orderItem = await OrderItem.findById(orderItemId).populate(
				"product",
			);
			const totalPrice = orderItem.product.price * orderItem.quantity;
			return totalPrice;
		}),
	);

	const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

	let order = new Order({
		orderItems: orderItemsIdsResolved,
		shippingAddress1: req.body.shippingAddress1,
		shippingAddress2: req.body.shippingAddress2,
		city: req.body.city,
		zip: req.body.zip,
		country: req.body.country,
		phone: req.body.phone,
		status: req.body.status,
		totalPrice: totalPrice,
		dateOrdered: req.body.dateOrdered,
		user: req.body.user,
	});

	order
		.save()
		.then((createdOrder) => {
			res.status(201).json(createdOrder);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				success: false,
			});
		});
});

router.post("/create-checkout-session", async (req, res) => {
	const orderItems = req.body;

	if (!orderItems) {
		return res
			.status(400)
			.send("Checkout session can not be created - check order items");
	}

	const lineItems = await Promise.all(
		orderItems.map(async (orderItem) => {
			const product = await Product.findById(orderItem.product);
			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
					},
					unit_amount: product.price * 100,
				},
				quantity: orderItem.quantity,
			};
		}),
	);
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: lineItems,
		mode: "payment",
		success_url: "http://localhost:4200/success",
		cancel_url: "https://kotekirkitadze.github.io/ngshop",
	});

	res.json({ id: session.id });
});

router.put("/:id", (req, res) => {
	Order.findByIdAndUpdate(
		req.params.id,
		{
			status: req.body.status,
		},
		{ new: true }, //to get updated data, not old one
	)
		.then((order) => {
			if (order) {
				return res.status(200).send(order);
			} else {
				return res.status(400).send("The order can not be updated");
			}
		})
		.catch((err) => res.status(500).json({ success: false, message: err }));
});

router.delete("/:id", async (req, res) => {
	Order.findByIdAndRemove(req.params.id)
		.then(async (order) => {
			if (order) {
				await order.orderItems.map(async (orderItem) => {
					// here we can chain with then and handle errors also
					await OrderItem.findByIdAndRemove(orderItem);
				});
				return res
					.status(200)
					.json({ success: true, message: "Order has been deleted" });
			} else {
				return res
					.status(404)
					.json({ succes: false, message: "Order not found" });
			}
		})
		.catch((err) => {
			return res.status(400).json({ success: false, message: err });
		});

	// try {
	// 	let order = await Order.findByIdAndRemove(req.params.id);
	// 	if (order) {
	// 		return res
	// 			.status(200)
	// 			.json({ success: true, message: "Order has been deleted" });
	// 	} else {
	// 		return res
	// 			.status(404)
	// 			.json({ succes: false, message: "Order not found" });
	// 	}
	// } catch (err) {
	// 	return res.status(400).json({ success: false, message: err });
	// }
});

//statistics api
router.get("/get/totalsales", async (req, res) => {
	try {
		const totalSales = await Order.aggregate([
			{ $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
		]);

		if (!totalSales) {
			return res.status(400).send("The order sales can not be aggregated");
		}
		console.log(totalSales);

		res.send({ totalsales: totalSales.pop().totalsales });
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}
});

router.get(`/get/count`, async (req, res) => {
	Order.countDocuments()
		.then((count) => {
			if (count) {
				return res.status(200).send({ orderCount: count + "" });
			} else {
				return res.status(400).json({ success: fail, message: "Some error" });
			}
		})
		.catch((err) => res.status(500).json({ message: err }));
});

router.get("/get/userorders/:userid", async (req, res) => {
	try {
		const userOrderList = await Order.find({ user: req.params.userid })
			.populate({
				path: "orderItems",
				populate: { path: "product", populate: "category" },
			})
			.sort({ dateOrdered: -1 });
		if (!userOrderList) {
			res.status(500).json({ success: fails });
		}
		res.send(userOrderList);
	} catch (err) {
		return res.status(500).json({ success: false, message: err });
	}
});

module.exports = router;

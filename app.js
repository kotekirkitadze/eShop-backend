const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const http = require("http");
const socketio = require("socket.io");

const getSocket = require("./sockets/socket");

app.use(cors());
app.options("*", cors);
const api = process.env.API_URL;

const server = http.createServer(app);
const io = socketio(server, {
	cors: {
		origin: "*", // ["http://localhost:4200", "http://localhost:49240/"],
		methods: ["GET", "POST"],
	},
});

//route improts
const productsRoute = require("./routers/products");
const usersRoute = require("./routers/users");
const ordersRoute = require("./routers/orders");
const categoriesRoute = require("./routers/categories");

//MiddleWare
//ამ მიდლევეარით ვაანალიზებთ ფრონტენდიდან წამოსლ მონაცემებს, ვპარსავთ
//ამის გარეშე ანდეფაინდს წერდა
app.use(express.json());

//to log http requests on the console
app.use(morgan("tiny"));

//to protect apis
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//Routers
app.use(`${api}/products`, productsRoute);
app.use(`${api}/users`, usersRoute);
app.use(`${api}/categories`, categoriesRoute);
app.use(`${api}/orders`, ordersRoute);

//io
io.of(`${api}/chat`).on("connection", function (socket) {
	getSocket(socket, io);
});

mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() => console.log("Database Connection is ready..."))
	.catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log("Server started on port: http://localhost:3000/");
});

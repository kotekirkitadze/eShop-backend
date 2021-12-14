const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors);
const api = process.env.API_URL;

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
app.use(errorHandler);

//Routers
app.use(`${api}/products`, productsRoute);
app.use(`${api}/users`, usersRoute);
app.use(`${api}/category`, categoriesRoute);
app.use(`${api}/orders`, ordersRoute);

mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() => console.log("Database Connection is ready..."))
	.catch((err) => console.log(err));

app.listen(3000, () => {
	console.log("Server started on port: http://localhost:3000/");
});

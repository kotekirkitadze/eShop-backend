const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");

require("dotenv/config");

const api = process.env.API_URL;
const productsRoute = require("./routers/products");

//MiddleWare
//ამ მიდლევეარით ვაანალიზებთ ფრონტენდიდან წამოსლ მონაცემებს, ვპარსავთ
//ამის გარეშე ანდეფაინდს წერდა
app.use(express.json());

//to log http requests on the console
app.use(morgan("tiny"));

//Routers
app.use(`${api}/products`, productsRoute);

mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() => console.log("Database Connection is ready..."))
	.catch((err) => console.log(err));

app.listen(3000, () => {
	console.log("Server started on port: http://localhost:3000/");
});

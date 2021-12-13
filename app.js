const express = require("express");
const app = express();
const morgan = require("morgan");

require("dotenv/config");

const api = process.env.API_URL;

//MiddleWare
//ამ მიდლევეარით ვაანალიზებთ ფრონტენდიდან წამოსლ მონაცემებს, ვპარსავთ
//ამის გარეშე ანდეფაინდს წერდა
app.use(express.json());

//to log http requests on the console
app.use(morgan("tiny"));

app.get(`${api}/products`, (req, res) => {
	const product = {
		id: 1,
		name: "My haircut staff",
		image: "Some url",
	};
	res.send(product);
});

app.post(`${api}/products`, (req, res) => {
	const newProduct = req.body;
	console.log(newProduct);
	res.send(newProduct);
});

app.listen(3000, () => {
	console.log("Server started on port: http://localhost:3000/");
});

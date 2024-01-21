var admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { GetProducts, GetPicklist } = require('./neto');

var adpp = admin.initializeApp();
const app = express();

app.use(cors({origin: true}));

app.get('/test', async (req, res) => {
	const data = "HelloWorld"
	res.send({data})
});

app.post('/get-products', async (req, res) => {
	const skus = await req.body.skus;

	const resData = await GetProducts(skus);
	
	if (resData !== null) {
		res.send(resData);
	} else {
		res.statusCode(500).send("Can't Find Products: " + skus);
	}
});

app.post('/get-picklist', async (req, res) => {
	const skus = await req.body.skus;

	const resData = await GetPicklist(["TSV2A"]);
	
	if (resData !== null) {
		res.send(resData);
	} else {
		res.status(500).send({message: "FAILED to Get picklist"});
	}
});




exports.api = functions.https.onRequest(app);
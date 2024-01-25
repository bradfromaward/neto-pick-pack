var admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { GetProducts, GetPicklist } = require('./neto');

var serviceAccount = require("./sak.json");

var adpp = admin.initializeApp(serviceAccount);
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

	const resData = await GetPicklist();
	
	if (resData !== null) {
		res.send(resData);
	} else {
		res.status(500).send({message: "FAILED to Get picklist"});
	}
});

app.post('/create-picklist', async (req, res) => {
	const skus = await req.body.skus;

	const resData = await GetPicklist();

	// Add to Firestore
	const db = admin.firestore();

	try {
		const now = new Date();
  		const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
	  	const humanTime = formatDateToAEDT(now);
		
		resData.name = humanTime;
		
		const docRef = db.collection('pickruns').doc(formattedDateTime);
	  	await docRef.set(resData);

		if (resData !== null) {
			console.log('Document successfully written!');
			res.send({pickrunID: formattedDateTime});
		} else {
			res.status(500).send({message: "FAILED to Get picklist"});
		}

	} catch (error) {
	  	console.error('Error writing document: ', error);
	}

});


const formatDateToAEDT = (date) => {
	const options = {
	  year: 'numeric', month: 'long', day: 'numeric',
	  hour: 'numeric', minute: 'numeric', second: 'numeric',
	  hour12: true,
	  timeZone: 'Australia/Sydney'
	};
  
	return new Intl.DateTimeFormat('en-AU', options).format(date);
  };

exports.api = functions.https.onRequest(app);
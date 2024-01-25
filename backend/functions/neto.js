

const OutputSelector = ["ID", "Name", "RRP", "Images", "CostPrice", "Subtitle", "KitComponents", "PickZone", "ShippingCategory"]

const GetProduct = async (sku) => {
    let ProductArray = await GetProducts([sku]);
    
    if(ProductArray[0] == undefined){
        return undefined;
    }
    
    return ProductArray[0];
}

const GetProducts = async (skus) => {
    
	try {
		const response = await fetch('https://www.awardrv.com.au/do/WS/NetoAPI', {
			method: 'post',
			headers: {
				"NETOAPI_KEY": 'xdLjEmXbhrV8hJeBe5lgwXh2Up3Ihwx1',
				"NETOAPI_ACTION": 'GetItem',
				"Content-Type": 'application/json',
				"Accept": 'application/json'
			},
			body: JSON.stringify({
				Filter: {
					SKU: skus,
					OutputSelector,
				},
			})
		});
		
		const resData = await response.json();
		
		//console.log('product pulled', resData.Item);

		if (resData.Item[0] !== undefined) {
			return resData.Item;
		} else {
			return null;
		}
	} catch (err) {
        console.log("err", err);
		return null;
	}
}

const GetOrdersFromOrderStatus = async (OrderStatus) => {
	const response = await fetch('https://www.awardrv.com.au/do/WS/NetoAPI', {
		method: 'post',
		headers: {
			"NETOAPI_KEY": 'xdLjEmXbhrV8hJeBe5lgwXh2Up3Ihwx1',
			"NETOAPI_ACTION": 'GetOrder',
			"Content-Type": 'application/json',
			"Accept": 'application/json'
		},
		body: JSON.stringify({
			Filter: {
				OrderStatus,
				OutputSelector: ["Email", "SalesChannel", "OrderLine", "OrderLine.ShippingTracking"]
			},
		})
	});

	const orders = (await response.json()).Order;

	return orders;
}

const GetPicklist = async () => {
    
	try {
		const PickOrders = await GetOrdersFromOrderStatus("Pick");

		if (PickOrders == undefined) return null;

		let OrderLineSKUs = []

		PickOrders.forEach(pickOrder => {
			pickOrder.OrderLine.forEach(orderLine => {
				OrderLineSKUs.push(orderLine.SKU);
			});
		});
		
		const OrderLineProducts = await GetProducts(OrderLineSKUs);

		//Get Pickzones from

		let OrderLineKittedLocationSKUS = [];

		OrderLineProducts.forEach(product => {

			const hasValidKitComponents = product && product.KitComponents && product.KitComponents.some(kc => kc.KitComponent && kc.KitComponent.ComponentSKU);

			if(hasValidKitComponents) {
				product.KitComponents.forEach(kitc => {
					OrderLineKittedLocationSKUS.push(kitc.KitComponent.ComponentSKU);
				})
			}
		});


		const KittedBaseProducts = await GetProducts(OrderLineKittedLocationSKUS);


		// Add Product Data into Pick Orders
		PickOrders.forEach(pickOrder => {
			pickOrder.OrderLine.forEach(orderLine => {
				let foundProduct = OrderLineProducts.find(prod => prod.SKU === orderLine.SKU) // Stilkl cound be kitted
				
				if(foundProduct !== undefined) {
					
					const hasValidKitComponents = foundProduct && foundProduct.KitComponents && foundProduct.KitComponents.some(kc => kc.KitComponent && kc.KitComponent.ComponentSKU);
					
					if(hasValidKitComponents){

						/// Check If Product Data has hit components
						foundProduct.KitComponents.forEach(kc => {
							const foundBaseProduct = KittedBaseProducts.find(prod => prod.SKU === kc.KitComponent.ComponentSKU);
							 
							if(foundBaseProduct !== undefined)
								kc.KitComponent.SourceProduct = foundBaseProduct;
						});
					}

					orderLine.ProductData = foundProduct;
				}
				else {
					console.log("No Match for Product: ", orderLine.SKU)
				}
			});
		});

		const picklist = await GeneratePicklist(PickOrders);

		let picklistOrderIDs = [];

		PickOrders.forEach(pickOrder => { 
			picklistOrderIDs.push(pickOrder.OrderID);
		});

		return {
			picklist,
			picklistOrderIDs
		};
		
	} catch (err) {
        console.log("err", err);
		return null;
	}
}

// Requires Product Data and any Kit Components need a SourceProduct
const GeneratePicklist = (orders) => {
	const combinedOrderLines = orders.reduce((acc, order) => {
		order.OrderLine.forEach(line => {
			const { Quantity, ProductData } = line;

			if(ProductData) {
		
				const hasValidKitComponents = ProductData && ProductData.KitComponents && ProductData.KitComponents.some(kc => kc.KitComponent && kc.KitComponent.ComponentSKU);

				// Check if there are KitComponents
				if (hasValidKitComponents) {
					// Process only KitComponent SKUs
					ProductData.KitComponents.forEach(component => {
						const kitSKU = component.KitComponent.ComponentSKU;
						const kitQuantity = parseInt(component.KitComponent.AssembleQuantity) * parseInt(Quantity); // We have to multiply but orderline qty to get correct numver
						const kitSource = component.KitComponent.SourceProduct;
		
						if (acc[kitSKU]) {
							acc[kitSKU].Quantity += kitQuantity;
							acc[kitSKU].Orders.push(order.OrderID);
						} else {
							acc[kitSKU] = { SKU: kitSKU, Quantity: kitQuantity, Product: kitSource, Orders: [order.OrderID] };
						}
					});
				} else {
					// If no KitComponents, process the main order line SKU
					const { SKU } = line;
					if (acc[SKU]) {
						acc[SKU].Quantity += parseInt(Quantity);
						acc[SKU].Orders.push(order.OrderID);
					} else {
						acc[SKU] = { SKU, Quantity: parseInt(Quantity), Product: ProductData, Orders: [order.OrderID] };
					}
				}
			}
		});
		return acc;
	}, {});
	
	//Now Order Them via PickZone!

	const orderLines = Object.values(combinedOrderLines);

	orderLines.sort((a, b) => {
		if (a.Product.PickZone < b.Product.PickZone) {
			return -1;
		}
		if (a.Product.PickZone > b.Product.PickZone) {
			return 1;
		}
		return 0;
	})

	// Convert the object back to an array
	return orderLines;
}

module.exports = { GetProducts, GetProduct, GetPicklist };
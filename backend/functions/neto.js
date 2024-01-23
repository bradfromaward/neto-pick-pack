

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

const GetPicklist = async (skus) => {
    
	try {
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
					OrderStatus: "Pick",
					OutputSelector: ["Email", "SalesChannel", "OrderLine", "OrderLine.ShippingTracking"]
				},
			})
		});
		
		const PickOrders = (await response.json()).Order;
		

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

		console.log('KittedBaseProducts: ', KittedBaseProducts);

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

		return PickOrders;
		
	} catch (err) {
        console.log("err", err);
		return null;
	}
}

module.exports = { GetProducts, GetProduct, GetPicklist };
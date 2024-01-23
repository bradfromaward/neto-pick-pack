import React, { useEffect, useState } from 'react';
import Orderline from '../../components/Orderline';

const SelectPicklist = () => {
    const [picklist, SetPicklist] = useState([]);
    const [pickOrders, SetPickOrders] = useState([]);

    const GetPicklist = async () => {
        //alert("Get Picklist")

        try{

            const resp = await fetch("http://127.0.0.1:5001/neto-pick-pack/us-central1/api/get-picklist", {
                method: 'post',
                body: JSON.stringify({
                    Filter: {
                        OutputSelector: "noth",
                    },
                })
            });
            
            const data = await resp.json();
            
            SetPickOrders(data);

            console.log(data);
            const pl = GetPicklistFromOrders(data);

            SetPicklist(pl);

        } catch (err){
            console.log("ERROR: ", err);
        }
    }

    const GetPicklistFromOrders = (orders) => {
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
                            } else {
                                acc[kitSKU] = { SKU: kitSKU, Quantity: kitQuantity, Product: kitSource};
                            }
                        });
                    } else {
                        // If no KitComponents, process the main order line SKU
                        const { SKU } = line;
                        if (acc[SKU]) {
                            acc[SKU].Quantity += parseInt(Quantity);
                        } else {
                            acc[SKU] = { SKU, Quantity: parseInt(Quantity), Product: ProductData };
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
  
    return (
        <div>
            <h2>Select Picklist</h2>
            <button onClick={GetPicklist}>Get Latest Picklist</button>
            {/* {pickOrders.map(order => <span>{order.OrderID}</span>)} */}
            {picklist.map(order => <Orderline orderline={order} />)}
        </div>  
    );
}

export default SelectPicklist;

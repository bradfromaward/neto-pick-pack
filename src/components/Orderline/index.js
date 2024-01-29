import React, { useEffect, useState } from 'react';
import "./index.scss";

const Orderline = ({ orderline }) => {
    const [scanQTY, SetScanQTY] = useState(0);

    useEffect(() => {
        if(orderline.Scans) {
            let scans = 0;

            orderline.Scans.forEach(scan => {
                scans += scan.quantity;
            });

            SetScanQTY(scans);
        }
    }, [orderline.Scans])
  
    return (
        <div key={orderline.SKU} className='orderline-container'>
            <div>
                {orderline.Product.Images[0] && <img src={orderline.Product.Images[0].ThumbURL}></img>}
                <h4>{orderline.SKU}</h4>
                <p>{orderline.Product.Name}</p>
                <p>{orderline.Product.PickZone}</p>
                <p>{orderline.Product.ShippingCategory}</p>
            </div>
            <div>
                <p id="orderline-qty">{scanQTY}/{orderline.Quantity}</p>
            </div>
        </div> 
    );
}

export default Orderline;

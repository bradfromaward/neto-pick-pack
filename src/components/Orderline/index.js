import React, { useEffect, useState } from 'react';
import "./index.scss";

const Orderline = ({ orderline }) => {
  
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
                <p id="orderline-qty">0/{orderline.Quantity}</p>
            </div>
        </div> 
    );
}

export default Orderline;

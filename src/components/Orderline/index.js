import React, { useEffect, useState } from 'react';

const Orderline = ({ orderline }) => {
  
    return (
        <div key={orderline.SKU}>
            <h4>{orderline.SKU}</h4>
            <p>0/{orderline.Quantity}</p>
            <p>{orderline.PickZone}</p>
        </div> 
    );
}

export default Orderline;

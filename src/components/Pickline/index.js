import React, { useEffect, useState } from 'react';
import "./index.scss";

const Orderline = React.forwardRef((props, ref) => {
    const { pickline, OnSelectPickline } = props;
    const [scanQTY, SetScanQTY] = useState(0);

    useEffect(() => {
        if(pickline.Scans) {
            let scans = 0;

            pickline.Scans.forEach(scan => {
                scans += scan.quantity;
            });

            SetScanQTY(scans);
        }
    }, [pickline.Scans])

    const IsPicked = scanQTY == pickline.Quantity;

    const MapIndexToCategory = (index) => {
        const shippingOptions = [
            'Parcel Post', // index 0 (Default)
            'Dangerous Goods', // index 1
            'Direct Freight', // index 2
            'Customer Pick Up', // index 3
            'Small Letter', // index 4
            'Letter Post', // index 5
            'Startrack With Insurance', // index 6
            'Australia Post $25.00', // index 7
            'Marine Parcel Post', // index 8
            'ARAMEX' // index 9
        ];
    
        // Check if the provided index is within the array bounds
        if (index >= 0 && index < shippingOptions.length) {
            return shippingOptions[index];
        } else {
            return 'Invalid Index'; // Or handle as needed
        }
    }
  
    return (
        <div ref={ref} onClick={() => OnSelectPickline(pickline)} className={`orderline-container ${IsPicked && "picked"}`}>
            <div>
                {pickline.Product.Images[0] && !IsPicked && <img src={pickline.Product.Images[0].ThumbURL}></img>}
                {IsPicked && <p className='picked-status'>Picked</p>}
                <h4>{pickline.Product.AccountingCode}</h4>
                <h3>{pickline.SKU} </h3>
                <p>{pickline.Product.Name}</p>
                <p>{pickline.Product.PickZone}</p>
                <p className={`shipping ${pickline.Product.ShippingCategory == 0 && "gray"} ${pickline.Product.ShippingCategory == 2 && "red"}`}>{MapIndexToCategory(pickline.Product.ShippingCategory)}</p>
                {/* <button className='green wide' onClick={() => OnSelectPickline(pickline)}>Details</button> */}
            </div>
            <div>
                {!IsPicked && <p id="orderline-qty">{scanQTY}/{pickline.Quantity}</p>}
                {IsPicked && <p id="orderline-qty-picked">Picked</p>}
                {IsPicked && <p id="orderline-qty">{scanQTY}</p>}
            </div>
        </div> 
    );
})

export default Orderline;

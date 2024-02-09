import React, { useEffect, useState } from 'react';
import "./index.scss";
const options = { 
    timeZone: 'Australia/Sydney', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
};

const PicklineDetails = ({ pickline, onScan, onClose }) => {
    const [scanQTY, SetScanQTY] = useState(0);

    useEffect(() => {
        console.log(pickline);
    })

    const GetScans = () => {
        if(pickline && pickline.Scans) {
            let scans = 0;

            pickline.Scans.forEach(scan => {
                scans += scan.quantity;
            });

            return scans;
        }
        else{
            return 0;
        }
    }

    if(!pickline) return (
        <div className={`modal`}>
            
        </div>
    )
    return (
        <div className={`modal ${pickline && "visible"}`}>
            <button onClick={onClose} className='wide red'>Close Details</button>
            {pickline.Product.Images.length > 0 && <img src={pickline.Product.Images[0].URL} width={"100%"} height={"auto"} alt="" />}            <h2>{pickline.Product.Name}</h2>
            <h3>Orders</h3>
            {pickline.Orders.map(orderID => <p>{orderID}</p>)}
            <h3>Barcode</h3>
            <p>{pickline.Product.SKU}</p>
            {pickline.Product.PickZone && <h3>Pick Zone</h3>}
            {pickline.Product.PickZone && <h2>{pickline.Product.PickZone}</h2>}
            <h3>Progress</h3>
            <p id='scans'>{GetScans()}/{pickline.Quantity}</p>
            <h3>Manual Override</h3>
            <div className='row'>
                <button onClick={() => onScan(pickline.Product.SKU, false)} className='wide blue'>-</button>
                <button onClick={() => onScan(pickline.Product.SKU)} className='wide blue'>+</button>
            </div>
            <h3>Report Issue</h3>
            <button className='blue wide'>Request Backorder</button>
            <button className='red wide'>Incorrect Location</button>
            <button className='green wide'>Product Not Found</button>
            <h3>Optional Note</h3>
            <textarea  />
            <h3>Scan History</h3>
            {pickline.Scans && <div className=''>
                {pickline.Scans.map((scan, i) => 
                <div className='scan-container'>
                    <p>No {i + 1}</p>
                    <p>By {scan.name}</p>
                    <p>On the {new Date(scan.time).toLocaleTimeString('en-AU', options)}</p>
                    <p id="qty">Qty {scan.quantity}</p>
                </div> )}
            </div>}
            {/* <button className='red wide'>Add Note to Pickline (Dont work yet)</button> */}
        </div> 
    );
}

export default PicklineDetails;

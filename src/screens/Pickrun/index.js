import React, { useEffect, useState } from 'react';
import Orderline from '../../components/Orderline';
import { collection, getDoc, doc, onSnapshot } from "firebase/firestore"; 

const Pickrun = ({ db, pickrun, onClose }) => {
    const [picklist, SetPicklist] = useState([]);
    const [pickOrders, SetPickOrders] = useState([]);
    const [pickrunName, SetPickrunName] = useState("Name");

     useEffect(() => {
        const GetList = async () => {
            const docRef = await doc(db, "pickruns", pickrun);

            onSnapshot(docRef, (docData) => {
                const jsData = docData.data();

                if(jsData){
                    SetPicklist(jsData.picklist);
                    SetPickOrders(jsData.picklistOrderIDs);
                    SetPickrunName(jsData.name);
                }
            })
        };

        GetList().catch(console.error);
    }, []);

    const onScan = () => {

    }

    return (
        <div>
            <button onClick={onClose}>Close</button>
            <button onClick={onScan}>Scan For 0140</button>
            <h2>Picklist: {pickrunName}</h2>
            <h3>{pickOrders.length} Orders</h3>
            {picklist.map(order => <Orderline orderline={order} />)}
        </div>  
    );
}

export default Pickrun;

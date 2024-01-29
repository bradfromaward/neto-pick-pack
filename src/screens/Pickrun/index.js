import React, { useEffect, useState } from 'react';
import Orderline from '../../components/Orderline';
import { getDoc, updateDoc, doc, onSnapshot } from "firebase/firestore"; 

const Pickrun = ({ db, pickrun, onClose }) => {
    const [picklist, SetPicklist] = useState([]);
    const [pickOrders, SetPickOrders] = useState([]);
    const [pickrunName, SetPickrunName] = useState("Name");
    const [inputValue, setInputValue] = useState('');

     useEffect(() => {
        const GetList = async () => {
            const docRef = await doc(db, "pickruns", pickrun);

            onSnapshot(docRef, (docData) => {
                const jsData = docData.data();

                if(jsData){
                    //console.log(jsData);
                    SetPicklist(jsData.picklist);
                    SetPickOrders(jsData.picklistOrderIDs);
                    SetPickrunName(jsData.name);
                }
            })
        };

        GetList().catch(console.error);
    }, []);

    const onScan = async (e) => {
        e.preventDefault();

        let sku = inputValue;

        const docRef = doc(db, "pickruns", pickrun);

        const scan = {
            name: "Brad",
            quantity: 1,
            time: Date.now(),
            message: "This is a sample message"
        }

        getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let items = data.picklist;
            
            const itemIndex = items.findIndex(item => item.SKU === sku);
            
            if (itemIndex !== -1) {
                
                // Update the map
                const updatedItems = [...items];

                console.log("DOGS");
                
                if(updatedItems[itemIndex].Scans){
                    updatedItems[itemIndex].Scans.push(scan);
                } else {
                    updatedItems[itemIndex].Scans = [scan];
                }

                console.log(updatedItems[itemIndex]);
        
                // Proceed to update the document in Firestore
                return updateDoc(docRef, { picklist: updatedItems });

            } else {
                console.log('Item not found');
            }

          } else {
            console.log('No such document!');
          }
        })
        // .then(() => {
        //   console.log('Document successfully updated!');
        // })
        // .catch((error) => {
        //   console.error('Error updating document:', error);
        // });
    }

    return (
        <div>
            <form onSubmit={e => onScan(e)}>
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)}
                />
            </form>
            <button onClick={onClose}>Close</button>
            {/* <button onClick={onScan}>Scan </button> */}
            <h2>Picklist: {pickrunName}</h2>
            <h3>{pickOrders.length} Orders</h3>
            {picklist.map(order => <Orderline orderline={order} />)}
        </div>  
    );
}

export default Pickrun;

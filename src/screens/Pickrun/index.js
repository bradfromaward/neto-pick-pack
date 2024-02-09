import React, { useEffect, useRef, useState } from 'react';
import Pickline from '../../components/Pickline';
import { getDoc, updateDoc, doc, onSnapshot } from "firebase/firestore"; 
import PicklineDetails from '../../components/PicknameDetails';
import ErrorModal from '../../components/ErrorModal';

const Pickrun = ({ db, pickrun, onClose, user }) => {
    const [picklist, SetPicklist] = useState([]);
    const [pickOrders, SetPickOrders] = useState([]);
    const [pickrunName, SetPickrunName] = useState("Name");
    const [selectedPickline, SetSelectedPickline] = useState(null);
    const [error, SetError] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    const itemRefs = useRef({});
    const [selectedSKU, setSelectedSKU] = useState(null);

    const [barcode, setBarcode] = useState('');

    useEffect(() => {
        if (selectedSKU && itemRefs.current[selectedSKU]) {
          itemRefs.current[selectedSKU].current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }, [selectedSKU]);

    useEffect(() => {
        // Initialize or update refs for current picklist items
        itemRefs.current = picklist.reduce((acc, item) => {
          acc[item.SKU] = acc[item.SKU] || React.createRef();
          return acc;
        }, itemRefs.current);

        if(selectedPickline)
        {    
            const updatedPickline = picklist.find((pickline) => pickline.Product.SKU == selectedPickline.Product.SKU);
            SetSelectedPickline(updatedPickline);
            console.log("RAAAA")
        }

      }, [picklist]);

 

    // i DONT REALLY KNOW WHAT THE  code does above^^

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Example: Append key presses to barcode string
            // You might want to add more complex logic
            // to handle different types of inputs or termination characters
            if (/^[a-z0-9]$/i.test(event.key)) {
                setBarcode(prev => prev + event.key);
            }

            // Example: Clear barcode when Enter is pressed
            if (event.key === 'Enter') {
                    console.log('Barcode Scanned: ', barcode);
                    onScan(barcode)
                    //alert("Barcode: " + barcode);
                    setBarcode('');

            }
        };

        // Attach the event listener to window
        window.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [barcode]);

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

    const onScan = async (sku, isAdd = true) => {

        const docRef = doc(db, "pickruns", pickrun);
        setSelectedSKU(sku);

        const scan = {
            userID: user.id,
            name: user.name,
            quantity: isAdd ? 1 : -1,
            time: Date.now(),
        }

        getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let items = data.picklist;
            
            const itemIndex = items.findIndex(item => item.SKU === sku);
            
            if (itemIndex !== -1) 
            {
                // Update the map
                const updatedItems = [...items];
                
                if(updatedItems[itemIndex].Scans)
                {
                    let scanQTY = 0;

                    updatedItems[itemIndex].Scans.forEach(scan => {
                        scanQTY += scan.quantity;
                    });

                    if(isAdd)
                    {
                        if(scanQTY < updatedItems[itemIndex].Quantity)
                        {
                            updatedItems[itemIndex].Scans.push(scan);
                        }
                        else
                        {
                            SetError({
                                title: `Over Picked! ${updatedItems[itemIndex].Product.Name}`,
                                message: `Required ${updatedItems[itemIndex].Quantity}`
                            });
                        }
                    }
                    else
                    {
                        if(scanQTY > 0)
                        {
                            updatedItems[itemIndex].Scans.push(scan);
                        }
                        else
                        {
                            SetError({
                                title: `Already at 0 for ${updatedItems[itemIndex].Product.Name}`,
                                message: `Required ${updatedItems[itemIndex].Quantity}`
                            });
                        }
                    }
                } 
                else 
                {
                    updatedItems[itemIndex].Scans = [scan];
                }

                console.log(updatedItems[itemIndex]);
        
                // Proceed to update the document in Firestore
                return updateDoc(docRef, { picklist: updatedItems });

            } else {
                console.log('Item not found');
                SetError({
                    title: "Item Not In Picklist",
                    message: "This may be a similar item or we have an incorrect/outdated barcode in out system."
                })
            }

          } else {
            console.log('No such document!');
          }
        })
        .then(() => {
            console.log('Document successfully updated!');
            setInputValue("");
        })
        .catch((error) => {
            console.error('Error updating document:', error);
            setInputValue("");
        });
    }

    const ClosePickDetails = () => {
        SetSelectedPickline(null);
    }

    const GetTimeBasedGreeting = () => {
        const date = new Date();
        const hour = date.getHours();
      
        if (hour < 12) {
          return "Good Morning";
        } else if (hour < 18) {
          return "Good Afternoon";
        } else if (hour < 22) {
          return "Good Evening";
        } else {
          return "Good Night";
        }
    }
      

    return (
        <div className='container'>
            <button className='red wide' onClick={onClose}>Back</button>
            <h2>{GetTimeBasedGreeting()}, {user.name}</h2>
            <h2>Picklist: {pickrunName}</h2>
            <h3>{pickOrders.length} Orders</h3>
            <PicklineDetails pickline={selectedPickline} onScan={onScan} onClose={ClosePickDetails}/>
            <ErrorModal error={error} onClearError={() => SetError(null)}/>
            {picklist.map(order => <Pickline ref={itemRefs.current[order.Product.SKU]} pickline={order} OnSelectPickline={(p) => SetSelectedPickline(p)}/>)}
        </div>  
    );
}

export default Pickrun;

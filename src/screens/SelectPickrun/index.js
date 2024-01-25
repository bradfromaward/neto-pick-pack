import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore"; 

const SelectPickrun = ({ db, onSelectPickList }) => {
    const [pickruns, SetPickruns] = useState([]);

    useEffect(() => {
        const GetList = async () => {
            const querySnapshot = await getDocs(collection(db, "pickruns"));
            
            const docsArray = [];

            querySnapshot.forEach((doc) => {
                // Push each doc into docsArray
                docsArray.push({ id: doc.id, name: doc.data().name });
            });

            SetPickruns(docsArray);
        };

        GetList().catch(console.error);
    }, []);

    const CreateNewPicklist = async () => {

        try{
            const resp = await fetch("http://127.0.0.1:5001/neto-pick-pack/us-central1/api/create-picklist", {
                method: 'post',
                body: JSON.stringify({
                    Filter: {
                        OutputSelector: "noth",
                    },
                })
            });
            
            const data = await resp.json();

            onSelectPickList(data.pickrunID);

            console.log(data);
        } catch (err){
            console.log("ERROR: ", err);
        }
    }

    return (
        <div>
            <h2>Select Pickrun</h2>
            <button onClick={CreateNewPicklist}>Create New Picklist</button>
            <div>
                {pickruns.map(pickrun => <button onClick={() => onSelectPickList(pickrun.id)}>{pickrun.name}</button>)}
            </div>
        </div>  
    );
}

export default SelectPickrun;

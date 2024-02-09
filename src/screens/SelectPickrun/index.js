import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore"; 
import "./index.scss";

const SelectPickrun = ({ db, onSelectPickList, onSelectUser, user }) => {
    const [pickruns, SetPickruns] = useState([]);
    const [isLoading, SetIsLoading] = useState(false);
    const [users, SetUsers] = useState([]);

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

        const GetUsers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            
            const docsArray = [];

            querySnapshot.forEach((doc) => {
                // Push each doc into docsArray
                docsArray.push({ id: doc.id, name: doc.data().name, role: doc.data().role });
            });

            SetUsers(docsArray);
        };

        GetList().catch(console.error);
        GetUsers().catch(console.error);
    }, []);

    const CreateNewPicklist = async () => {
        SetIsLoading(true);

        try{
            //const resp = await fetch("http://127.0.0.1:5001/neto-pick-pack/us-central1/api/create-picklist", {
            const resp = await fetch("https://us-central1-neto-pick-pack.cloudfunctions.net/api/create-picklist", {
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

        SetIsLoading(false);
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
            {!user && <div>
                <h2>Please Select a User</h2>
                <div className='vertical-list'>
                    {users.map(user => <button onClick={() => onSelectUser(user)}>{user.name}</button>)}
                </div>
            </div>}
            {user && <div>
                <h2>{GetTimeBasedGreeting()}, {user.name}</h2>
                <h1>Select Pickrun</h1>
                <button className='wide large red' onClick={CreateNewPicklist}>{isLoading ? "Creating.." : "Create New Picklist"}</button>
                <div className='vertical-list'>
                    {pickruns.map(pickrun => <button onClick={() => onSelectPickList(pickrun.id)}>{pickrun.name}</button>)}
                </div>
            </div>}
        </div>  
    );
}

export default SelectPickrun;

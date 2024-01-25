import React, { useEffect, useState } from 'react';
import SelectPickrun from './screens/SelectPickrun';
import Pickrun from './screens/Pickrun';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const App = () => {
  const [pickrun, SetPickrun] = useState("")

 // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFxZYfC52LjZtZf-WDEA8VzPEXzXNxVtY",
  authDomain: "neto-pick-pack.firebaseapp.com",
  projectId: "neto-pick-pack",
  storageBucket: "neto-pick-pack.appspot.com",
  messagingSenderId: "491359610805",
  appId: "1:491359610805:web:9be319446bee171d981bfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase

  return (
    <div>
      {!pickrun && <SelectPickrun db={db} onSelectPickList={(p) => SetPickrun(p)}/>}
      {pickrun && <Pickrun db={db} pickrun={pickrun} onClose={() => SetPickrun("")}/>}
    </div>  
  );
}

export default App;

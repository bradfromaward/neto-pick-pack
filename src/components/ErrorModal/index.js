import React, { useEffect, useState } from 'react';
import "./index.scss";

const ErrorModal = ({ error, onClearError }) => {
    useEffect(() => {
        setTimeout(() => {
            onClearError();
        }, 2000)
    },[error])

    return (
        <div className={`modal error ${error && "visible"}`}>
            <h3>Error</h3>
            <h1>{error && error.title}</h1>
            <h3>{error && error.message}</h3>
        </div> 
    );
}

export default ErrorModal;

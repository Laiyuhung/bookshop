import React, { useState } from "react";
import Address from "./Address";

function CustomerAddress() {
    const [address, setAddress] = useState("");

    const handleAddressChange = (newAddress) => {
        setAddress(newAddress);
    };

    return (
        <div className="customer-address">
            <Address address={address} onChange={handleAddressChange} />
            <button className="btn btn-primary mt-3">確認地址</button>
        </div>
    );
}

export default CustomerAddress;

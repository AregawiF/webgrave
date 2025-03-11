import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const Checkout = ({onSuccess}: {onSuccess: ()=> void} ) => {
    const [orderID, setOrderID] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const createOrder = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/payment/create-paypal-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: "50.00" }),
            });

            const data = await response.json();
            setOrderID(data.orderID);
            console.log("createdOrder")
            return data.orderID;
        } catch (err) {
            console.error(err);
            setError("Failed to create order");
        }
    };

    const captureOrder = async (orderID: any) => {
        console.log("capturing order")

        try {
            const response = await fetch("http://localhost:5000/api/payment/capture-paypal-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID }),
            });

            const data = await response.json();

            console.log("captured order", data);
            onSuccess();
            setSuccess(true);

            return data;
        } catch (err) {
            console.error(err);
            setError("Failed to capture order");
        }
        console.log("captured order")

    };

    return (
        <div>
            <h2>Pay with PayPal</h2>
            {success ? (
                <h3 style={{ color: "green" }}>Payment Successful!</h3>
            ) : (
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={(data) => captureOrder(data.orderID)}
                    onError={(err) => setError("Payment Failed", err)}
                />
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Checkout;

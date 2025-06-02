import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    const [btcPrice, setBtcPrice] = useState(null);
    const [usdToTryRate, setUsdToTryRate] = useState(null);
    const [btcAmounts, setBtcAmounts] = useState(() => JSON.parse(localStorage.getItem("btcAmounts")) || ["", "", ""]);
    const [usdResults, setUsdResults] = useState(["", "", ""]);
    const [tryResults, setTryResults] = useState(["", "", ""]);
    const [totalUsd, setTotalUsd] = useState(() => localStorage.getItem("totalUsd") || "0.00");
    const [totalTry, setTotalTry] = useState(() => localStorage.getItem("totalTry") || "0.00");
    const [useManualPrice, setUseManualPrice] = useState(() => JSON.parse(localStorage.getItem("useManualPrice")) || false);
    const [manualBtcPrice, setManualBtcPrice] = useState(() => localStorage.getItem("manualBtcPrice") || "");

    useEffect(() => {
        axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
            .then(response => setBtcPrice(response.data.bitcoin.usd))
            .catch(error => console.error("Error fetching BTC data:", error));

        axios.get("https://api.exchangerate-api.com/v4/latest/USD")
            .then(response => setUsdToTryRate(response.data.rates.TRY))
            .catch(error => console.error("Error fetching USD to TRY rate:", error));
    }, []);

    useEffect(() => {
        localStorage.setItem("btcAmounts", JSON.stringify(btcAmounts));
        localStorage.setItem("useManualPrice", JSON.stringify(useManualPrice));
        localStorage.setItem("manualBtcPrice", manualBtcPrice);
    }, [btcAmounts, useManualPrice, manualBtcPrice]);

    useEffect(() => {
        localStorage.setItem("totalUsd", totalUsd);
        localStorage.setItem("totalTry", totalTry);
    }, [totalUsd, totalTry]);

    const handleCalculateAll = () => {
        const selectedPrice = useManualPrice && manualBtcPrice ? parseFloat(manualBtcPrice) : btcPrice;

        if (selectedPrice) {
            const updatedUsdResults = btcAmounts.map(amount => (amount * selectedPrice).toFixed(2));
            setUsdResults(updatedUsdResults);

            const updatedTryResults = updatedUsdResults.map(usd => usdToTryRate ? (usd * usdToTryRate).toFixed(2) : "Loading...");
            setTryResults(updatedTryResults);

            const newTotalUsd = updatedUsdResults.reduce((sum, value) => sum + (parseFloat(value) || 0), 0).toFixed(2);
            setTotalUsd(newTotalUsd);

            const newTotalTry = usdToTryRate ? (newTotalUsd * usdToTryRate).toFixed(2) : "Loading...";
            setTotalTry(newTotalTry);
        }
    };

    const handleChange = (index, value) => {
        const updatedAmounts = [...btcAmounts];
        updatedAmounts[index] = value;
        setBtcAmounts(updatedAmounts);
    };

    return (
        <div className="container text-center mt-5">
            <h1 className="mb-4">Live BTC to USD & TRY Converter</h1>

            <div className="form-check form-switch mb-3">
                <label className="form-check-label">Use Manual BTC Price:</label>
                <input 
                    type="checkbox" 
                    className="form-check-input" 
                    checked={useManualPrice} 
                    onChange={() => setUseManualPrice(!useManualPrice)} 
                />
            </div>

            {useManualPrice ? (
                <input
                    type="number"
                    className="form-control mb-4"
                    placeholder="Enter BTC Price"
                    value={manualBtcPrice}
                    onChange={(e) => setManualBtcPrice(e.target.value)}
                />
            ) : (
                <p>Current BTC Price (API): {btcPrice ? `$${btcPrice}` : "Loading..."}</p>
            )}

            <p className="mb-3">USD to TRY Rate: {usdToTryRate ? `₺${usdToTryRate}` : "Loading..."}</p>

            {["Binance", "Binance TR", "BTCTurk"].map((label, index) => (
                <div key={index} className="mb-4">
                    <label className="form-label">{label}</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder={`Enter BTC amount for ${label}`}
                        value={btcAmounts[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                    />
                    {usdResults[index] && (
                        <div className="mt-2">
                            <p>USD Equivalent: <strong>${usdResults[index]}</strong></p>
                            <p>TRY Equivalent: <strong>₺{tryResults[index]}</strong></p>
                        </div>
                    )}
                </div>
            ))}

            <button 
                onClick={handleCalculateAll} 
                className="btn btn-primary mt-3">
                Convert All
            </button>

            <div className="mt-4">
                <h2>Total USD Amount: <span className="text-success">${totalUsd}</span></h2>
                <h2>Total TRY Amount: <span className="text-warning">₺{totalTry}</span></h2>
            </div>
        </div>
    );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";

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

    const handleCalculate = (index) => {
        const selectedPrice = useManualPrice && manualBtcPrice ? parseFloat(manualBtcPrice) : btcPrice;

        if (selectedPrice && btcAmounts[index]) {
            const updatedUsdResults = [...usdResults];
            updatedUsdResults[index] = (btcAmounts[index] * selectedPrice).toFixed(2);
            setUsdResults(updatedUsdResults);

            const updatedTryResults = [...tryResults];
            updatedTryResults[index] = usdToTryRate ? (updatedUsdResults[index] * usdToTryRate).toFixed(2) : "Loading...";
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
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Live BTC to USD & TRY Converter</h1>

            <div style={{ marginBottom: "20px" }}>
                <label>Use Manual BTC Price:</label>
                <input
                    type="checkbox"
                    checked={useManualPrice}
                    onChange={() => setUseManualPrice(!useManualPrice)}
                    style={{ marginLeft: "10px" }}
                />
            </div>

            {useManualPrice ? (
                <input
                    type="number"
                    placeholder="Enter BTC Price"
                    value={manualBtcPrice}
                    onChange={(e) => setManualBtcPrice(e.target.value)}
                    style={{ padding: "5px", marginBottom: "10px" }}
                />
            ) : (
                <p>Current BTC Price (API): {btcPrice ? `$${btcPrice}` : "Loading..."}</p>
            )}

            <p>USD to TRY Rate: {usdToTryRate ? `₺${usdToTryRate}` : "Loading..."}</p>

            {btcAmounts.map((amount, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                    <input
                        type="number"
                        placeholder={`Enter BTC amount ${index + 1}`}
                        value={amount}
                        onChange={(e) => handleChange(index, e.target.value)}
                        style={{ padding: "5px" }}
                    />
                    <button onClick={() => handleCalculate(index)} style={{ marginLeft: "10px", padding: "5px" }}>
                        Convert
                    </button>
                    {usdResults[index] && (
                        <>
                            <p>USD Equivalent: ${usdResults[index]}</p>
                            <p>TRY Equivalent: ₺{tryResults[index]}</p>
                        </>
                    )}
                </div>
            ))}

            <h2>Total USD Amount: ${totalUsd}</h2>
            <h2>Total TRY Amount: ₺{totalTry}</h2>
        </div>
    );
}

export default App;

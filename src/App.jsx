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
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-4">Live BTC to USD & TRY Converter</h1>

            <div className="flex items-center gap-4 mb-6">
                <label className="text-lg">Use Manual BTC Price:</label>
                <input
                    type="checkbox"
                    checked={useManualPrice}
                    onChange={() => setUseManualPrice(!useManualPrice)}
                    className="cursor-pointer"
                />
            </div>

            {useManualPrice ? (
                <input
                    type="number"
                    className="p-2 text-black rounded w-64 mb-4"
                    placeholder="Enter BTC Price"
                    value={manualBtcPrice}
                    onChange={(e) => setManualBtcPrice(e.target.value)}
                />
            ) : (
                <p className="text-lg mb-4">Current BTC Price (API): {btcPrice ? `$${btcPrice}` : "Loading..."}</p>
            )}

            <p className="text-lg mb-6">USD to TRY Rate: {usdToTryRate ? `₺${usdToTryRate}` : "Loading..."}</p>

            {btcAmounts.map((amount, index) => (
                <div key={index} className="mb-4 flex flex-col items-center">
                    <input
                        type="number"
                        className="p-2 text-black rounded w-64 mb-2"
                        placeholder={`Enter BTC amount ${index + 1}`}
                        value={amount}
                        onChange={(e) => handleChange(index, e.target.value)}
                    />
                    <button
                        onClick={() => handleCalculate(index)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Convert
                    </button>
                    {usdResults[index] && (
                        <div className="mt-2 text-lg">
                            <p>USD Equivalent: <span className="text-green-400">${usdResults[index]}</span></p>
                            <p>TRY Equivalent: <span className="text-yellow-400">₺{tryResults[index]}</span></p>
                        </div>
                    )}
                </div>
            ))}

            <div className="mt-6 text-2xl font-semibold">
                <p>Total USD Amount: <span className="text-green-400">${totalUsd}</span></p>
                <p>Total TRY Amount: <span className="text-yellow-400">₺{totalTry}</span></p>
            </div>
        </div>
    );
}

export default App;
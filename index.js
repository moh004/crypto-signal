const express = require("express");
const app = express();
const {updateAllSignals ,signalCache} = require("./service/signal.js");
const port = 3000;

async function runUpdate() {
    try {
        await updateAllSignals();
    } catch (err) {
        console.error("Signal update failed:", err);
    }
}


runUpdate()
setInterval(runUpdate, ( (3 * 60 * 1000) / 4) );


app.get("/signal/:symbol" , (req , res) => {
    const SYMBOL = req.params.symbol;

    try{
        const {symbol, date , price , signal , log} = signalCache[SYMBOL];

        res.json({symbol, date , price , signal , log})

    }catch(e){
        console.log(e)
    }
})

app.listen(port , () => console.log("Connected..." + port))
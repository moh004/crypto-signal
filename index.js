const express = require("express");
const app = express();
const {updateAllSignals ,signalCache} = require("./service/signal.js");
const port = 3000;
const rateLimit = require("express-rate-limit");


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, // limit each IP to 20 requests
  message: "Too many requests from this IP, please try again later"
});

// rate limiting to all requests
app.use(limiter);   

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
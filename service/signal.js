const {SMA} = require("technicalindicators");
const dayjs = require("dayjs");
const axios = require("axios");
const SMA_SHORT = 10;
const SMA_LONG = 50;
require("dotenv").config();
// Configuration
const SYMBOLS = ["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","DOGEUSDT","ADAUSDT","AVAXUSDT","SHIBUSDT","DOTUSDT","TRXUSDT","MATICUSDT","LTCUSDT","BCHUSDT","LINKUSDT","ATOMUSDT","XLMUSDT","UNIUSDT","NEARUSDT",   "ICPUSDT"];

console.log(process.env.TEST)
// Emoji and names

const emojiName = {
    BTCUSDT: { emoji: '🟡 ₿', name: 'Bitcoin' },
    ETHUSDT: { emoji: '🟣', name: 'Ethereum' },
    BNBUSDT: { emoji: '🪙', name: 'BNB' },
    SOLUSDT: { emoji: '🟢', name: 'Solana' },
    XRPUSDT: { emoji: '⚫', name: 'XRP' },
    DOGEUSDT: { emoji: '🟠🐶', name: 'Dogecoin' },
    ADAUSDT: { emoji: '🔵♾️', name: 'Cardano' },
    AVAXUSDT: { emoji: '🧊', name: 'Avalanche' },
    TONUSDT: { emoji: '💎', name: 'Toncoin' },
    DOTUSDT: { emoji: '🌐', name: 'Polkadot' },
    TRXUSDT: { emoji: '🎮🔺', name: 'TRON' },
    MATICUSDT: { emoji: '🟪', name: 'Polygon' },
    LINKUSDT: { emoji: '🔗', name: 'Chainlink' },
    LTCUSDT: { emoji: '⚡', name: 'Litecoin' },
    BCHUSDT: { emoji: '🟤', name: 'Bitcoin Cash' },
    SHIBUSDT: { emoji: '🟠 🦊', name: 'Shiba Inu' },
    ICPUSDT: { emoji: '🌐', name: 'Internet Computer' },
    NEARUSDT: { emoji: '🌙', name: 'NEAR Protocol' },
    APTUSDT: { emoji: '🧬', name: 'Aptos' },
    XLMUSDT: { emoji: '✨', name: 'Stellar' },
    ATOMUSDT: { emoji: '⚛️', name: 'Cosmos' },
    UNIUSDT: { emoji: '🦄', name: 'Uniswap' }
  };


// Cache for signals
let signalCache = {};

SYMBOLS.forEach(sym => {
  signalCache[sym] = { symbol: sym , date: 0 , price: 0 , signal: "" , log: ""};
});

// 📊 Fetch candles for a given symbol
async function fetchCandles(symbol) {
  try {
    const response = await axios.get(process.env.API_URL , {
      params: {
        symbol: symbol,
        interval: '1m',
        limit: SMA_LONG,
      }
    });
  
    return response.data.map(c => ({
      time: c[0],
      close: parseFloat(c[4])
    }));
  } catch (err) {
    console.error(`❌ Error fetching ${symbol}:`, err.message);
    return [];
  }
}

// 📈 Analyze candles
function analyze(candles, symbol) {
  const closes = candles.map(c => c.close);
  const shortSMA = SMA.calculate({ period: SMA_SHORT, values: closes });
  const longSMA = SMA.calculate({ period: SMA_LONG, values: closes });

  const short = shortSMA[shortSMA.length - 1];
  const long = longSMA[longSMA.length - 1];
  const price = candles[candles.length - 1].close;
  const date = dayjs(price.time).format('YYYY-MM-DD HH:mm');

  let signal = 'HOLD';
  if (short > long) signal = 'BUY';
  if (short < long) signal = 'SELL';

  const log = `${emojiName[symbol].emoji} ${emojiName[symbol].name} ==> ${date} | Price: $${price} | Signal: ${signal}`;
  
  return { symbol, date , price , signal , log};
}

// 🔁 Update all signals
 async function updateAllSignals() {
  for (let i = 0; i < SYMBOLS.length; i++) {
    const symbol = SYMBOLS[i];
    
    const candles = await fetchCandles(symbol); 
    
    if (candles.length >= SMA_LONG) {
      const anzRes = analyze(candles, symbol);
      signalCache[symbol].date = anzRes.date;
      signalCache[symbol].price = anzRes.price
      signalCache[symbol].signal = anzRes.signal;
      signalCache[symbol].log = anzRes.log;
    }
  }
}



module.exports = {updateAllSignals , signalCache }
 








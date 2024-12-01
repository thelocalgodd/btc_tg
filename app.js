require("dotenv").config();

const TELEGRAM_API = {
  baseUrl: "https://api.telegram.org",
  token: process.env.TELEGRAM_BOT_TOKEN,
  method: "sendMessage",
};

const COINBASE_API = {
  baseUrl: "https://api.coinbase.com/v2",
  endpoint: "/exchange-rates",
  currency: "BTC",
};

const buildTelegramUrl = () => {
  return `${TELEGRAM_API.baseUrl}/bot${TELEGRAM_API.token}/${TELEGRAM_API.method}`;
};

const buildCoinbaseUrl = () => {
  return `${COINBASE_API.baseUrl}${COINBASE_API.endpoint}?currency=${COINBASE_API.currency}`;
};

const getCurrentBTCPrice = async () => {
  try {
    const response = await fetch(buildCoinbaseUrl());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return {
      btcPrice: data.rates.USD,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch BTC price:", error);
    throw error;
  }
};

const sendTelegramMessage = async (chatId, message) => {
  try {
    const response = await fetch(buildTelegramUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    return response.json();
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    throw error;
  }
};

const main = async () => {
  try {
    const { btcPrice, timestamp } = await getCurrentBTCPrice();
    const message = `<b>Bitcoin Price Update? </b>\n\n💰 1 BTC = ${btcPrice}\n⏰ ${timestamp}`;

    await sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, message);
  } catch (error) {
    console.error("Main process failed:", error);
  }
};

main();

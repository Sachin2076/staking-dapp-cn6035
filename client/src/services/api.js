/**
 * api.js

 * External API calls (CoinGecko price data).
 * Isolated here so they can be mocked in tests or swapped for another provider.
 */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

/**
 * Fetch the current ETH price in USD.
 * @returns {Promise<number>} Price in USD, or 0 on failure.
 */
export const fetchETHPrice = async () => {
  try {
    const res  = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=ethereum&vs_currencies=usd`
    );
    const data = await res.json();
    return data.ethereum.usd;
  } catch {
    return 0;
  }
};

/**
 * Fetch the 7-day ETH price history for chart rendering.
 * @returns {Promise<Array<[timestamp, price]>>} Array of [ms, usd] pairs.
 */
export const fetchPriceHistory = async () => {
  try {
    const res  = await fetch(
      `${COINGECKO_BASE}/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily`
    );
    const data = await res.json();
    return data.prices || [];
  } catch {
    return [];
  }
};

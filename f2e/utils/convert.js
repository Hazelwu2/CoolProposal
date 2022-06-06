const getCurrencyPriceAPI = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum'

export const getEthPrice = async () => {
  try {
    const res = await fetch(getCurrencyPriceAPI)
    const data = await res.json()
    const ethPrice = data[0]?.current_price
    return parseFloat(ethPrice).toFixed(2)
  } catch (error) {
    cconsole.error('[Error]', error)
  }
}

export const getWeiToUSD = (wei, usd) => {
  return parseFloat()
}
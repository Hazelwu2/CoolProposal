const getCurrencyPriceAPI = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum'

export const getEthPrice = async () => {
  try {
    const res = await fetch(getCurrencyPriceAPI)
    const data = await res.json()
    const ethPrice = data[0]?.current_price
    return parseFloat(ethPrice).toFixed(2)
  } catch (error) {
    console.error('[🚸🚸]', error);
  }
}

export const getWEIPriceInUSD = (usd, wei) => {
  return parseFloat(convertWeiToETH(wei) * usd).toFixed(2)
}

export const getETHPriceInUSD = (usd, eth) => {
  return parseFloat(eth * usd).toFixed(2)
}

export const convertWeiToETH = (wei) => {
  return parseFloat(wei) / 1000000000000000000
}

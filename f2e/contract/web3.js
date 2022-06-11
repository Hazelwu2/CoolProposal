import Web3 from 'web3'
let web3

if (typeof window !== "undefined"
  && typeof window.web3 !== "undefined") {
  // we are in the browser and meta mask is installed
  console.error(1)
  console.log(Web3.givenProvider)
  // web3 = new Web3(window.ethereum);
  web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  // 您連接的節點沒有正確響應
} else {
  console.error(2)
  // we are on the server *OR* meta mask is not running
  // creating our own provider
  const provider = new Web3.providers.HttpProvider(
    `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
  );

  web3 = new Web3(provider);
}

console.log('web3', web3)

export default web3
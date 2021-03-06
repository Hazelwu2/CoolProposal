import Web3 from 'web3'
let web3

if (typeof window !== "undefined"
  && typeof window.web3 !== "undefined") {
  web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
} else {
  // we are on the server *OR* meta mask is not running
  // creating our own provider
  const provider = new Web3.providers.HttpProvider(
    `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
  );

  web3 = new Web3(provider);
}


export default web3
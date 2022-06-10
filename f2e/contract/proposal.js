import { ethers } from 'ethers'
import web3 from './web3'
import Proposal from '../../artifacts/contracts/Proposal.sol/Proposal.json'


export default (address) => {
  return new web3.eth.Contract(Proposal.abi, address);
};
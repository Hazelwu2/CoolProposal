import web3 from './web3'
import Proposal from '../../artifacts/contracts/Proposal.sol/Proposal.json'

const ProposalABI = Proposal.abi

const instance = (address) => {
  return new web3.eth.Contract(Proposal.abi, address);
};

export {
  instance,
  ProposalABI
}
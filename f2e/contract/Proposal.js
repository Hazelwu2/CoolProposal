import web3 from './web3'
import Proposal from './json/proposal.json'

const ProposalABI = Proposal.abi

const instance = (address) => {
  return new web3.eth.Contract(Proposal.abi, address);
};

export {
  instance,
  ProposalABI
}
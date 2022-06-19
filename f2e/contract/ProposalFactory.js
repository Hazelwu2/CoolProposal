import web3 from './web3'
import ProposalFactory from "../../artifacts/contracts/Proposal.sol/ProposalFactory.json";
import ProposalFactoryAddress from '../../artifacts/contracts/address'

const proposalFactory = {
  abi: ProposalFactory.abi,
  address: ProposalFactoryAddress
}

const instance = new web3.eth.Contract(
  proposalFactory.abi,
  proposalFactory.address
)

export {
  instance,
  proposalFactory,
}

import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'
const ProposalFactoryABI = ProposalFactory.abi
const ProposalFactoryAddress = '0xD38024156CEDdf6c73bC9787777Eb982e7C0edEB'

const instance = new web3.eth.Contract(
  ProposalFactoryABI,
  ProposalFactoryAddress
)

export {
  instance,
  ProposalFactoryABI,
  ProposalFactoryAddress
}

import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'
const ProposalFactoryABI = ProposalFactory.abi
const ProposalFactoryAddress = '0xA9854B17B6e65A72a334eB0f797786f7aC53Ebcc'

const instance = new web3.eth.Contract(
  ProposalFactoryABI,
  ProposalFactoryAddress
)

export {
  instance,
  ProposalFactoryABI,
  ProposalFactoryAddress
}

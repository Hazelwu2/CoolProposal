import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'
const ProposalFactoryABI = ProposalFactory.abi
const ProposalFactoryAddress = '0xd4B2F2D48bAaBc42996BC71ff30E10b4A77f4740'

const instance = new web3.eth.Contract(
  ProposalFactoryABI,
  ProposalFactoryAddress
)

export {
  instance,
  ProposalFactoryABI,
  ProposalFactoryAddress
}

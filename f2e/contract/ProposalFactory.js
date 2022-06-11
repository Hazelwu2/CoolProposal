import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'
const ProposalFactoryABI = ProposalFactory.abi
const ProposalFactoryAddress = '0x5AFf3F2fcB339a1AD476C477605B5d88Be57Ae05'

const instance = new web3.eth.Contract(
  ProposalFactoryABI,
  ProposalFactoryAddress
)

export {
  instance,
  ProposalFactoryABI,
  ProposalFactoryAddress
}

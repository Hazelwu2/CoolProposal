import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'
const ProposalFactoryABI = ProposalFactory.abi
const ProposalFactoryAddress = '0xbACdAEc9039253b2e88f66FEb3205d1F7C49C351'

const instance = new web3.eth.Contract(
  ProposalFactoryABI,
  // '0x931852Af71Bfc78aFf3dB6e9b024b43Fc8EA048F'
  ProposalFactoryAddress
)
// export default instance
export {
  instance,
  ProposalFactoryABI,
  ProposalFactoryAddress
}
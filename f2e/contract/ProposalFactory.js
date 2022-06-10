import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'


const instance = new web3.eth.Contract(
  ProposalFactory.abi,
  // '0x931852Af71Bfc78aFf3dB6e9b024b43Fc8EA048F'
  '0xbACdAEc9039253b2e88f66FEb3205d1F7C49C351'
)
export default instance
import web3 from './web3'
import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'

const instance = new web3.eth.Contract(
  ProposalFactory.abi,
  '0x931852Af71Bfc78aFf3dB6e9b024b43Fc8EA048F'
)
export default instance
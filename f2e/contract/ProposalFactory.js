import web3 from './web3'
// batch3
// import ProposalFactory from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
// hazel github
import ProposalFactory from './json/proposalFactory.json'
const ProposalFactoryABI = ProposalFactory.abi
// const ProposalFactoryAddress = '0x5D242d68ae938346Af56650fEA43169e317f7F96'
const ProposalFactoryAddress = '0x78e6816b82C8E41fB37DE53E99449acD66C54BE8'

const instance = new web3.eth.Contract(
  ProposalFactoryABI,
  ProposalFactoryAddress
)

export {
  instance,
  ProposalFactoryABI,
  ProposalFactoryAddress
}

const hre = require("hardhat");

async function main() {
  const imgUrl = 'https://www.aljazeera.com/wp-content/uploads/2021/04/GettyImages-1232454404.jpg?resize=770%2C513'

  // 建立 Proposal Factory
  const ProposalFactory = await ethers.getContractFactory("ProposalFactory");

  const proposalFactory = await ProposalFactory.deploy();
  await proposalFactory.deployed();

  // 呼叫 proposalFactory 建立提案合約
  await proposalFactory.createProposal(
    10, '測試提案標題', '提案描述', imgUrl
  )

  const getProposalList = await proposalFactory.getProposalList()


  console.log("Proposal 酷提案 deployed to: ", proposalFactory.address);
  console.log('所有提案合約列表', getProposalList)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

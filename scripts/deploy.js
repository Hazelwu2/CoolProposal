const hre = require("hardhat")
const dayjs = require('dayjs')
const { utils } = require("ethers")

const ethToWei = (eth) => {
  return utils.parseEther(eth.toString())
}
const tomorrowEndTime = dayjs().startOf('day').add(1, 'day').unix()

const list = [
  {
    title: '烏克蘭危機：救援行動',
    desc: '烏克蘭戰爭造成數千人死傷，超過460萬難民逃往鄰國. 無國界醫生（MSF）團隊正在努力為仍在烏克蘭的人們，以及在鄰國尋求安全的人提供緊急醫療援助',
    imageUrl: 'https://www.aljazeera.com/wp-content/uploads/2021/04/GettyImages-1232454404.jpg?resize=770%2C513',
    minimunContribution: ethToWei(0.00001),
    targetAmount: ethToWei(1),
    endTime: tomorrowEndTime
  },
  {
    title: 'React 讀書會',
    desc: '聚集一群對React有興趣的人們，一起精進自己的技能吧！分享遇到的實戰技巧，每週定期舉行一次讀書會，費用將用於讀書會必要支出，EX: 書籍、請講師演講等..',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png',
    minimunContribution: ethToWei(0.00001),
    targetAmount: ethToWei(0.05),
    endTime: tomorrowEndTime
  }
]

async function main() {
  // 建立 Proposal Factory
  const ProposalFactory = await ethers.getContractFactory("ProposalFactory");

  const proposalFactory = await ProposalFactory.deploy();
  await proposalFactory.deployed();

  // 呼叫 proposalFactory 建立提案合約
  // try {
  //   for (let i = 0; i < list.length; i++) {
  //     await proposalFactory.createProposal(
  //       list[i].targetAmount,
  //       list[i].title,
  //       list[i].desc,
  //       list[i].imageUrl,
  //       list[i].minimunContribution,
  //       list[i].endTime
  //     )
  //   }

  // } catch (error) {
  //   console.log('[發生錯誤]', error)
  // }

  const getProposalList = await proposalFactory.getProposalList()

  console.log("Proposal 酷提案 deployed to: ", proposalFactory.address);
  console.log('所有提案合約列表', getProposalList)
  // console.log(list[0].title, getProposalList[0])
  // console.log(list[1].title, getProposalList[1])

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

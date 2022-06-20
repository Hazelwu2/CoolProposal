const hre = require("hardhat")
const dayjs = require('dayjs')
const fs = require('fs')
const { utils } = require("ethers")

const ethToWei = (eth) => {
  return utils.parseEther(eth)
}
const tomorrowEndTime = dayjs().startOf('day').add(1, 'day').unix();

const list = [
  {
    title: 'Support Ukraine🇺🇦緊急救援烏克蘭',
    desc: '烏克蘭人道救援專案，邀請您在這寒冷的時刻，為烏克蘭難民送上溫暖',
    imageUrl: 'https://www.aljazeera.com/wp-content/uploads/2021/04/GettyImages-1232454404.jpg?resize=770%2C513',
    minimunContribution: ethToWei('0.001'),
    targetAmount: ethToWei('0.01'),
    endTime: tomorrowEndTime
  },
  // {
  //   title: 'React 讀書會',
  //   desc: '聚集一群對React有興趣的人們，一起精進自己的技能吧！分享遇到的實戰技巧，每週定期舉行一次讀書會，費用將用於讀書會必要支出，EX: 書籍、請講師演講等..',
  //   imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png',
  //   minimunContribution: ethToWei('0.001'),
  //   targetAmount: ethToWei('0.01'),
  //   endTime: dayjs().startOf('day').add(30, 'day').unix()
  // },
  {
    title: '新冠狀病毒(COVID-19)緊急應變基金',
    desc: '「新冠狀病毒(COVID-19) 緊急應變基金」的全數捐款，將用於購買急需的儀器及工具和應付迫切需要。此基金力求確保前線醫護人員有足夠的設備和物資，你的慷慨捐助讓我們的醫護人員能在短時間內增強承擔能力，以應對目前或將來的疫情需要。',
    imageUrl: 'https://i.imgur.com/PuG5e47.jpg',
    minimunContribution: ethToWei('0.001'),
    targetAmount: ethToWei('0.01'),
    endTime: dayjs().startOf('day').add(30, 'day').unix()
  },
  {
    title: '樹林保護環境計畫',
    desc: '環境保護基金會始終相信「老樹與人能夠和諧共存」，源於團隊夥伴對於原生珍貴老樹的重視，長期致力於「愛樹教育」，募資基金將用於愛樹基金教育',
    imageUrl: 'https://i.ytimg.com/vi/ld3TpnnKHF4/maxresdefault.jpg',
    minimunContribution: ethToWei('0.001'),
    targetAmount: ethToWei('0.01'),
    endTime: dayjs().startOf('day').add(30, 'day').unix()
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

  console.log("ProposalFactory 酷提案，合約地址: ", proposalFactory.address);
  const getProposalList = await proposalFactory.getProposalList()
  console.log('所有提案合約列表', getProposalList)
  // console.log(list[0].title, getProposalList[0])
  // console.log(list[1].title, getProposalList[1])
  fs.writeFileSync(`artifacts/contracts/address.js`,
    `export default '${proposalFactory.address}'`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

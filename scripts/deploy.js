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
    title: 'Support Ukraineðºð¦ç·æ¥ææ´çåè­',
    desc: 'çåè­äººéææ´å°æ¡ï¼éè«æ¨å¨éå¯å·çæå»ï¼çºçåè­é£æ°éä¸æº«æ',
    imageUrl: 'https://www.aljazeera.com/wp-content/uploads/2021/04/GettyImages-1232454404.jpg?resize=770%2C513',
    minimunContribution: ethToWei('0.001'),
    targetAmount: ethToWei('0.01'),
    endTime: tomorrowEndTime
  },
  // {
  //   title: 'React è®æ¸æ',
  //   desc: 'èéä¸ç¾¤å°Reactæèè¶£çäººåï¼ä¸èµ·ç²¾é²èªå·±çæè½å§ï¼åäº«éå°çå¯¦æ°æå·§ï¼æ¯é±å®æèè¡ä¸æ¬¡è®æ¸æï¼è²»ç¨å°ç¨æ¼è®æ¸æå¿è¦æ¯åºï¼EX: æ¸ç±ãè«è¬å¸«æ¼è¬ç­..',
  //   imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png',
  //   minimunContribution: ethToWei('0.001'),
  //   targetAmount: ethToWei('0.01'),
  //   endTime: dayjs().startOf('day').add(30, 'day').unix()
  // },
  {
    title: 'æ°å ççæ¯(COVID-19)ç·æ¥æè®åºé',
    desc: 'ãæ°å ççæ¯(COVID-19) ç·æ¥æè®åºéãçå¨æ¸ææ¬¾ï¼å°ç¨æ¼è³¼è²·æ¥éçåå¨åå·¥å·åæä»è¿«åéè¦ãæ­¤åºéåæ±ç¢ºä¿åç·é«è­·äººå¡æè¶³å¤ çè¨­ååç©è³ï¼ä½ çæ·æ¨æå©è®æåçé«è­·äººå¡è½å¨ç­æéå§å¢å¼·æ¿æè½åï¼ä»¥æå°ç®åæå°ä¾çç«æéè¦ã',
    imageUrl: 'https://i.imgur.com/PuG5e47.jpg',
    minimunContribution: ethToWei('0.001'),
    targetAmount: ethToWei('0.01'),
    endTime: dayjs().startOf('day').add(30, 'day').unix()
  },
  {
    title: 'æ¨¹æä¿è­·ç°å¢è¨ç«',
    desc: 'ç°å¢ä¿è­·åºéæå§çµç¸ä¿¡ãèæ¨¹èäººè½å¤ åè«§å±å­ãï¼æºæ¼åéå¤¥ä¼´å°æ¼åççè²´èæ¨¹çéè¦ï¼é·æè´åæ¼ãææ¨¹æè²ãï¼åè³åºéå°ç¨æ¼ææ¨¹åºéæè²',
    imageUrl: 'https://i.ytimg.com/vi/ld3TpnnKHF4/maxresdefault.jpg',
    minimunContribution: ethToWei('0.001'),
    targetAmount: ethToWei('0.01'),
    endTime: dayjs().startOf('day').add(30, 'day').unix()
  }
]

async function main() {
  // å»ºç« Proposal Factory
  const ProposalFactory = await ethers.getContractFactory("ProposalFactory");

  const proposalFactory = await ProposalFactory.deploy();
  await proposalFactory.deployed();


  // å¼å« proposalFactory å»ºç«ææ¡åç´
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
  //   console.log('[ç¼çé¯èª¤]', error)
  // }

  console.log("ProposalFactory é·ææ¡ï¼åç´å°å: ", proposalFactory.address);
  const getProposalList = await proposalFactory.getProposalList()
  console.log('ææææ¡åç´åè¡¨', getProposalList)
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

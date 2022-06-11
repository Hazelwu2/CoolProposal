<h1 align="center">
  來點🆒提案
</h1>
<p align="center">Crowdfunding in Blockchain</p>
<p align="center">讓我們集合力量，讓美好的事物發生。</p>

<p align="center">
  <img src="./cover.png" width="700px">
</p>

<p align="center">
    <a href="https://cool-proposal.vercel.app/" target="blank">Online Demo</a>
    ·
     <!-- <a href="https://hiippo.gitbook.io/trustnews-dao/" target="blank">白皮書</a> -->
</p>

## 🚤 Introduce
### 👩‍👩‍👧‍👧 來點酷提案吧
Web版群眾集資平台，實現夢想，透過 Web3 與區塊鏈技術，讓金流更透明，需要達到贊助人數 50% 以上同意，提案者才可領取款項。

<!-- [🧐 更多說明](https://hiippo.gitbook.io/trustnews-dao/) -->


## 🛠️ 開發
本專案分為 Solidity 智能合約、前端開發。
- 智能合約：contracts
- 前端Dapp：f2e資料夾

### 📱 Dapp
Install
```
$ cd ./f2e
$ yarn install && yarn dev
```
📱 開啟 `http://localhost:3000/kcrypto-camp-final-project-team` ，便可看到 Dapp 開發環境<br>
👨🏼‍💻 複製 .env.example，另取名 `.env` 設定 REACT_APP_INFURA_ID [Infura](https://infura.io/) 申請 Project 取得 ID

### 👨‍💻 Solidity
Install
```bash
$ cd batch3-final-project-team-6
$ yarn install
$ npx hardhat node # 啟動 Hardhat 節點 localhost:8545
$ npx hardhat compile
$ npx hardhat run srcripts/deploy.js --network localhost # 部署到本地
$ npx hardhat run srcripts/deploy.js --network rinkeby # 部署到Rinkby測試鏈
```


### 👨‍💻 Develop Contract & Test Connect Contract in Dapp
開發合約及部署，最後在 Dapp 調試步驟

```
1. 在 `contracts` 新增合約 xxx.sol
2. 在 `scripts/deploy` 新增部署
3. $ `npx hardhat run srcripts/deploy.js --network localhost` 部署到本地
4. `f2e/contract/json` 引入合約 Address 及 abi json
5. 在 Dapp `f2e/src` 進行串接調試合約
```

## ☕ Reference
本專案使用到以下工具
- [Hardhat](https://hardhat.org/getting-started/)
- [React Hook Wagmi](https://wagmi.sh/)
- [React v18](https://zh-hant.reactjs.org/)
- [Nextjs](https://nextjs.org/)
- [Web3.js](https://web3js.readthedocs.io/)

## ☝ 編輯歷程

|版本|編輯時間|編輯人|說明|
|:---|:---|:---|:---|
|v1|2022/06/11|Hazel|Readme初版|


https://www.aljazeera.com/wp-content/uploads/2021/04/GettyImages-1232454404.jpg?resize=770%2C513

###### tags: `期末報告` `3期第6組`
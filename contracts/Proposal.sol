// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4;

contract ProposalFactory {
    // Instance Proposal Contract
    Proposal proposal;
    // Track Created Proposal Address in Array
    Proposal[] public proposalsAddress;
    // 紀錄事件發生
    event CreateProposal(address, uint256, string, string, string, uint256, uint256);

    function createProposal(
        uint256 _targetAmount,
        string memory _title,
        string memory _desc,
        string memory _imageUrl,
        uint256 _minimunContribution,
        uint256 _endTime
    ) external {
        proposal = new Proposal(
            msg.sender,
            _targetAmount,
            _title,
            _desc,
            _imageUrl,
            _minimunContribution,
            _endTime
        );
        proposalsAddress.push(proposal);
        emit CreateProposal(msg.sender, _targetAmount, _title, _desc,_imageUrl, _minimunContribution,_endTime);
    }

    function getProposalList() public view returns (Proposal[] memory) {
        return proposalsAddress;
    }
}

contract Proposal {
    // 提案者
    address public proposer;
    // 目標金額
    uint256 public targetAmount;
    // 提案名稱
    string public ProposalTitle;
    // 提案描述
    string public ProposalDescription;
    // 提案圖片
    string public imageUrl;
    // 贊助人數
    uint256 public approversCount;
    // 是否達成目標
    bool public targetToAchieve;
    // 提款要求
    Request[] public requests;
    // 贊助最低金額
    uint256 public minimunContribution;
    // 專案結束時間
    uint256 public endTime;
    // 儲存贊助者總贊助金額
    mapping(address => uint256) public sponsorTotalContribution;
    // 專案贊助列表
    DonateInfo[] donateList;

    struct Request {
        string description; // 提款原因
        uint256 amount; // 提款金額
        bool complete; // 是否完成
        // uint256 approversCount; // 此次提款的贊助人數
        uint256 approvalCount; // 同意提款人數
        mapping(address => bool) approvals; // 有權利按贊助名單
        // address recipient; // 撥款地址
    }

    // 贊助明細
    struct DonateInfo
    {
        address sponsor;
        uint256 amount;
        uint256 donateTime;
    }

    // Create New Contract
    constructor(
        address _proposer,
        uint256 _targetAmount,
        string memory _title,
        string memory _desc,
        string memory _imageUrl,
        uint256 _minimunContribution,
        uint256 _endTime
    ) {
        // 最小募資金額需 > 0
        require(_targetAmount > 0, "minimunContribution should > 0");
        // 最小贊助金額需 > 0
        require(_minimunContribution > 0, "minimunContribution should > 0");
        // 最小募資金額 需 >= 最小贊助金額
        require(_targetAmount >= _minimunContribution, "minimunContribution should > 0");
        // 專案結束時間 > 目前時間
        require(_endTime > block.timestamp, "endTime should > now");
        proposer = _proposer;
        targetAmount = _targetAmount;
        ProposalTitle = _title;
        ProposalDescription = _desc;
        imageUrl = _imageUrl;
        minimunContribution = _minimunContribution;
        endTime = _endTime;
    }

    // 贊助
    function donate() public payable {
        require(msg.sender != proposer, "proposer can't donate");
        require(msg.value >= minimunContribution, "donate < minimunContribution");
        require(msg.value > 0, "unenough value");
        approversCount++;
        // 記錄使用者總共贊助多少金額
        sponsorTotalContribution[msg.sender] += msg.value;
        // 紀錄專案贊助紀錄
        DonateInfo storage newDonate = donateList.push();
        newDonate.sponsor = msg.sender;
        newDonate.amount = msg.value;
        newDonate.donateTime = block.timestamp;

        // 贊助金額 >= 目標金額時, 達成募資專案
        if (address(this).balance >= targetAmount)
        {
            targetToAchieve = true;
        }
    }

    // 取得贊助列表
    function getDonateList() public view returns (DonateInfo[] memory)
    {
        return donateList;
    }

    // 建立提款請求
    function createRequest(
        string memory _description,
        uint256 _amount
        // address _recipient
    ) public {
        // 要達成募款金額才能提款
        require(targetToAchieve, "target not Achieve");
        // 申請提款者必須是提案本人
        require(msg.sender == proposer, "Only Proposer can create request.");
        // 合約沒有錢，不可建立提款
        require(address(this).balance > 0, "The contract has no money");
        // 提領金額必須 > 0
        require(_amount > 0, "unenough value");
        // 合約的錢 >= 提領金額
        require(address(this).balance >= _amount, "insufficient balance");

        Request storage newRequest = requests.push();
        newRequest.description = _description;
        newRequest.amount = _amount;
        // newRequest.recipient = _recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    // 贊助者同意對方提款
    function approveRequest(uint index) public {
      // 已完成提款, 不需要再簽署
      require(!requests[index].complete, "proposal is complete");
      // 確認對方不是提案者
      require(msg.sender != proposer, "proposal can't approve");   
      // 確認對方為贊助者
      require(sponsorTotalContribution[msg.sender] > 0, "Only approvers can approve");   
      // 確認對方沒同意過          
      require(!requests[index].approvals[msg.sender], "Only sign once");
      // 將贊助者更改為同意
      requests[index].approvals[msg.sender] = true;
      // 同意數+1
      requests[index].approvalCount++;
      // 同意數 >= 贊助人數的1/2 就轉錢給提案者
      if (requests[index].approvalCount >= approversCount / 2)
      {
          finalizeRequest(index);
      }
    }

    // 贊助者按退款
    function refund() public 
    {
      // 贊助者才能退款
      require(sponsorTotalContribution[msg.sender] > 0, "only sponsor allow refund");
      require(!targetToAchieve, "target to Achieve can't refund");
      payable(msg.sender).transfer(sponsorTotalContribution[msg.sender]);
    }

    // 完成提款，偵測如果同意數 > 50% (贊助人數)，就call finalizeRequest
    function finalizeRequest(uint index) public {
        payable(proposer).transfer(requests[index].amount);
        requests[index].complete = true;
    }

    // 取得提案
    function getProposalSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            string memory,
            string memory,
            string memory,
            bool,
            uint256,
            uint256
        )
    {
        return (
            address(this).balance,
            targetAmount,
            requests.length,
            approversCount,
            proposer,
            ProposalTitle,
            ProposalDescription,
            imageUrl,
            targetToAchieve,
            minimunContribution,
            endTime
        );
    }

    // 取得提款要求總數
    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }
}

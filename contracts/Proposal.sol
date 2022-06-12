// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4;

contract ProposalFactory {
    // Instance Proposal Contract
    Proposal proposal;
    // Track Created Proposal Address in Array
    Proposal[] public proposalsAddress;
    // 紀錄事件發生
    event CreateProposal(address, uint256, string, string);

    function createProposal(
        uint256 _targetAmount,
        string memory _title,
        string memory _desc,
        string memory _imageUrl
    ) external {
        proposal = new Proposal(
            msg.sender,
            _targetAmount,
            _title,
            _desc,
            _imageUrl
        );
        proposalsAddress.push(proposal);
        emit CreateProposal(msg.sender, _targetAmount, _title, _desc);
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
    address[] public sponsor;
    // 贊助者
    mapping(address => bool) public approvers;
    // 贊助人數
    uint256 public approversCount;
    // 是否達成目標
    bool public targetToAchieve;
    // 提款要求
    Request[] public requests;

    struct Request {
        string description; // 提款原因
        uint256 amount; // 提款金額
        bool complete; // 是否完成
        uint256 approvalCount; // 同意提款人數
        mapping(address => bool) approvals; // 有權利按贊助名單
        address recipient; // 撥款地址
    }

    // Create New Contract
    constructor(
        address _proposer,
        uint256 _minAmount,
        string memory _title,
        string memory _desc,
        string memory _imageUrl
    ) {
        proposer = _proposer;
        targetAmount = _minAmount;
        ProposalTitle = _title;
        ProposalDescription = _desc;
        imageUrl = _imageUrl;
    }

    // 贊助
    function donate() public payable {
        require(msg.sender != proposer, "proposer can't donate");
        require(msg.value > 0, "unenough value");
        sponsor.push(msg.sender);
        approvers[msg.sender] = true;
        approversCount++;
    }

    // 建立提款請求
    function createRequest(
        string memory _description,
        uint256 _amount,
        address _recipient
    ) public {
        // 合約沒有錢，不可建立提款
        require(address(this).balance > 0, "The contract has no money");
        // 申請提款者必須是提案本人
        require(msg.sender == proposer, "Only Proposer can create request.");
        // 提領金額必須 > 0
        require(_amount > 0, "unenough value");
        // 提領金額 不可以 > 合約的錢
        require(address(this).balance > _amount, "insufficient balance");

        Request storage newRequest = requests.push();
        newRequest.description = _description;
        newRequest.amount = _amount;
        newRequest.recipient = _recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    // 贊助者同意對方提款
    function approveRequest() public {}

    // 完成提款，偵測如果同意數 > 50% (贊助人數)，就call finalizeRequest
    function finalizeRequest() public {}

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
            bool
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
            targetToAchieve
        );
    }

    // 取得提款要求總數
    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }
}

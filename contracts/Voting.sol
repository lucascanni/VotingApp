pragma solidity ^0.5.0;

contract Voting {
    uint public proposalCount = 0;

    struct Proposal {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Proposal) public proposals;

    event ProposalCreated(
        uint id,
        string name,
        uint voteCount
    );

    event Voted(
        uint id,
        uint voteCount
    );

    constructor() public {
    }

    function createProposal(string memory _name) public {
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, _name, 0);
        emit ProposalCreated(proposalCount, _name, 0);
    }

    function vote(uint _id) public {
        Proposal memory _proposal = proposals[_id];
        _proposal.voteCount++;
        proposals[_id] = _proposal;
        emit Voted(_id, _proposal.voteCount);
    }

    function getProposal(uint _id) public view returns (uint, string memory, uint) {
        Proposal memory _proposal = proposals[_id];
        return (_proposal.id, _proposal.name, _proposal.voteCount);
    }
}

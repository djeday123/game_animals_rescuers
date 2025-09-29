// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {
    mapping(address => bool) public gameMasters;
    
    // Добавляем msg.sender в конструктор Ownable
    constructor() ERC20("Animal Game Token", "AGT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }
    
    modifier onlyGameMaster() {
        require(gameMasters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function setGameMaster(address _gameMaster, bool _status) public onlyOwner {
        gameMasters[_gameMaster] = _status;
    }
    
    function mintReward(address _to, uint256 _amount) public onlyGameMaster {
        _mint(_to, _amount);
    }
    
    function burnTokens(address _from, uint256 _amount) public onlyGameMaster {
        _burn(_from, _amount);
    }
}
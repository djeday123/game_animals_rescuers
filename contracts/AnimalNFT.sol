// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AnimalNFT is ERC721, ERC721Enumerable, Ownable {
    struct Animal {
        string name;
        string species;
        uint256 rescueDate;
        address rescuer;
        string imageURI;
        bool isRescued;
    }

    mapping(uint256 => Animal) public animals;
    uint256 private _tokenIdCounter;
    
    event AnimalRescued(uint256 tokenId, string name, string species, address rescuer);
    event AnimalMinted(uint256 tokenId, address to);

    constructor() ERC721("Animal Rescuers", "RESCUE") Ownable(msg.sender) {}

    function rescueAnimal(
        address to,
        string memory name,
        string memory species,
        string memory imageURI
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        animals[tokenId] = Animal({
            name: name,
            species: species,
            rescueDate: block.timestamp,
            rescuer: to,
            imageURI: imageURI,
            isRescued: true
        });

        _safeMint(to, tokenId);
        
        emit AnimalRescued(tokenId, name, species, to);
        emit AnimalMinted(tokenId, to);
        
        return tokenId;
    }

    function getAnimal(uint256 tokenId) public view returns (Animal memory) {
        require(_ownerOf(tokenId) != address(0), "Animal does not exist");
        return animals[tokenId];
    }

    function getAnimalsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return result;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        return animals[tokenId].imageURI;
    }

    // Override required functions
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

// errors
error ERC721NonexistentToken(uint256 tokenId);

/**
 * @title A contract for minting Dynamic NFT images
 * @author Bobby William Major
 * @dev Mints a dynamic NFTs with information stored onchain
 * @notice The NFT changes based on the price of the USD to Eth
 */

contract DynamicSvgNft is ERC721 {
    // mint
    // store our SVG information somewhere
    // Some logic say "Show X Image" or "Show Image"

    uint256 private s_tokenCounter;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_prriceFeed;
    

    event CreatedNft(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress, 
        string memory lowSvg, 
        string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        i_prriceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory){
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        emit CreatedNft(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory){
        return "data:application/json;base64";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory){
        address owner = _ownerOf(tokenId);
       if (owner == address(0)) {
           revert ERC721NonexistentToken(tokenId);
       }
        //string memory imageURI = "hi!";
        (, int256 price,,,) = i_prriceFeed.latestRoundData(); 
        string memory imageURI = i_lowImageURI;
        if (price >= s_tokenIdToHighValue[tokenId]){
            imageURI = i_highImageURI;
        }

        return
        string(
        abi.encodePacked(
            _baseURI(),
        Base64.encode(bytes(abi.encodePacked(
            '{"name":"',
                 name(), // You can add whatever name here
                 '", "description":"An NFT that changes based on the Chainlink Feed", ',
                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                imageURI,
                '"}'
        )))));
    } 
}

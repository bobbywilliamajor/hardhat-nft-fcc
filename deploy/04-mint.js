const {ethers, network} = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const signer = await ethers.provider.getSigner()
    const contractBasic = await deployments.get("BasicNft")

    //Basic Nft
    const basicNft = await ethers.getContractAt("BasicNft", contractBasic.address, signer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    // Random IPFS NFT
    const contractRandom = await deployments.get("RandomIpfsNft")
    const randomIpfsNft = await ethers.getContractAt("RandomIpfsNft", contractRandom.address, signer)
    const mintFee = await randomIpfsNft.getMintFee()
    console.log(mintFee)

    await new Promise(async (resolve, reject)=> {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 500000)
        randomIpfsNft.once("NftMinted", async function(){
            resolve()
        })

        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({value: mintFee.toString()})
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
        console.log(randomIpfsNftMintTxReceipt)
        if(developmentChains.includes(network.name)) {
            const contractVrf = await deployments.get("VRFCoordinatorV2Mock")
            const requestId = randomIpfsNftMintTxReceipt.logs[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", contractVrf.address, signer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.target)
    
        }
    })

    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    // Dynamic SVG  NFT
    const contractDynamic = await deployments.get("DynamicSvgNft")
    const highValue = ethers.parseEther("4000")
    const dynamicSvgNft = await ethers.getContractAt("DynamicSvgNft", contractDynamic.address,signer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)

}
module.exports.tags = ["all", "mint"]


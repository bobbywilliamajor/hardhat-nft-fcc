const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { Log } = require("ethers")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.provider.getSigner()

    log("________________________________")
    const arguments = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...!")
        await verify(basicNft.address, arguments)
    }
}
module.exports.tags = ["all", "basicnft", "main"]

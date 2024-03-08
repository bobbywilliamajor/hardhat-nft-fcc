const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_API_SECRET
const pinata = new pinataSDK({ pinataApiKey, pinataSecretApiKey })

async function storeImages(imagesFilePath) {
    const fullPathImages = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullPathImages)
    const responses = []
    console.log("Loading to IPFS")
    console.log(files)
    for (fileIndex in files) {
        const readeableStreamForFile = fs.createReadStream(`${fullPathImages}/${files[fileIndex]}`)
        try {
            console.log(pinata)
            const response = await pinata.pinFileToIPFS(readeableStreamForFile, {
                pinataMetadata: { name: "dog-collections" },
            })
            console.log(response)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
module.exports = { storeImages, storeTokenUriMetadata }

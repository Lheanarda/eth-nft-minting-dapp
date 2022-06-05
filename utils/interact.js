const {createAlchemyWeb3} = require('@alch/alchemy-web3')
const {MerkleTree} = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('./whitelist')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
const {config} = require('../dapp.config')

const contract = require('../artifacts/contracts/NukedApe.sol/NukedApe.json')

const nftContract = new web3.eth.Contract(contract.abi, config.contractAddress)

//Calculate merkle root from whitelist array
const leafNodes = whitelist.map(addr=>keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs:true})
const root = merkleTree.getRoot()

export const getTotalMinted = async () => {
    const totalMinted = await nftContract.methods.totalSupply().call()
    return totalMinted
}

export const getMaxSupply = async () => {
    const maxSupply = await nftContract.methods.maxSupply().call()
    return maxSupply
}

export const isPausedState = async () => {
    const paused = await nftContract.methods.paused().call()
    return paused
}

export const isPublicSaleState = async() => {
    const publicSaleState = await nftContract.methods.publicM().call()
    return publicSaleState
}

export const isPreSaleState = async()=>{
    const presale = await nftContract.methods.presaleM().call()
    return presale
}

export const getAccountTotalMinted = async () => {
    const totalMinted = await nftContract.methods.balanceOf(window.ethereum.selectedAddress).call()
    console.log("total minted", totalMinted)
    return totalMinted
}   

export const checkIsValidWhitelist = async () => {
    const leaf = keccak256(window.ethereum.selectedAddress)
    const proof = merkleTree.getHexProof(leaf)

    // Verify merkleproof 
    const isValid = merkleTree.verify(proof, leaf, root)
    return isValid
}

export const presaleMint = async(mintAmount) => {
    if(!window.ethereum.selectedAddress){
        return {
            success:false,
            status:'Connect your wallet to mint!'
        }
    }

    const leaf = keccak256(window.ethereum.selectedAddress)
    const proof = merkleTree.getHexProof(leaf)

    // Verify merkleproof 
    const isValid = merkleTree.verify(proof, leaf, root)

    if(!isValid){
        return{
            success:false,
            status:'You are not on the whitelist'
        }
    }

    // prevent multiple transactions
    const nonce = await web3.eth.getTransactionCount(window.ethereum.selectedAddress, 'latest')

    // set up eth transaction
    const tx = {
        to:config.contractAddress,
        from : window.ethereum.selectedAddress,
        value: parseInt(
            web3.utils.toWei(String(config.price * mintAmount), 'ether')
        ).toString(16),
        // gas:String(300000*mintAmount),
        data: nftContract.methods.presaleMint(window.ethereum.selectedAddress, mintAmount, proof).encodeABI(),
        nonce : nonce.toString(16)
    }

    //  sign the transaction

    try{
        const txHash = await window.ethereum.request({
            method:'eth_sendTransaction',
            params:[tx]
        })

        const txHashLink = `https://rinkeby.etherscan.io/tx/${txHash}`
        return{
            success:true,
            status:(
                <a href={txHashLink} target="_blank" rel="noreferrer">
                    <p>Check your transaction on Etherscan</p>
                    <p>{txHashLink}</p>
                </a>
            )
        }
    }
    catch(err){
        return{
            success:false,
            status:`Something went wrong : ${err.message}`
        }
    }
}

export const publicMint = async (mintAmount) => {
    if(!window.ethereum.selectedAddress){
        return {
            success:false,
            status:'Connect your wallet to mint!'
        }
    }

    const leaf = keccak256(window.ethereum.selectedAddress)
    const proof = merkleTree.getHexProof(leaf)


    // prevent multiple transactions
    const nonce = await web3.eth.getTransactionCount(window.ethereum.selectedAddress, 'latest')

    // set up eth transaction
    const tx = {
        to:config.contractAddress,
        from : window.ethereum.selectedAddress,
        value: parseInt(
            web3.utils.toWei(String(config.price * mintAmount), 'ether')
        ).toString(16),
        // gas:String(300000*mintAmount),
        data: nftContract.methods.publicSaleMint(mintAmount).encodeABI(),
        nonce : nonce.toString(16)
    }

    //  sign the transaction

    try{
        const txHash = await window.ethereum.request({
            method:'eth_sendTransaction',
            params:[tx]
        })

        const txHashLink = `https://rinkeby.etherscan.io/tx/${txHash}`
        return{
            success:true,
            status:(
                <a href={txHashLink} target="_blank" rel="noreferrer">
                    <p>Check your transaction on Etherscan</p>
                    <p>{txHashLink}</p>
                </a>
            )
        }
    }
    catch(err){
        return{
            success:false,
            status:`Something went wrong : ${err.message}`
        }
    }
}
// eslint-disable-next-line @next/next/no-img-element
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react"
import { useEffect, useState } from "react"
import { config } from "../dapp.config"
import initOnboard from "../utils/onboard"
import {
  getTotalMinted, getMaxSupply, isPausedState, isPreSaleState, isPublicSaleState, presaleMint, getAccountTotalMinted, publicMint,checkIsValidWhitelist
} from '../utils/interact'

const randomApesArr = [19,26,31,40,46,57,59,60,63,65,67,68,70,72,74]

export default function Mint() {
  

  // general state
  const [currentNFTDisplay, setCurrentNFTDisplay] = useState(19)
  useEffect(()=>{
    setTimeout(()=>{
      let nextDisplay = randomApesArr[Math.floor(Math.random()*randomApesArr.length)]
      if(nextDisplay===currentNFTDisplay) nextDisplay = randomApesArr[Math.floor(Math.random()*randomApesArr.length)]
      setCurrentNFTDisplay(nextDisplay)
    },900)
  },[currentNFTDisplay])

  const [mintAmount, setMintAmount] = useState(1)
  const handleIncrementMint = () => {
    if(mintAmount<maxMintAmount){
      setMintAmount(mintAmount+1)
    }
  }
  const handleDecrementMint = () => {
    if(mintAmount>0){
      setMintAmount(mintAmount-1)
    }
  }

  // contract state
  const [loadingInit, setLoadingInit] = useState(false)
  const [totalMinted, setTotalMinted] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [paused, setPaused] = useState(false)
  const [publicSaleState, setPublicSaleState] = useState(false)
  const [presaleState, setPresaleState] = useState(false)
  const [maxMintAmount, setMaxMintAmount] = useState(0)
  const [status, setStatus] = useState(null)
  const [isMinting, setIsMinting] = useState(false)
  const [totalAccountMinted, setAccountTotalMinted] = useState(0)
  const [totalAccountMint, setTotalAccountMint] = useState(0)

  
  useEffect(()=>{
    const init = async () => {
      
      setLoadingInit(true)
      setMaxSupply(await getMaxSupply())
      setTotalMinted(await getTotalMinted())
      setPaused(await isPausedState())

      const isPresale = await isPreSaleState()
      const isPublic = await isPublicSaleState()
      setPresaleState(isPresale)
      setMaxMintAmount(isPresale ? config.presaleMaxMintAmount : config.maxMintAmount)
      setPublicSaleState(isPublic)
      setLoadingInit(false)
    }

    init()
  },[])

  
  
  const handlePresaleMint = async () => {
    try{
      setIsMinting(true)
      const {success, status} = await presaleMint(mintAmount)
      if(!success) throw new Error(status)
      setStatus({success, message:status})
      setMaxMintAmount(maxMintAmount-mintAmount)
      setMintAmount(0)
      const totalMinted = await getTotalMinted()
      setTotalMinted(totalMinted)
      
    }
    catch(err){
      setStatus({success:false, message:err.message})
    }
    finally{
      setIsMinting(false)
    }
  } 

  const handlePublicMint = async () => {
    try{
      setIsMinting(true)
      const {success, status} = await publicMint(mintAmount)
      if(!success) throw new Error(status)
      setStatus({success, message:status})
      setMaxMintAmount(maxMintAmount-mintAmount)
      setMintAmount(0)
      const totalMinted = await getTotalMinted()
      setTotalMinted(totalMinted)
      
    }
    catch(err){
      setStatus({success:false, message:err.message})
    }
    finally{
      setIsMinting(false)
    }
  }



  // blocknative / wallets state
  const [onboard, setOnboard] = useState(null)
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const connectedWallets = useWallets()

  // init blocknative
  useEffect(()=>{
    setOnboard(initOnboard)
  },[])

  const handleConnectWallet = async () => {
    await connect()
    const totalMinted = await getAccountTotalMinted()
    setMaxMintAmount(maxMintAmount-parseInt(totalMinted))
    if(presaleState){
      const valid = await checkIsValidWhitelist()
      if(valid) setStatus({success:true, message:'You are eligible to mint'})
      else setStatus({success:false, message:"You are not eligible to mint"})
    }
  }



  /* useEffect(()=>{
    if(!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(({label})=> label)
    window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletsLabelArray))
  },[connectedWallets]) */

  /* useEffect(()=>{
    if(!onboard) return 

    const previouslyConnectedWallets = JSON.parse(
        window.localStorage.getItem('connectedWallets')
    )

    if(previouslyConnectedWallets?.length){
        async function setWalletFromLocalStorage(){
            await connect({
                autoSelect : {
                    label:previouslyConnectedWallets[0],
                    disableModals:true
                }
            })
        }

        setWalletFromLocalStorage()
    }
  },[onboard, connect]) */


  return (
    <div className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-center bg-brand-background ">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <img
          src="/images/blur.jpeg"
          className="animate-pulse-slow absolute inset-auto block w-full min-h-screen object-cover"
        />

        <div className="flex flex-col items-center justify-center h-full w-full px-2 md:px-10">
          <div className="relative z-1 md:max-w-3xl w-full bg-gray-900/90 filter backdrop-blur-sm py-4 rounded-md px-2 md:px-10 flex flex-col items-center">
            
            <h1 className="font-coiny uppercase font-bold text-3xl md:text-4xl bg-gradient-to-br  from-brand-green to-brand-blue bg-clip-text text-transparent mt-3">
              {publicSaleState && 'Public Mint'}
              {presaleState && 'Whitelist Mint'}
              {(!publicSaleState && !presaleState) && 'Coming Soon'}
            </h1>
            <h3 className="text-sm text-pink-200 tracking-widest">
              {wallet?.accounts[0]?.address 
                ? wallet?.accounts[0]?.address.slice(0,8) + '...' + wallet?.accounts[0]?.address.slice(-4)
                : ''
              }
            </h3>

            <div className="flex flex-col md:flex-row md:space-x-14 w-full mt-10 md:mt-14">
              <div className="relative w-full">
                <div className="font-coiny z-10 absolute top-2 left-2 opacity-80 filter backdrop-blur-lg text-base px-4 py-2 bg-black border border-brand-purple rounded-md flex items-center justify-center text-white font-semibold">
                  <p>
                    <span className="text-brand-pink">{totalMinted}</span> / {maxSupply}
                  </p>
                </div>


                <img
                  src= {`/images/${currentNFTDisplay}.png`}
                  className="object-cover w-full sm:h-[280px] md:w-[250px] rounded-md"
                />
              </div>

              <div className="flex flex-col items-center w-full px-4 mt-16 md:mt-0">
                <div className="font-coiny flex items-center justify-between w-full">
                  <button
                    className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center text-brand-background hover:shadow-lg bg-gray-300 font-bold rounded-md"
                    onClick={handleDecrementMint}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 md:h-8 md:w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 12H6"
                      />
                    </svg>
                    
                  </button>

                  <p className="flex items-center justify-center flex-1 grow text-center font-bold text-brand-pink text-3xl md:text-4xl">
                    {mintAmount}
                  </p>

                  <button
                    className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center text-brand-background hover:shadow-lg bg-gray-300 font-bold rounded-md"
                    onClick={handleIncrementMint}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 md:h-8 md:w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-pink-200 tracking-widest mt-3">
                  Max Mint Amount: {maxMintAmount}
                </p>

                <div className="border-t border-b py-4 mt-16 w-full">
                  <div className="w-full text-xl font-coiny flex items-center justify-between text-brand-yellow">
                    <p>Total</p>

                    <div className="flex items-center space-x-3">
                      <p>
                        {Number.parseFloat(config.price * 1).toFixed(
                          2
                        )}{' '}
                        ETH
                      </p>{' '}
                      <span className="text-gray-400">+ GAS</span>
                    </div>
                  </div>
                </div>

                {/* Mint Button && Connect Wallet Button */}
                {wallet 
                    ? <button
                        className={ `${paused || isMinting ? 
                          'bg-gray-900 cursor-not-allowed' : 
                          'bg-gradient-to-br from-brand-purple to-brand-pink hover:shadow-pink-400/50'
                        } 
                        font-coiny mt-12 w-full  shadow-lg px-6 py-3 rounded-md text-2xl text-white  mx-4 tracking-wide uppercase`}
                        disabled={paused || isMinting || loadingInit}
                        onClick={presaleState ? handlePresaleMint : handlePublicMint}
                    >
                        {isMinting ? 'Minting...' : 'Mint'}
                    </button>
                    : <button
                        className={ `${loadingInit ? 
                          'bg-gray-900 cursor-not-allowed' : 
                          'bg-gradient-to-br from-brand-purple to-brand-pink hover:shadow-pink-400/50'
                        } 
                        font-coiny mt-12 w-full  shadow-lg px-6 py-3 rounded-md text-2xl text-white  mx-4 tracking-wide uppercase`}
                        disabled={loadingInit}
                        onClick={handleConnectWallet}
                    >
                        Connect Wallet
                    </button>
                }
              </div>
            </div>

            {/* Status */}
            {status && <div
                className={`border ${status.success ? 'border-green-500' : 'border-pink-400'} border-brand-pink-400 rounded-md text-start h-full px-4 py-4 w-full mx-auto mt-8 md:mt-4`}
              >
                  <p className="flex flex-col space-y-2 text-white text-sm md:text-base break-words ...">
                  {status.message}
                </p>
              </div>}
            

            {/* Contract Address */}
            <div className="border-t border-gray-800 flex flex-col items-center mt-10 py-2 w-full">
              <h3 className="font-coiny text-2xl text-brand-pink uppercase mt-6">
                Contract Address
              </h3>
              <a
                href={`https://rinkeby.etherscan.io/address/${config.contractAddress}#readContract`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 mt-4"
              >
                <span className="break-all">{config.contractAddress}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
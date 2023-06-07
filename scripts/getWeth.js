const { getNamedAccounts, ethers } = require("hardhat")

async function getWeth(amount) {
    const { deployer } = await getNamedAccounts()
    //abi, contract address
    //wETH main net 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    //WETH sepolia 0xdd13E55209Fd76AfE204dBda4007C227904f0a81
    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer
    )
    const tx = await iWeth.deposit({ value: amount })
    await tx.wait(1)
    const wethBalance = await ethers.utils.formatEther(
        await iWeth.balanceOf(deployer)
    )
    console.log(`Got ${wethBalance} WETH`)
}

module.exports = { getWeth }

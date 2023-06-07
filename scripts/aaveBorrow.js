const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth } = require("./getWeth")
const { BigNumber } = require("ethers")

const AMOUNT = ethers.utils.parseEther("0.02")

async function main() {
    //the protocol treats everything as ERC-20 -> we need wETH
    await getWeth(AMOUNT)
    const { deployer } = await getNamedAccounts()

    //get the lending pool contract
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address: ${lendingPool.address}`)

    //deposit to the pool
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    //approve the pool to transfer wETH from our wallet
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    //deposit wETH into the pool
    console.log("Depositing...")
    lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    //borrow DAI against the deposited wETH
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    )

    //availableBorrowETH to DAI? What is the conversion rate on DAI?
    const daiPrice = await getDaiPrice()

    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())

    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = await ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    )
    console.log(`You can borrow ${amountDaiToBorrowWei} DAI in wei`)

    //Borrow Time!
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F" //ETH mainnet
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )

    await getBorrowUserData(lendingPool, deployer)

    await repayDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer)

    await getBorrowUserData(lendingPool, deployer)
}

async function repayDai(daiAddress, lendingPool, amountDaiToRepayWei, account) {
    console.log("Approving token to repay...")
    await approveErc20(
        daiAddress,
        lendingPool.address,
        amountDaiToRepayWei,
        account
    )
    console.log("Repaying...")
    const repayTx = await lendingPool.repay(
        daiAddress,
        amountDaiToRepayWei,
        1,
        account
    )
    await repayTx.wait(1)
    console.log("Repayed!")
}

async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrowWei,
    account
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        1,
        0,
        account
    )

    await borrowTx.wait(1)
    console.log("Borrowed")
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const { answer } = await daiEthPriceFeed.latestRoundData()

    return answer
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)

    console.log(`Stats for address: ${account}`)
    console.log(`Total Collateral: ${totalCollateralETH} worth of ETH (in Wei)`)
    console.log(`Total Debt: ${totalDebtETH} worth of ETH (in Wei)`)
    console.log(
        `Available to borrow: ${availableBorrowsETH} worth of ETH (in Wei)`
    )
    return { availableBorrowsETH, totalDebtETH }
}

async function approveErc20(
    contractAddress,
    spenderAddress,
    amountToSpend,
    account
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        contractAddress,
        account
    )
    console.log("Approving tokens...")
    tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })

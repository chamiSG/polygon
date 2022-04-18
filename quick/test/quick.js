const { ethers } = require("hardhat");
const { expect } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');
const { getBigNumber } = require("./utils");

const LqdrToken = artifacts.require('LqdrToken');
const MasterChef = artifacts.require('MasterChefV2');
const MasterChefFarms = artifacts.require('MasterChefFarms');

describe("Master Chef Farms", () => {
  const protocalId = 80001;
  const dai = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";   //Dai Stablecoin on Polygon
  const uni = "0xb33EaAd8d922B1083446DC23f610c2567fB5180f";  //Uni on Polygon uni: 
  const magic = "0x0000000000000000000000000000000000001010"; //Magic on Polygon

  let provider, erc20;
  let chef, chefFarms, lqdr;

  let signers, whaleSigner, owner, whale, minter, fee, dev, alice, bob;
  let tokenUni, tokenDai;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    [owner] = await ethers.getSigners();
    whale = signers[1].address;
    minter = signers[1].address;
    dev = signers[3].address;
    fee = signers[4].address;
    alice = signers[5].address;
    bob = signers[6].address;

    provider = ethers.getDefaultProvider();

    erc20 = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      ethers.constants.AddressZero
    );

    lqdr = await LqdrToken.new({ from: minter });
    chef = await MasterChef.new(lqdr.address, dev, fee, '1000', '100', { from: minter }); 
    await lqdr.transferOwnership(chef.address, { from: minter }); 
    chefFarms = await MasterChefFarms.new([protocalId], ["0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"], ["0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"], [chef.address], minter, { from: minter });
    
  });

  it("Should check the addliquidity and create LP token.", async function () {
    
    const to = "0xAdf9319359718fa2320Af2CA96d7Fc024329c928";
    
    await hre.network.provider.send("hardhat_impersonateAccount", [whale]);
    whaleSigner = await ethers.provider.getSigner(whale);

    tokenDai = await erc20.attach(dai);
    tokenUni = await erc20.attach(uni);
    const tokenLqdr = await erc20.attach(lqdr);
    
    let fweth = await chefFarms.getWETH(protocalId);
    let ether_amount = 1;

    let amountADesired = await chefFarms.getAmountsOut(protocalId, getBigNumber(ether_amount, 18), [fweth, tokenDai.address]);
    console.log(amountADesired[1]);
    // await chefFarms.swapETHforToken(
    //   protocalId,
    //   amountADesired[1],
    //   [fweth, tokenDai.address],
    //   whale,
    //   {
    //     value: getBigNumber(ether_amount, 18)
    //   }
    // );
    // let bal_dai = await tokenDai.balanceOf(whale);
    // console.log("DAI token's balance:", bal_dai);

    let amountEDesired = await chefFarms.getAmountsOut(protocalId, getBigNumber(ether_amount, 18), [fweth, tokenUni.address]);
    console.log(amountEDesired[1]);
    await chefFarms.swapETHforToken(
      protocalId,
      amountEDesired[1],
      [fweth, tokenUni.address],
      whale,
      {
        value: getBigNumber(ether_amount, 18)
      }
    );
    let bal_uni = await tokenUni.balanceOf(whale);
    console.log("UNI token's balance:", bal_uni);
    
    
    //let amounts = await router.getAmount(uni, dai, bal_uni, bal_dai, 1, 1);
    //console.log(amounts['amountA']);
    // await tokenUni.approve(router.address, amounts['amountA']);
    // await tokenDai.approve(router.address, amounts['amountB']);
    // await router.safeTransfer(uni, amounts['amountA']);
    // await router.safeTransfer(dai, amounts['amountB']);

    // addLiquidityResult = await chefFarms.addLiquidity(
    //   protocalId,
    //   uni,
    //   dai,
    //   getBigNumber(1, 18),
    //   getBigNumber(1, 18),
    //   1,
    //   1,
    //   whale,
    //   Date.now() + 60 * 60
    // );
    
  });
  // it("Should add the created LP in the MasterChef pool", async function () {
  //   await hre.network.provider.send("hardhat_impersonateAccount", [whale]);
  //   whaleSigner = await ethers.provider.getSigner(whale);
  //   let pairAddr = await chefFarms.getPair(protocalId, uni, dai);
  //   let lpToken = await erc20.attach(pairAddr);
  //   console.log("QUICK LP(UNI/DAI) token's balance:", await lpToken.balanceOf(whale));
  //   let bal = await lpToken.balanceOf(whale);
    
  //   await chefFarms.add(protocalId, parseInt(bal * 0.1), lpToken.address, 100, true, { from: whale });
  //   assert.equal((await chefFarms.poolLength(protocalId)).toString(), "1");
    
  // });

  // it("Should deposit and withdraw the created LP in the correct Farm", async function () {

  //   await hre.network.provider.send("hardhat_impersonateAccount", [whale]);
  //   whaleSigner = await ethers.provider.getSigner(whale);
    
  //   let pairAddr = await chefFarms.getPair(protocalId, uni, dai);
  //   let lpToken = await erc20.attach(pairAddr);
  //   let bal = await lpToken.balanceOf(whale);
  //   console.log("SPIRIT LP(UNI/DAI) token's balance:", bal);

  //   await chefFarms.add(protocalId, parseInt(bal * 0.1), lpToken.address, 100, true, { from: whale });
  //   assert.equal((await chefFarms.poolLength(protocalId)).toString(), "1");

  //   await lpToken.approve(alice, 100);
  //   await lpToken.transfer(alice, 100);
  //   console.log("Alice's LP Token Amount: ", (await lpToken.balanceOf(alice)).toString());

  //   await hre.network.provider.send("hardhat_impersonateAccount", [alice]);
  //   let aliceSigner = await ethers.provider.getSigner(alice);

  //   let aliceBalanceBeforeDeposit = await lpToken.connect(aliceSigner).balanceOf(alice);
  //   await lpToken.connect(aliceSigner).approve(chef.address, 100);
  //   await chefFarms.deposit(protocalId, 0, 20, bob, { from: alice });
  //   await chefFarms.deposit(protocalId, 0, 40, bob, { from: alice });
  //   let aliceBalanceAfterDeposit = await lpToken.connect(aliceSigner).balanceOf(alice);
  //   assert.equal((aliceBalanceBeforeDeposit - aliceBalanceAfterDeposit).toString(), '60');
    
  //   await chefFarms.withdraw(protocalId, 0, '10', { from: alice });
  //   let aliceBalanceAfterWithdraw = await lpToken.connect(aliceSigner).balanceOf(alice);
  //   assert.equal((aliceBalanceBeforeDeposit - aliceBalanceAfterWithdraw).toString(), '50');
    
  // });

});

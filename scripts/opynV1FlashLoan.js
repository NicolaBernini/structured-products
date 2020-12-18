require("dotenv").config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { ether } = require("@openzeppelin/test-helpers");
const accounts = require("../constants/accounts.json");
const OpynV1Adapter = require("../build/contracts/OpynV1Adapter.json");
const MockFactory = require("../build/contracts/MockDojiFactory.json");
const IERC20 = require("../build/contracts/IERC20.json");
const IOToken = require("../build/contracts/IOToken.json");

let web3;
const admin = accounts.kovan.admin;
const owner = accounts.kovan.owner;
const aaveAddressProvider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// oToken terms
const underlying = "0x0000000000000000000000000000000000000000";
const strikeAsset = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const expiry = "1608883200";
const oTokenAddress = "0xb759e6731df19abD72e0456184890f87dCb6C518";
const CALL_TYPE = 2;
const optionType = CALL_TYPE;
const strikePrice = ether("500");
const vaults = [
  "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
  "0xC5Df4d5ED23F645687A867D8F83a41836FCf8811",
];

async function deployOpynV1Adapter(dojiFactoryAddress) {
  const opynV1Contract = new web3.eth.Contract(OpynV1Adapter.abi);
  const opynV1Instance = await opynV1Contract
    .deploy({
      data: OpynV1Adapter.bytecode,
      arguments: [aaveAddressProvider],
    })
    .send({ from: owner });

  console.log("OpynV1Adapter deployed at " + opynV1Instance.options.address);

  await opynV1Instance.methods
    .initialize(
      owner,
      dojiFactoryAddress,
      aaveAddressProvider,
      uniswapRouter,
      weth,
      ether("0.995")
    )
    .send({ from: owner });

  await setOToken(opynV1Instance);

  return opynV1Instance;
}

async function purchaseOToken(opynV1Adapter) {
  const purchaseAmount = ether("500");
  const premium = await opynV1Adapter.methods
    .premium(
      underlying,
      strikeAsset,
      expiry,
      strikePrice,
      optionType,
      purchaseAmount
    )
    .call();

  console.log(`Premium is ${web3.utils.fromWei(premium, "ether")} ETH`);

  await opynV1Adapter.methods
    .purchase(
      underlying,
      strikeAsset,
      expiry,
      strikePrice,
      optionType,
      purchaseAmount
    )
    .send({ value: premium, from: owner });

  const oToken = new web3.eth.Contract(IERC20.abi, oTokenAddress);
  const oTokenBalance = await oToken.methods.balanceOf(owner).call();
  console.log(`oToken starting balance: ${oTokenBalance}`);
}

async function exerciseOToken(opynV1Adapter) {
  const oToken = new web3.eth.Contract(IERC20.abi, oTokenAddress);

  await opynV1Adapter.methods
    .setVaults(oTokenAddress, vaults)
    .send({ from: owner });

  await oToken.methods
    .approve(opynV1Adapter.options.address, "500000000")
    .send({ from: owner });

  const startETHBalance = await web3.eth.getBalance(owner);
  console.log(
    `Start ETH balance: ${web3.utils.fromWei(startETHBalance, "ether")}`
  );

  await opynV1Adapter.methods
    .exercise(oTokenAddress, 0, ether("500"))
    .send({ from: owner });

  const oTokenBalance = await oToken.methods.balanceOf(owner).call();
  console.log(`oToken balance after exercising: ${oTokenBalance}`);

  const endETHBalance = await web3.eth.getBalance(owner);
  console.log(`End ETH balance: ${web3.utils.fromWei(endETHBalance, "ether")}`);

  const contractETHBalance = await web3.eth.getBalance(
    opynV1Adapter.options.address
  );
  console.log(
    `Adapter ETH balance: ${web3.utils.fromWei(contractETHBalance, "ether")}`
  );
}

async function setOToken(opynV1Adapter) {
  await opynV1Adapter.methods
    .setOTokenWithTerms(strikePrice, optionType, oTokenAddress)
    .send({ from: owner });

  const oTokenSet = await opynV1Adapter.methods
    .lookupOToken(underlying, strikeAsset, expiry, strikePrice, optionType)
    .call();
  console.log(`oToken set ${oTokenSet}`);
}

async function deployDojiFactory() {
  const factoryContract = new web3.eth.Contract(MockFactory.abi);
  const factoryInstance = await factoryContract
    .deploy({ data: MockFactory.bytecode, arguments: [owner, admin] })
    .send({ from: owner });
  console.log("DojiFactory deployed at " + factoryInstance.options.address);

  await factoryInstance.methods.setInstrument(owner).send({ from: owner });
  console.log("Instrument set");

  return factoryInstance.options.address;
}

async function getMainnetForkWeb3() {
  const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    process.env.INFURA_MAINNET_FORK_URI
  );
  const web3 = new Web3(
    new Web3.providers.HttpProvider(process.env.INFURA_MAINNET_FORK_URI)
  );
  web3.setProvider(provider);
  return web3;
}

async function main() {
  web3 = await getMainnetForkWeb3();
  const factoryAddress = await deployDojiFactory();
  const opynV1Adapter = await deployOpynV1Adapter(factoryAddress);

  // const optionsContract = new web3.eth.Contract(
  //   IOToken.abi,
  //   "0x7EB6Dd0Cc2DF2EAe901f76A151cA82BB7be10d68"
  // );
  // console.log(await optionsContract.methods.getVaultOwners().call());

  await purchaseOToken(opynV1Adapter);
  await exerciseOToken(opynV1Adapter);

  process.exit();
}

main();
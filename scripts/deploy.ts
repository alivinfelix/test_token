import { ethers } from 'hardhat';
async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  // const ern = await ethers.getContractFactory('ERN');
  // let contract = await ern.deploy('Test Token 5', 'TST5');

  // console.log(contract.address);

  // await contract.deployed();
  // await sleep(60000);

  // await run('verify:verify', {
  //   address: contract.address,
  //   constructorArguments: ['Test Token 5', 'TST5'],
  // });


  const collName = 'Sample Leo 5';
  const collSymbol = 'LEO5';

  const ern = await ethers.getContractFactory('LEO');
  let contract = await ern.deploy(collName, collSymbol);

  console.log(contract.address);

  await contract.deployed();
  await sleep(60000);

  await run('verify:verify', {
    address: contract.address,
    constructorArguments: [collName, collSymbol],
  });



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

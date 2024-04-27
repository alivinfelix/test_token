// SPDX-License-Identifier: MIT
// truffle migrate -f 2 --to 2 --reset --network goerli
const lending = artifacts.require('NFTLending');
const token = artifacts.require('MockERN');
const nft1155 = artifacts.require('Mock1155');

let marketWallet = '0xD5b5e29eEbA337830E183a9F4344839497B36f7b';
let marketFee = 5;

module.exports = async (_deployer, _network) => {
  console.log('... deploying on', _network);

  let debug, tokenAddress;
  if (_network != 'mainnet') {
    // Test
    debug = true;
    console.log('... deploying mock token');
    await _deployer.deploy(token, 'Mock ERN', 'ERN');
    const t = await token.deployed();
    tokenAddress = t.address;
    console.log('... token deployed', tokenAddress);
    console.log('... deploying mock ERC1155');
    await _deployer.deploy(nft1155);
    const n1 = await nft1155.deployed();
    console.log('... mock 1155 deployed', n1.address);
  } else {
    // Prod
    debug = false;
    tokenAddress = '0x';
  }

  console.log('... deploying lending contract');
  await _deployer.deploy(lending, tokenAddress, marketFee, marketWallet, debug);
  const p = await lending.deployed();
  console.log('... lending address', p.address);

  // Verify
  console.log('truffle run verify MockERN NFTLending --network goerli');

  return _deployer;
};

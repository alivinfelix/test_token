const { ethers } = require('hardhat');
const { expect } = require('chai');
const helpers = require('@nomicfoundation/hardhat-network-helpers');

const day1 = 1693584000; // 9/1/23 9:00am
const day45 = 1697385600; // 10/15/23 9:00am
const day61 = 1698768000; // 10/31/23 9:00am Halloween!
const newToken = '0xcf09a8D6291fa5EAed851C3CF4A9B1553D66f593';
const newWallet = '0xf6377AB372F2C0AD94C4E373deEFFc944A6f8f93';
const newFee = 10;
const collA1Loan = '100000000000000000000'; // 100 ERN
const collA2Loan = '10000000000000000000'; // 10 ERN
const collB1Loan = '100000000000000000000'; // 100 ERN
const collA1Payback = '110000000000000000000'; // 100 ERN + 10%
const collA2Payback = '11000000000000000000'; // 10 ERN + 10%
const collB1Payback = '110000000000000000000'; // 100 ERN + 10%
const adminRole =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 *  Borrowers:
 *    accounts[1]: Coll A #1
 *    accounts[2]: Coll A #2
 *  Lenders:
 *    accounts[3]: Coll A #1 bid #1 (accepted)
 *    accounts[4]: Coll A #1 bid #2
 *    accounts[5]: Coll A #2 bid #1 (accepted)
 */
const signOrder = async (contract, order, signer) => {
  const d = await contract.eip712Domain();
  const domain = {
    name: d.name,
    version: d.version,
    chainId: d.chainId,
    verifyingContract: d.verifyingContract,
  };

  const types = {
    LoanOffer: [
      { name: 'lender', type: 'address' },
      { name: 'loanToken', type: 'address' },
      { name: 'loanAmount', type: 'uint256' },
      { name: 'interestAmount', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'accepted', type: 'bool' },
      { name: 'nftContracts', type: 'address[]' },
      { name: 'nftTokenIds', type: 'uint256[]' },
    ],
  };
  let sig2 = await signer._signTypedData(domain, types, order);
  return sig2;
};

describe('NFTLending', () => {
  let lending;
  let ern;
  let MockERN;
  let Mock1155;
  let NFTLending;
  let accounts;
  it('Set up', async () => {
    accounts = await ethers.getSigners();
    MockERN = await ethers.getContractFactory('MockERN');
    Mock1155 = await ethers.getContractFactory('Mock1155');
    Mock721 = await ethers.getContractFactory('Mock721');
    NFTLending = await ethers.getContractFactory('NFTLending');
    ern = await MockERN.deploy('Mock ERN', 'ERN');
    lending = await NFTLending.deploy(
      ern.address,
      5,
      '0xD5b5e29eEbA337830E183a9F4344839497B36f7b'
    );
    await lending.grantRole(await lending.SIGNER_ROLE(), accounts[10].address);
    collA = await Mock1155.deploy();
    await collA.mint(accounts[1].address, 1, 1);
    await collA.mint(accounts[2].address, 2, 1);
    await ern.mint(accounts[1].address, collA1Payback + collB1Payback); // Borrower
    await ern.mint(accounts[2].address, collA1Payback); // Borrower
    await ern.mint(accounts[3].address, collA1Loan + collB1Payback); // Lender
    await ern.mint(accounts[4].address, collA1Loan); // Lender
    await ern.mint(accounts[5].address, collA2Loan); // Lender

    collB = await Mock721.deploy();
    await collB.mint(accounts[1].address, 1);
  });

  it('Add new token', async () => {
    await lending.addLoanToken(newToken);
    const accepted = await lending.acceptedLoanTokens(newToken);
    expect(accepted).to.be.eq(1, 'Could not add new token');
  });

  it('Set new market wallet', async () => {
    await lending.setMarketWallet(newWallet);
    const marketWallet = await lending.marketWallet();
    expect(marketWallet).to.be.eq(newWallet, 'Could not set new market wallet');
  });

  it('Set market fee', async () => {
    await lending.setMarketFee(newFee);
    const fee = await lending.marketFee();
    expect(fee).to.be.eq(newFee, 'Could not set market fee');
  });

  it('Create offer #1 on collection A token #1', async () => {
    await ern
      .connect(accounts[3])
      .approve(lending.address, collA1Loan + collB1Loan);
    const order = {
      lender: accounts[3].address,
      loanToken: ern.address,
      loanAmount: collA1Loan,
      interestAmount: '10000000000000000000',
      duration: 60,
      accepted: false,
      nftContracts: [collA.address],
      nftTokenIds: [1],
    };
    const sig = await signOrder(lending, order, accounts[10]);
    await lending.connect(accounts[3]).createLoanOffer(
      ern.address,
      collA1Loan,
      '10000000000000000000', // 10 ERN interest
      60,
      [collA.address],
      [1],
      sig
    );
  });

  it('Create offer #2 on collection A token #1', async () => {
    await ern.connect(accounts[4]).approve(lending.address, collA1Loan);
    const order = {
      lender: accounts[4].address,
      loanToken: ern.address,
      loanAmount: collA1Loan,
      interestAmount: '9000000000000000000',
      duration: 60,
      accepted: false,
      nftContracts: [collA.address],
      nftTokenIds: [1],
    };
    const sig = await signOrder(lending, order, accounts[10]);
    await lending.connect(accounts[4]).createLoanOffer(
      ern.address,
      collA1Loan,
      '9000000000000000000', // 9 ERN interest
      60,
      [collA.address],
      [1],
      sig
    );
  });

  it('Block offer for insufficient funds', async () => {
    const order = {
      lender: accounts[6].address,
      loanToken: ern.address,
      loanAmount: collA1Loan,
      interestAmount: '8000000000000000000',
      duration: 60,
      accepted: false,
      nftContracts: [collA.address],
      nftTokenIds: [1],
    };
    const sig = await signOrder(lending, order, accounts[10]);
    await expect(
      lending.connect(accounts[6]).createLoanOffer(
        ern.address,
        collA1Loan,
        '8000000000000000000', // 10 ERN interest
        60,
        [collA.address],
        [1],
        sig
      )
    ).revertedWith('Not enough balance');
  });

  it('Create offer #1 on collection A token #2', async () => {
    await ern.connect(accounts[5]).approve(lending.address, collA2Loan);
    const order = {
      lender: accounts[5].address,
      loanToken: ern.address,
      loanAmount: collA2Loan,
      interestAmount: '1000000000000000000',
      duration: 60,
      accepted: false,
      nftContracts: [collA.address],
      nftTokenIds: [2],
    };
    const sig = await signOrder(lending, order, accounts[10]);
    await lending.connect(accounts[5]).createLoanOffer(
      ern.address,
      collA2Loan,
      '1000000000000000000', // 1 ERN interest,
      60,
      [collA.address],
      [2],
      sig
    );
  });

  it('Create offer #1 on collection B token #1', async () => {
    // await ern.connect(accounts[3]).approve(lending.address, collB1Loan);
    const order = {
      lender: accounts[3].address,
      loanToken: ern.address,
      loanAmount: collB1Loan,
      interestAmount: '10000000000000000000',
      duration: 60,
      accepted: false,
      nftContracts: [collB.address],
      nftTokenIds: [1],
    };
    const sig = await signOrder(lending, order, accounts[10]);
    await lending.connect(accounts[3]).createLoanOffer(
      ern.address,
      collB1Loan,
      '10000000000000000000', // 10 ERN interest
      60,
      [collB.address],
      [1],
      sig
    );
  });

  it('Cancel offer #2 on collection A token #1', async () => {
    await lending.connect(accounts[4]).cancelOffer(0);
  });

  it('Accept offer #1 on collection A token #1', async () => {
    await collA.connect(accounts[1]).setApprovalForAll(lending.address, true);
    await lending.connect(accounts[1]).acceptLoanOffer(accounts[3].address, 0);
  });

  it('Accept offer #1 on collection A token #2', async () => {
    await collA.connect(accounts[2]).setApprovalForAll(lending.address, true);
    await lending.connect(accounts[2]).acceptLoanOffer(accounts[5].address, 0);
  });

  it('Accept offer #1 on collection B token #1', async () => {
    await collB.connect(accounts[1]).approve(lending.address, 1);
    await lending.connect(accounts[1]).acceptLoanOffer(accounts[3].address, 1);
  });

  it('Repay loan on time for collection A token #1', async () => {
    await helpers.time.increase(5184000 - 86400);
    const bal = await ern.balanceOf(accounts[1].address);
    await ern.connect(accounts[1]).approve(lending.address, collA1Payback);
    await lending.connect(accounts[1]).repayLoan(1);
  });

  it('Try to repay loan loan for collection A token #1', async () => {
    await expect(lending.connect(accounts[1]).repayLoan(1)).to.be.revertedWith(
      'Loan has already been repaid'
    );
  });

  it('Default loan on collection A token #2', async () => {
    ern.connect(accounts[2]).approve(lending.address, collA2Payback);
    await expect(lending.connect(accounts[2]).repayLoan(2)).to.be.revertedWith(
      'Inactive or expired loan'
    );
  });

  it('Claim collection A token #2', async () => {
    await helpers.time.increase(86400);
    await lending.connect(accounts[5]).claimNFT(accounts[2].address, 1);
  });

  it('Try to claim collection A token #2', async () => {
    await expect(
      lending.connect(accounts[4]).claimNFT(accounts[2].address, 1)
    ).to.be.revertedWith('Loan is inactive or already claimed');
  });
});

'use strict';

require('chai').should();
const BigNumber = require('bignumber.js');
const BumoSDK = require('bumo-sdk');

const sdk = new BumoSDK({
  host: 'seed1.bumotest.io:26002',
});

describe('The demo of bumo-sdk for exchange ', function() {

  it('Create account', async() => {
    const keypair = await sdk.account.create();
    console.log(keypair);
  });

  it('Get account information', async() => {
    const address = 'buQemmMwmRQY1JkcU7w3nhruoX5N3j6C29uo';
    const info = await sdk.account.getInfo(address);
    console.log(info);
  });

  it('Check address validity', async() => {
    const address = 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1';
    const data = await sdk.account.checkValid(address);
    console.log(data);
  });

  it('Get account balance', async() => {
    const address = 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1';
    const data = await sdk.account.getBalance(address);
    console.log(data);
  });

  it('Get account nonce', async() => {
    const address = 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1';
    const data = await sdk.account.getNonce(address);
    console.log(data);
  });

  it('Get the latest block number', async() => {
    const data = await sdk.block.getNumber();
    console.log(data);
  });

  it('Check local node block synchronization status', async() => {
    const data = await sdk.block.checkStatus();
    console.log(data);
  });

  it('Get transactions for a blockNumber', async() => {
    const blockNumber = '100';
    const data = await sdk.block.getTransactions(blockNumber);
    console.log(data);
  });

  it('Get block information', async() => {
    const data = await sdk.block.getInfo('100');
    console.log(data);
  });

  it('Get the latest block information', async() => {
    const data = await sdk.block.getLatestInfo();
    console.log(data);
  });

  it('Get the validators in the specified blockNumber', async() => {
    const data = await sdk.block.getValidators('100');
    console.log(data);
  });

  it('Get the latest validators', async() => {
    const data = await sdk.block.getLatestValidators();
    console.log(data);
  });

  it('Get block rewards and validator rewards in the specified blockNumber', async() => {
    const data = await sdk.block.getReward('100');
    console.log(data);
  });

  it('Get block rewards and validator rewards in the latest blockNumber', async() => {
    const data = await sdk.block.getLatestReward();
    console.log(data);
  });

  it('Get fees in the specified blockNumber', async() => {
    const data = await sdk.block.getFees('100');
    console.log(data);
  });

  it('Get fees in the latest blockNumber', async() => {
    const data = await sdk.block.getLatestFees();
    console.log(data);
  });

  // ====================================
  // Send BU contains 4 steps:
  // 1. build operation (buSendOperation)
  // 2. build blob
  // 3. sign blob with sender private key
  // 4. submit transaction
  // ====================================
  it('Send BU', async() => {
    const senderPrivateKey = 'sender private key';
    const senderAddress = 'buQavuuHbqQz1Uc7kpY9zWLGup9GuoBLd5g8';
    const receiverAddress = 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1';

    const accountInfo = await sdk.account.getNonce(senderAddress);

    if (accountInfo.errorCode !== 0) {
      console.log(accountInfo);
      return;
    }
    let nonce = accountInfo.result.nonce;
    // nonce + 1
    nonce = new BigNumber(nonce).plus(1).toString(10);

    // ====================================
    // 1. build operation (buSendOperation)
    // ====================================
    const operationInfo = sdk.operation.buSendOperation({
      sourceAddress: senderAddress,
      destAddress: receiverAddress,
      buAmount: '7000',
      metadata: 'send bu demo',
    });

    if (operationInfo.errorCode !== 0) {
      console.log(operationInfo);
      return;
    }

    const operationItem = operationInfo.result.operation;

    // ====================================
    // 2. build blob
    // ====================================
    const blobInfo = sdk.transaction.buildBlob({
      sourceAddress: senderAddress,
      gasPrice: '1000',
      feeLimit: '306000',
      nonce,
      operations: [ operationItem ],
    });

    if (blobInfo.errorCode !== 0) {
      console.log(blobInfo);
      return;
    }

    const blob = blobInfo.result.transactionBlob;

    // ====================================
    // 3. sign blob with sender private key
    // ====================================
    let signatureInfo = sdk.transaction.sign({
      privateKeys: [ senderPrivateKey ],
      blob,
    });

    if (signatureInfo.errorCode !== 0) {
      console.log(signatureInfo);
      return;
    }

    const signature = signatureInfo.result.signatures;

    // ====================================
    // 4. submit transaction
    // ====================================
    const transactionInfo = await sdk.transaction.submit({
      blob,
      signature: signature,
    });

    if (transactionInfo.errorCode !== 0) {
      console.log(transactionInfo);
    }
    console.log(transactionInfo);
  });

  // ====================================
  // Issue asset contains 4 steps:
  // 1. build operation (assetIssueOperation)
  // 2. build blob
  // 3. sign blob with private key
  // 4. submit transaction
  // ====================================
  it('Issue asset', async() => {
    const privateKey = 'private key';
    const address = 'buQavuuHbqQz1Uc7kpY9zWLGup9GuoBLd5g8';

    const accountInfo = await sdk.account.getNonce(address);

    if (accountInfo.errorCode !== 0) {
      console.log(accountInfo);
      return;
    }
    let nonce = accountInfo.result.nonce;
    // nonce + 1
    nonce = new BigNumber(nonce).plus(1).toString(10);

    // ====================================
    // 1. build operation (assetIssueOperation)
    // ====================================
    const operationInfo = sdk.operation.assetIssueOperation({
      sourceAddress: 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1',
      code: 'leo',
      assetAmount: '20000',
      metadata: 'oh my issue asset',
    });

    if (operationInfo.errorCode !== 0) {
      console.log(operationInfo);
      return;
    }

    const operationItem = operationInfo.result.operation;

    // ====================================
    // 2. build blob
    // ====================================
    const blobInfo = sdk.transaction.buildBlob({
      sourceAddress: senderAddress,
      gasPrice: '1000',
      feeLimit: '5000000000',
      nonce,
      operations: [ operationItem ],
    });

    if (blobInfo.errorCode !== 0) {
      console.log(blobInfo);
      return;
    }

    const blob = blobInfo.result.transactionBlob;

    // ====================================
    // 3. sign blob with private key
    // ====================================
    let signatureInfo = sdk.transaction.sign({
      privateKeys: [ privateKey ],
      blob,
    });

    if (signatureInfo.errorCode !== 0) {
      console.log(signatureInfo);
      return;
    }

    const signature = signatureInfo.result.signatures;

    // ====================================
    // 4. submit transaction
    // ====================================
    const transactionInfo = await sdk.transaction.submit({
      blob,
      signature: signature,
    });

    if (transactionInfo.errorCode !== 0) {
      console.log(transactionInfo);
    }
    console.log(transactionInfo);
  });

  // ====================================
  // Send asset contains 4 steps:
  // 1. build operation (assetSendOperation)
  // 2. build blob
  // 3. sign blob with private key
  // 4. submit transaction
  // ====================================
  it('Send asset', async() => {
    const privateKey = 'sender private key';
    const address = 'buQavuuHbqQz1Uc7kpY9zWLGup9GuoBLd5g8';

    const accountInfo = await sdk.account.getNonce(address);

    if (accountInfo.errorCode !== 0) {
      console.log(accountInfo);
      return;
    }

    let nonce = accountInfo.result.nonce;
    // nonce + 1
    nonce = new BigNumber(nonce).plus(1).toString(10);

    // ====================================
    // 1. build operation (assetSendOperation)
    // ====================================
    const operationInfo = sdk.operation.assetSendOperation({
      sourceAddress: 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1',
      destAddress: 'buQVkUUBKpDKRmHYWw1MU8U7ngoQehno165i',
      code: 'leo',
      issuer: 'buQsBMbFNH3NRJBbFRCPWDzjx7RqRc1hhvn1',
      assetAmount: '100',
      metadata: 'oh my test send asset',
    });

    if (operationInfo.errorCode !== 0) {
      console.log(operationInfo);
      return;
    }

    const operationItem = operationInfo.result.operation;

    // ====================================
    // 2. build blob
    // ====================================
    const blobInfo = sdk.transaction.buildBlob({
      sourceAddress: senderAddress,
      gasPrice: '1000',
      feeLimit: '306000',
      nonce,
      operations: [ operationItem ],
    });

    if (blobInfo.errorCode !== 0) {
      console.log(blobInfo);
      return;
    }

    const blob = blobInfo.result.transactionBlob;

    // ====================================
    // 3. sign blob with private key
    // ====================================
    let signatureInfo = sdk.transaction.sign({
      privateKeys: [ privateKey ],
      blob,
    });

    if (signatureInfo.errorCode !== 0) {
      console.log(signatureInfo);
      return;
    }

    const signature = signatureInfo.result.signatures;

    // ====================================
    // 4. submit transaction
    // ====================================
    const transactionInfo = await sdk.transaction.submit({
      blob,
      signature: signature,
    });

    if (transactionInfo.errorCode !== 0) {
      console.log(transactionInfo);
    }
    console.log(transactionInfo);
  });

});

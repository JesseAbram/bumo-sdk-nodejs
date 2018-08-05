'use strict';

require('chai').should();
const BigNumber = require('bignumber.js');
const BumoSDK = require('bumo-sdk');

const sdk = new BumoSDK({
  host: 'seed1.bumotest.io:26002',
});

describe('The demo of submit transaction ', function() {

  it('The demo of submit transaction', async() => {
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

});

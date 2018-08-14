'use strict';

require('chai').should();
const BumoSDK = require('../index');
const BigNumber = require('bignumber.js');

const sdk = new BumoSDK({
  host: 'seed1.bumotest.io:26002',
});

describe('Test account Set Metadata Operation', function() {

  it('test operation.accountSetMetadataOperation()', async() => {

    const privateKey = 'private key';
    const sourceAddress = 'buQhP94E8FjWDF3zfsxjqVQDeBypvzMrB3y3';

    // Get nonce
    const result = await sdk.account.getNonce(sourceAddress);
    if (result.errorCode !== 0) {
      console.log(result);
      return;
    }
    let nonce = result.result.nonce;
    nonce = new BigNumber(nonce).plus(1).toString(10);

    // build operation
    let accountSetMetadataOperation = sdk.operation.accountSetMetadataOperation({
      key: 'mykey1',
      value: 'myvalue1',
      // deleteFlag: 1,
      version: '0'
    });

    if (accountSetMetadataOperation.errorCode !== 0) {
      console.log(accountSetMetadataOperation);
      return;
    }

    const operationItem = accountSetMetadataOperation.result.operation;

    console.log(operationItem);
    // return;
    const args = {
      sourceAddress,
      nonce,
      operations: [operationItem],
      signtureNumber: '100',
    };

    let feeData = await sdk.transaction.evaluateFee(args);
    if (feeData.errorCode !== 0) {
      console.log(feeData);
      return;
    }

    let feeLimit = feeData.result.feeLimit;
    let gasPrice = feeData.result.gasPrice;

    // console.log(feeData);

    // =============================
    // build blob
    // =============================
    let blobInfo = sdk.transaction.buildBlob({
      sourceAddress,
      gasPrice,
      feeLimit,
      nonce,
      operations: [ operationItem ],
    });

    if (blobInfo.errorCode !== 0) {
      console.log(blobInfo);
      return;
    }

    let blob = blobInfo.result.transactionBlob;

    // 3. sign blob
    let signatureInfo = sdk.transaction.sign({
      privateKeys: [ privateKey ],
      blob,
    });

    if (signatureInfo.errorCode !== 0) {
      console.log(signatureInfo);
      return;
    }

    let signature = signatureInfo.result.signatures;
    // 4. submit transaction
    let transactionInfo = await sdk.transaction.submit({
      blob,
      signature: signature,
    });

    console.log(transactionInfo);
  });


});

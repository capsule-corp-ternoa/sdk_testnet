const fetch = require('node-fetch');
const AbortController = require("abort-controller");
const BN = require('bn.js');
const {
    BN_TEN,
  } = require('@polkadot/util');
exports.fetchTimeout = (url, options = null, timeoutLimit = 30000) => {
    const controller = new AbortController()
    const signal = controller.signal
    return new Promise((success, reject) => {
        const timeout = setTimeout(() => {
            reject('timeout')
            signal.abort();
        }, timeoutLimit)
        fetch(url, {
                ...options,
                signal
            })
            .catch((e) => {
                console.error('fetch error:' + e)
                reject(e);
            })
            .then(success)
            .finally(() => {
                clearTimeout(timeout);
            });
    })

};
exports.unFormatBalance = function unFormatBalance(_input) {
    const input = '' + _input;
    const siPower = new BN(18);
    const basePower = 18;
    const siUnitPower = 0;
    const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);
  
    let result;
  
    if (isDecimalValue) {
      if (siUnitPower - isDecimalValue[2].length < -basePower) {
        result = new BN(-1);
      }
      const div = new BN(input.replace(/\.\d*$/, ''));
      const modString = input.replace(/^\d+\./, '').substr(0, 18);
      const mod = new BN(modString);
  
      result = div.mul(BN_TEN.pow(siPower)).add(mod.mul(BN_TEN.pow(new BN(basePower + siUnitPower - modString.length))));
    } else {
      result = new BN(input.replace(/[^\d]/g, '')).mul(BN_TEN.pow(siPower));
    }
    console.log('unformat balance result', result);
    return result;
  }
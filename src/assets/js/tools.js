import config from '@js/config'
import CryptoJS from 'crypto-js'
export function throttle(timer,callback) {
  clearTimeout(timer);
  timer = setTimeout(callback,500)
}

//读取，设置，删除cookie
export function cookies(key,value) {
  let storage = window.localStorage;
  if(!value && typeof value != 'string'){
    //读取cookie
    if(storage){
      return storage.getItem(key)
    }else {
      if(document.cookie){
        let arr = document.cookie.split(';');
        for(let i = 0;i<arr.length;i++){
          if(arr[i].split('=')[0] === key){
            return arr[i].split('=')[1]
          }
        }
      }
      return null
    }
  }else {
    //保存cookie
    if(storage && value){
      storage.setItem(key,value)
    }else if(storage && value === ''){
      storage.removeItem(key)
    }else {
      let date = new Date();
      date.setDate(date.getDate()+30);
      document.cookie = key+"="+value+";expires="+date.toUTCString();
    }
  }
}

//加密方法
export function Encrypt(word) {

  let srcs = CryptoJS.enc.Utf8.parse(word+new Date().getTime());
  let encrypted = CryptoJS.AES.encrypt(srcs, config.key.key, { iv: config.key.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.ciphertext.toString().toUpperCase();
}


//解密方法
export function Decrypt(word) {
  let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let decrypt = CryptoJS.AES.decrypt(srcs, config.key.key, { iv: config.key.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

//深拷贝
export function deepClone(obj) {
  function clone(obj) {
    let container = Array.isArray(obj)?[]:{};
    if(obj && typeof obj === 'object'){
      for (let key in obj){
        if(obj.hasOwnProperty(key)){
          if(obj[key] && typeof obj[key] === 'object'){
            container[key] = clone(obj[key]);
          }else {
            container[key] = obj[key]
          }
        }
      }
    }
    return container
  }
  return clone(obj)
}


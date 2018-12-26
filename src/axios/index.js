import axios from 'axios'
import {cookies} from '@js/tools'
import config from '@js/config'

//设置默认请求域名
axios.defaults.baseURL=config.host;

//设置跨域向后台提交cookie
axios.defaults.withCredentials=false;

//设置请求超时毫秒数
axios.defaults.timeout=10000;

//根据响应状态码自定义axios promise的状态(大于等于500调用reject)
axios.defaults.validateStatus=function (status) {
  return status < 400;
};

//设置发送token的自定义请求头


export function get(url,params={},token={'Authorization':cookies('token')}) {
  let config = {};
  if(token){//不需要携带token传一个false
    config = {params,headers:token};
  }else {
    config = {params}
  }

  return new Promise((resolve, reject) =>{
    axios.get(url,config)
      .then((response)=>{
        resolve(response)
      })
      .catch((error)=>{
        reject(error)
      })
  })
}


export function post(url,params={},token={'Authorization':cookies('token')}) {
  let config = {};
  if(token){//不需要携带token传一个false
    config = {headers:token};
  }
  return new Promise((resolve, reject) => {
    axios.post(url,params,config)
      .then((response)=>{
        resolve(response)
      })
      .catch((error)=>{
        reject(error)
      })
  })
}

export function put(url,params={},token={'Authorization':cookies('token')}) {
  let config = {};
  if(token){//不需要携带token传一个false
    config = {headers:token};
  }
  return new Promise((resolve, reject) => {
    axios.put(url,params,config)
      .then((response)=>{
        resolve(response)
      })
      .catch((error)=>{
        reject(error)
      })
  })
}

export function Delete(url,params={},token={'Authorization':cookies('token')}) {
  let config = {};
  if(token){//不需要携带token传一个false
    config = {params,headers:token};
  }else {
    config = {params}
  }
  return new Promise((resolve, reject) => {
    axios.delete(url,config)
      .then((response)=>{
        resolve(response)
      })
      .catch((error)=>{
        reject(error)
      })
  })
}























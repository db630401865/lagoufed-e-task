/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/
const PENDDING = 'pendding'
const FILFULLED = 'filfulled'
const REJECTED = 'rejected'

class myPromise{
  constructor(actuator){
    //错误处理
    try{
      actuator(this.resolve,this.reject)
    }catch(e){
      this.reject(e)
    }
  }
  //调用的状态
  status = PENDDING
  //成功的值
  value = null
  //失败的错误值
  season = null
  //成功回调
  successCallback = []
  //失败的回调
  errCallback = []
  resolve = value =>{
    //状态是不可逆的，所以判断是否是PENDDING状态
    if(this.status !== PENDDING) return
    this.status = FILFULLED
    this.value = value
    //解决多个then调用以异步调用。此时维护this.successCallback数组
    while(this.successCallback.length) this.successCallback.shift()()
  }
  reject = season =>{
    //状态是不可逆的，所以判断是否是PENDDING状态
    if(this.status !== PENDDING) return
    this.status = REJECTED
    this.season = season
    //解决多个then调用以异步调用。此时维护this.errCallback数组
    while(this.errCallback.length) this.errCallback.shift()()
  }
  then(successCallback,failCallback){
    //判断then是否是空值
    successCallback = successCallback ? successCallback : value =>value
    failCallback = failCallback ? failCallback : reason =>{throw reason}
    let promise2 = new myPromise((resolve,reject)=>{
      if(this.status === FILFULLED){
        setTimeout(()=>{
          try{
            let x = successCallback(this.value)
            //判断是否返回的是数据或者是自己
            isPromise(promise2,x,resolve,reject)
          }catch(e){
            reject(e)
          }
        },0)
      }else if(this.status === REJECTED){
        setTimeout(()=>{
          try{
            let x = failCallback(this.season)
            //判断是否返回的是数据或者是自己
            isPromise(promise2,x,resolve,reject)
          }catch(e){
            reject(e)
          }
        },0)
      }else{
        //处理异步回调
        this.successCallback.push(()=>{
          setTimeout(()=>{
            try{
              let x = successCallback(this.value)
              //判断是否返回的是数据或者是自己
              isPromise(promise2,x,resolve,reject)
            }catch(e){
              reject(e)
            }
          },0)
        })
        this.errCallback.push(()=>{
          setTimeout(()=>{
            try{
              let x = failCallback(this.season)
              //判断是否返回的是数据或者是自己
              isPromise(promise2,x,resolve,reject)
            }catch(e){
              reject(e)
            }
          },0)
        })
      }
    })
    return promise2
  }
  catch(callBalc){
    return this.then(undefined,callBalc)
  }
  //声明all是一个静态方法
  static all(array){
    let result = [];
    let index = 0
    return new MyPromise((resolve,reject)=>{
      function addData(key,value){
        result[key] = value;
        index++
        if(index === array.length){
          resolve(result)
        }
      }
      for(let i= 0;i<array.length;i++){
        let current = array[i];
        if(current instanceof MyPromise){
          //promise对象
          current.then(value =>addData(i,value) ,reson =>{
            reject(reson)
          })
        }else{
          //普通值
          addData(i,array[i]);
        }
      }
    })
  }
  finaally(callback){
    //通过调用then的方法，我们可以得到成功还是失败。无论什么情况都可以调用
    return this.then(value =>{
      return MyPromise.resolve(callback()).then(()=> value)
    },reject=>{
      return MyPromise.resolve(callback()).then(()=>  {throw reject})
    })
  }  
  //调用自身，直接传递promise，或者数字
  static resolve(val){
    if(val instanceof MyPromise) val
    return new MyPromise(resolve=>resolve(val))
  }
}
function isPromise(promise2,x,resolve,reject){
  if(promise2 === x){
    reject('自己循环了')
    return
  }
  if(x instanceof myPromise){
    //是promise对象
    x.then(resolve,reject)
  }else{
    //是数据
    resolve(x)
  }
}

/*
  将下面异步代码使用 Promise 的方法改进
  尽量用看上去像同步代码的方式
  setTimeout(function () {
    var a = 'hello'
    setTimeout(function () {
      var b = 'lagou'
      setTimeout(function () {
        var c = 'I ♥ U'
        console.log(a + b +c)
      }, 10)
    }, 10)
  }, 10)
*/

let promise1 = new Promise(function(resolve) {
  setTimeout( ()=> {
    var a = 'hello'
    resolve(a)
  },10)
});
let promise2 = new Promise(function(resolve) {
  setTimeout( ()=> {
    var b = 'lagou'
    resolve(b)
  },10)
});
let promise3 = new Promise(function(resolve) {
  setTimeout( ()=> {
    var c = 'I ♥ U'
    resolve(c)
  },10)
});
let result = Promise.all([promise1,promise2,promise3])
result.then(res=>{
 console.log( res.join(' '))
})
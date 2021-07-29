class Watcher{
  constructor(vm, key, cb){
    this.vm = vm
    //data中的属性名称
    this.key = key
    //回调函数负责更新函数
    this.cb = cb
    //把watcher对象记录在Dep类的静态属性target中
    Dep.target = this
    //触发get方法，在get方法中会调用addSub
    this.oldValue = vm[key]
    Dep.target = null
  }
  //当时间发生变化的时候更新视图
  update() {
    let newValue = this.vm[this.key]
    if(this.oldValue === newValue){
      return
    }
    this.cb(newValue)
  }
}
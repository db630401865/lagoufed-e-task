class Vue{
  constructor(options){
    //1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    //判断$el是否是dom对象
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    //2. 把data中的成员转化成为getter,setter。注入到vue实例中
    this._proxyData(this.$data)
    //3. 调用observer对象，监听数据的变化
    new Observer(this.$data)
    //4. 调用compiler对象，解析指令和差值表达式
    new Compiler(this)
  }

  _proxyData(data){
    //遍历data中的所有属性
    Object.keys(data).forEach(e=>{
      //此时this.是执行vue的实例
      //把data的属性注入到vue实例中
      Object.defineProperty(this, e, {
        //是否可枚举
        enumberable: true,
        //是否可以遍历
        configurbale: true,
        get(){
          return data[e]
        },
        set(newValue){
          if(newValue === data[e]){
            return
          }
          data[e] = newValue
        }
      })
    })
  }
}
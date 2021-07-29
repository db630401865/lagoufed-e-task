let _Vue = null;

export default class VueRouter{
  //第一个参数是vue的构造函数
  //第二个参数是可选的参数 
  static install(Vue){
    //1 判断当前插件是否被安装
    if(VueRouter.install.installed){
      return;
    }
    //表示当前插件被安装了
    VueRouter.install.installed = true;

    //2 把Vue的构造函数记录在全局
    _Vue = Vue;

    //3 把创建Vue的实例传入的router对象注入到Vue实例
    // _Vue.prototype.$router = this.$options.router  此时的this是指向VueRouter的，所以不能使用
    //混入
    // _Vue,this.prototype.$router = 
    _Vue.mixin({
      //如果是组件的话就不执行了，如果是实例化才执行
      beforeCreate() {
        if(this.$options.router){
          //此时this才是vue的实例
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      },
    })
  }

  constructor(options){
    //记录构造函数中传入的options
    this.options = options;
    //routeMap的建存储的路由地址，值就是路由组件
    this.routeMap = {}
    //data是响应式的对象，它里面有属性current。用来记录当前我们的路由地址。默认是/
    //Vue.observable就是创建响应式的对象。创建的对象可以直接用在渲染函数或者计算属性里面
    this.data = _Vue.observable({
      current: "/"
    })
  }

  init(){
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  //他的作用就是把构造函数中传过来的选项中路由规则转化成建值队的形式储存在routeMap对象中
  //routeMap的建存储的路由地址，值就是路由组件
  createRouteMap(){
    //遍历所有的路由规则 把路由规则解析成键值对的形式存储到 routeMap中
    this.options.routes.forEach(route=>{
      this.routeMap[route.path] = route.component
    }) 
  }

  //传递参数的目的是为了减少对外部的依赖
  initComponents(Vue){
    //创建router-link。并且使用插槽
    Vue.component('router-link',{
      props:{
        to: String
      },
      //h函数创建虚拟dom。h函数vue穿过来的。可以看源码
      render(h){
        //h第一个参数：创建时候的选择器。
        //h第二个参数：设置一个属性。
        //h第三个参数：生成的元素的子元素。
        return h('a',{
          attrs:{
            href:this.to
          },
          on:{
            click: this.clickhander
          }
          //this.$slots.default 默认插槽
        },[this.$slots.default])
      },
      //阻止默认行为
      methods:{
        clickhander(e){
          //改变当前路由地址
          history.pushState({},'', this.to)
          //this.$router.data.current 是响应式的对象，会重新加载我们的组件。重新渲染到试图上来
          this.$router.data.current = this.to
          //为了防止给服务器发送事件
          e.preventDefault();
        } 
      }
    }) 
    const self = this
    Vue.component('router-view',{
      //h函数创建虚拟dom。h函数vue穿过来的。可以看源码
      render(h){
        //self.data.current 当前路由地址
        //self.routeMap[self.data.current]就是这个我们获取的组件
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    }) 
  }

  initEvent(){
    //此时this就是vuerouter里面的this
    window.addEventListener('popstate',()=>{
      //我们需要把当前地址栏的地址取出来
      //window.location.pathname 当前浏览器的路径部分
      this.data.current = window.location.pathname
    })
  }
}
## Vue.js 源码剖析-响应式原理、虚拟 DOM、模板编译和组件化

### 简答题

#### 1、请简述 Vue 首次渲染的过程。

1：Vue 初始化，实例成员，静态成员
2：初始化结束之后调用 vue 的构造函数，new Vue()
3：在构造函数中，调用 this.\_init()方法，这个方法相当于整个 vue 的入口
4：之后在调用了 flatforms/web/entry-runtime-with-compiler.js 入口文件的 vm.$mount()，核心作用就是帮我们把模版编译成render函数，首先判断是否传入render函数，如果没有获取到那么就去获取template选项，如果template也没有的话，他会把el中的内容作为我们的模版，然后把模版编译成render函数，通过compileToFunction()编译成render函数的。当把render编译好之后，会把它存在options.render中。
5：接下来会调用 flatforms/web/runtime/index.js文件中的$mount()方法，在这个方法中，会重新获取我们的 el，如果是运行时版本的话，在这个入口中重新 获取了 el。如果不是的话，则不调用
6：之后调用 mountComponent 方法， 在 src/core/instance/lifecycle.js 中定义的，这个方法里面首先判断是否是 render 选择，如果没有设置，但是我们传入了模版，而且当前是开发环境，会发送一个警告，这个判断是当前版本是使用运行时的 vue(并且传入模版), 之后会触发 beforeMount 生命周期钩子函数，开始挂载之前，之后定义了 updateComponent 方法，在函数内部调用了 vm.\_update(vm.\_render(), hydrating)方法，vm.\_render()方法是生成虚拟 dom.，vm.\_update 是虚拟 dom 转换为真实 dom，并且挂载到页面
7：在之后创建了 watcher 对象，传入了 updateComponent 函数，在 watcher 内部调用，然后会调用她的 get 方法
8：watcher 对象创建之后，触发 mounted 方法，挂载结束，返回（vue 实例）return vm。
9：watcher.get()执行的事情：创建完 watcher 会调用一次 get 方法，在 get 方法中会调用 updateComponent 方法。会调用.\_render()方法就是创建虚拟 dom，在\_render 方法中，调用了用户传入的 render 或者我们把模版编译生成的 render。执行完成之后会吧生成的虚拟 dom（vnode）返回，之后调用 vm.\_update(vNode）方法，在方法中调用**patch**这个方法（主要是把虚拟 dom 转换为真实 dom，并且挂载到页面上去）会吧真实的 dom 设置到$el 中

#### 2、请简述 Vue 响应式原理。

1：首先从 initState()方法：开始的初始化 vue 的状态，在这个方法中再调用 initData()方法，initData 是吧 vue 的属性注入到实例上去，并且调用 observe()，把 data 对象转换为响应式的对象，observe 就是响应式的入口
2：observe(vlaue)方法：接受一个参数， 这个参数就是响应式要处理的对象，首先判断传过来的是否是对象，如果不是的话直接返回，接下来判断 values 是否有*ob*这个属性，如果有说明之前做过响应式的处理，直接返回，如果没有就去出创建 observe 对象，最后返回 observe 对象
3：observe 类中做的事情：在类中定义一个不可枚举的*ob*属性，并且吧当前 observe 对象记录到*ob*里面。然后进行数组和对象的响应化处理，
响应式处理数组：数组就是设置那几个数组的方法（例如 push,pop,unshift，splice 等），这些方法会改变原数组，所有当这些方法改变的时候，我们要去发送通知，那发送通知就是要找到数组对象对应的*ob*也就是 observe 对象，再找到 observe 的 dep,调用 dep 的 notify 方法,更改完了数组的特殊方法之后，遍历数组中的每一个成员，对每一个成员调用 observe()。如果这个对象是对象的话，也会转换为响应式对象。
响应式处理对象：如果是对象的话，此时会调用 waik 方法。waik 就是遍历这个对象的所有属性。对每一个属性调用 defineReactive 方法。
4：在你 defineReactive 方法中：为每一个属性创建 dep 对象，让 dep 去收集依赖，如果当前属性值是对象的话，调用 observe，吧这个对象也转换为响应式对象，他的核心代码也就是定义 getter 和 setter。在 getter 里面去收集依赖，收集依赖的时候要为每一个属性收集依赖。如果这个属性的值是对象，那也要为子对象收集依赖，在 getter 里面最终返回属性的值，在 setter 里面，首先保存新值， 如果新值是对象的话，也要调用 observe 把新设置的对象也转换为响应式对象，在 setter 里面数据发生了变化，就需要发送通知。发送通知其实就是调用个 dep.notify 方法
5：收集依赖的过程：收集依赖的时候，首先去执行 watcher 的 get 方法，在 get 方法中会调用 pushTarget 方法。在 pushTarget 方法中会把当前的 watcher 记录在 Dep.target 属性中。然后在访问 data 成员的时候去收集依赖，这个时候当我们访问属性的的时候就会触发 defineReactive 的 getter.在 getter 中收集依赖。它会把我们对应属性的依赖添加到 dep 的 subs 数组中，也就是为属性收集依赖，如果这个属性的值也是哈对象，此时要创建一个 childOb 对象，要为我们的子对象收集依赖，目的是将来自对象发生变化的时候，可以发送通知。
6：Watcher：当我们数据发生变化的时候 Watcher 的整个过程。当数据发生变化的时候我们会调用 dep.notify,方法。此方法内部调用 watcher 的 update 方法， 在 update 方法中回去调用 queueWatcher 方法，queueWatcher 会去判断 watcher 是否被处理了，如果没有被处理，会被添加到队列中，并且调用刷新队列的 flushSchedulerQueue()方法。
在 flushSchedulerQueue 方法中， 它会触发 beforeUpdate 钩子函数，然后调 用 7：watcher.run()方法。在 run()中去调用 get()方法，get()方法去调用 getter()，getter 就去调用 updateComponent。这是针对渲染 watcher 来说的。watcher.run()方法运行完成之后，其实以及把数据更新到了视图上，我们在页面上就可以看到最新的数据了，接下来就是清空依赖，重制 watcher 中的状态，之后触发 actiive 钩子函数，最后触发 updated 钩子函数

#### 3、请简述虚拟 DOM 中 Key 的作用和好处。

1 $vm.render()开始:   会传入用户的render函数，或者是模版编译生成的render函数，如果执行的是用户的传入的render函数。是调用vm.$createElement 这个方法，如果是模版生成的函数他会调用$vm._c方法。他们2个方法最终都会调用createElement()这个方法。在这个方法里面处理了参数的差异，最终去调用了_createElement()
在_createElement()方法中，创建了vnode对象。在_createElement()方法中将创建的vnode返回，将返回对象交给vm._update()
2 vm._update():    作用是复杂吧虚拟dom，渲染成真实dom。都会调用__path__，如果是首次执行，执行vm.__patch__(vm.$el, vnode, hydrating, false/_ removeOnly _/) 我们在**patch**方法中第一个参数传入$el ，也就是真实 dom。如果是数据更新的时候 执行 vm.**patch**(prevVnode, vnode)，传入的是 2 个 vnode
。prevVnode 就是 OldVnode，vnode 就是 newVnode
3 vm.**patch**()方法初始化： **patch**方法是在 runtime/index.js 去初始化，在 vue 原型上挂载 Vue.prototype.**patch**，**patch**就是等于 runtime/patch.js 模块中导出的 patch 函数，patch 函数中主要去设置了 2 个对象，(modules,nodeOps).modules 存储的就是于平台相关和无关的模块，nodeOps 她的操作就是用来操作 dom 的。设置好这 2 个对象之后。我们调用 createPatchFunction 函数并返回 patch 函数 patch 函数
4 patch(): 是在 vdom/patch.js 中的 createPatchFunction 函数返回的 patch 函数。createPatchFunction 函数中首先初始化了一些初始化属性以及初始化函数，并且初始化了 sbs 这个对象，cbs 对象存储了所有的模块的钩子函数，这些钩子函数的作用，是来处理节点的属性/事件/样式的。在 path 里面会去判断传入的第一个参数是否是真实 dom。如果是真实 dom 说明是首次加载，这时候会吧真实的 dom 转化为 Vnode。然后去调用 createElm 方法。把我们的 newVnode 转化为真实 dom 并且挂载到 dom 树上，如果是数据更新的时候，此时新旧节点都是 vnode.通过 sameVnode 去判断是否是相同的节点，如果是相同节点就去执行 patchVnode.也就是 diff 算法。当 patchVnode 执行之后，最终会删除旧的节点
5 createElm(): 这个函数的作用就是吧虚拟即诶单转换为真实的 dom。并且挂载到 Dom 树上，并且把虚拟节点的子节点 children，转换为真实 dom，并且挂载到 dom 树上。而且在它里面触发响应的钩子函数
6 patchVnode(): 这个函数的作用就是比较新旧 Vnode，以及新旧 Vnode 的子节点。然后更新他们的差异，如果新旧 Vnode 都有子节点并且子节点不同的话，会调用 updateChildren 对比字节点的差异
7 updateChildren(): 这个函数会对比新旧子节点。他会把新旧子节点这 2 个数组的头和尾取出来，依次去比较头和尾，一共有 4 种比较方式。在比较过程中，如果是 sameVnode。还会调用 patchVnode 进行打补丁。如果这 4 种方式都不满足的话，会在老节点的子节点去查找 newStartVnode(新的开始节点在老的子节点是否存在)，如果找到之后会进行响应的处理，当循环结束之后，如果新节点比老节点多，把新增的子节点插入到 dom 中，如果老节点比新节点多，把多余的老节点删除
Key 是用来优化 Diff 算法的。Diff 算法核心在于同层次节点比较，Key 就是用于在比较同层次新、旧节点时，判断其是否相同。
在 updateChildren 中比较子节点的时候，因为 oldVnode 的子节点的和 newVnode 的子节点通过 sameVnode 来判断。如果有 key 值，所以只做比较，没有更新 DOM 的操作，当遍历完毕后，会再把 x 插入到 DOM 上 DOM 操作只有一次插入操作。但是如果没有 key 的时候，那么在 updateChildren 中比较子节点的时候，更跟新多次 dom 节点。

#### 4、请简述 Vue 中模板编译的过程。

1 我们先执行 compileToFunctions 入口函数： 先从缓存中加载好的 render 函数，如果换成没有的话，调用 compil 函数开始编译
2 compile 函数： 合并 option 函数，调用 baseCompile 编译模版。compile 核心是处理选项。把模版和合并好的选项传给 baseCompile 函数
3 baseCompile 函数： 首先使用 parse()方法 ，把 template 转换成 AST tree，在调用 optimize()方法进行优化，标记 AST tree 中的静态语法中的根节点，静态根节点不需要每次重新渲染的时候重新生成节点。通过 patch 阶段跳过静态根节点。最后调用 generate() 把优化过的 AST tree 生成字符串形式的代码。执行完之后会进入 compileToFunctions 函数
4 最后进入 compileToFunctions 函数： 通过调用 createFunction()上一步中生存的字符串形式的代码转换为函数，当 render 和 staticRenderFuns 初始化完毕，挂载到 Vue 实例的 optins 对应的属性中

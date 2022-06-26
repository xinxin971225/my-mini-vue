# my-mini-vue

# 学习记录

## 响应式需求的根源
- v1
一开始我们使用一个变量b去依赖一个变量a的时候，每当a发生了变化，b想变化的时候，我们需要给她进行一次硬性赋值，每次都要去写相同的赋值代码，重复性很高，
- v2
这里我们尝试将依赖变化后所需要执行的同步代码进行分装后变成一个update函数，虽然有一定的分装性，同时每次更新只需要调用方法，但是依旧是我们在手动操作，
- v3
如何让它能够变成自动执行，就是响应式的核心：让同步更新变成自动的

以下思路均以vue为例子

## 响应式数据与依赖收集

在vue3中，声明响应式数据与依赖收集已经被单独抽离到了`@vue/reactivity` 这个包中
可以引入包中的`effect`进行依赖搜集；`reactive`声明响应式数据，这样在reactive过后的数据改变时就会触发对应的收集到的依赖
这里我们就要尝试来实现这两个方法

具体的实现思路
[完整代码](./core/reactivity/index.js)

- 收集依赖的方法

首先是需要一个收集的函数（这里叫effectWatch）
同时需要一个储存并执行依赖的地方，因为具备通用性，所以这里采用一个class Dep来做

注意：
收集依赖时，其实不需要重复依赖，所以储存依赖的地方`effects`采用es6+的set来做，同时提供一个depend方法进行搜集依赖；一个notice遍历并执行已经收集过的依赖；
并且当我们获取实例或者给实例赋值时都会被动的触发在class中定义的get与set，**这两个属性是做出响应式的关键**

这里出现的第一个问题是怎么让new Dep 的实例能与依赖收集方法收集到的内容建立起关联呢？

方法1是将新生成的实例传给effectWatch方法并把effectWatch收集到的依赖方法通过调用实例的depend将依赖添加到对应的实例依赖列表里（缺点：每次都要传入对应的实例，而且`@vue/reactivity`中提供的effect也不需要传入对应的实例）

那么方法1不行，采用方法2，可以定义一个全局变量currentEffect，在每次调用effectWatch的时候就将依赖赋值给中间变量，同时调用一次方法，那么方法中去获取实力对应的属性时就会去触发get操作，在这个时候我们就可以在get中调用depend。然后在将currentEffect清空。

那么在上面实现完了get基本上就完成了，但是我们需要测试模拟一下effectWatch的效果，所以在定义好set并且在赋值完成后调用notice。这样一个对单值变更的响应式依赖收集方法就完成了，做到这里其实已经实现了一个类似`ref`的功能了

- 声明响应式数据的方法

那么有了单个的dep，声明响应式对象，就相当于为它的每个元素都创建一个dep实例。在vue2中，创建响应式数据是通过`Object.defineProperty`api在遍历整个对象的过程中为每个值一一加上set与get，可以想象到这样一个O(n)级别的操作其实是相当慢的。

在vue3中采用es6+的新功能proxy（代理）
我们声明一个reactive方法，接受一个对象作为数据源，返回一个proxy，并在proxy中处理get与set就能够对每一个数据源的属性访问进行劫持。

上面的说法听起来其实是非常简单的，但是代码层面上会有这么几个注意的点
首先需要建立一个当前数据源与响应式对象的对应关系，这里采用map来做，以数据源作为key，value也是一个map（叫depsMap），key就是数据源的key，value为对应的响应式对象，在每一次get与set的时候都会获取到读取到key所对应的响应式对象，详情见`getDep`方法。
接下来只需要在get和set对应的地方添加获取到的dep对象对应的depend与notice方法就可以了

到这里一个简单的effect与reactive就实现完毕了
[app.js中第28到34行是我们的测试代码](./App.js)



## 声明响应式数据的使用

在前面我们提到响应式需求的是变量b会根据变量a的变化而改变，这里如果我们尝试将b换成视图，然后采用vue3中的componsitonApi的形式，去声明一个app对象，它包含有一个render函数（vue模版最终都会编译成一个render）与一个setup函数，在setup中我们去声明响应式依赖然后return出去作为render方法的content，这里我们可以直接使用dom操作去操作视图，并把全部操作去丢到effectWatch里面，这样一个简单的应用就完成了。
### 优化

如果在render中又要确认容器的位置，又要确认具体的操作，还需要去调取依赖收集，要做的事情相当复杂，并且像调用effectWatch，setup，计算出视图的最小更新点之类的其实是通用的，用户并不需要去操作。

那么这里就尝试将effectWatch的调用方式抽离，然后引入vdom进行更新内容计算的优化。
render方法只需要返回一个vdom就可以了。

- vdom

就是用对象的形式描述dom节点，也叫虚拟dom，这里简单的概括每一个节点会有一个tag属性，一个props属性以及一个children属性，创建vDom的函数我们跟随vue叫做h
[创建虚拟dom](./core//h.js)

这里采用vue的createApp模式[createAPP具体实现](./core/index.js)

将effectWatch内置在createApp返回的mount中，mount接受容器作为参数，createApp接受app配置作为参数

mount函数中需要一个渲染虚拟dom的方法mountElement，与我们优化所需要的diff方法
[详细的diff与mountElement代码](./core//renderer/index.js)




// 响应式库

// 依赖
let currentEffect;
class Dep {
  // 1.收集依赖
  constructor(val) {
    // es6+
    this.effects = new Set();
    this._val = val;
  }
  get value() {
    this.depend();
    return this._val;
  }
  set value(newVal) {
    this._val = newVal;
    this.notice();
  }
  depend() {
    //
    if (currentEffect) {
      this.effects.add(currentEffect);
    }
  }

  // 2.触发依赖
  notice() {
    // 触发之前收集的依赖
    this.effects.forEach((effect) => {
      effect();
    });
  }
}

export function effectWatch(effect) {
  // function effectWatch(effect) {
  //收集依赖
  currentEffect = effect;
  effect();
  currentEffect = null;
}

// ref -> 很像了
// const dep = new Dep(10);

// effectWatch(() => {
// console.log("heihei");
//   b = dep.value + 10;
//   console.log(b);
// });

// dep.value = 20;

// reactive
// dep -> number string
// object -> key -> dep

// 1. 对象是什么时候改变了
// object.a -> get
// object.a = 2 -> set

// vue2 -> defineProperties  defineProperty
// Object.defineProperties

// proxy

const targetMap = new Map();

function getDep(target, key) {
  console.log("target, key", target, key);
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }

  return dep;
}

export function reactive(raw) {
  // function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      console.log(key);
      // key - dep

      // dep 存在哪里是个问题
      const dep = getDep(target, key);
      // 依赖搜集
      dep.depend();
      // return target[key] 一样的只是后面的规范推荐下面的写法
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // 触发依赖
      // 获取dep
      const dep = getDep(target, key);
      const result = Reflect.set(target, key, value);
      dep.notice();
      return result;
    },
  });
}

// const user = reactive({
//   age: 19,
// });

// let double;
// effectWatch(() => {
//   console.log("-----reactive---");
//   double = user.age;
//   console.log(double);
// });
// user.age = 20;

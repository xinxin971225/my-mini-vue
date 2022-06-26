// const { effect, reactive } = require("@vue/reactivity");
// const { effectWatch, reactive } = require("./core/reactivity");
// import { effectWatch, reactive } from "./core/reactivity/index.js";
import { reactive } from "./core/reactivity/index.js";
import { h } from "./core/h.js";
// let a = 10;
// let b = a + 10;

// console.log(b);

// a = 20;
// b = a + 10;
// console.log(b);

// v2

// let a = 10;

// let b;
// update();
// function update() {
//   b = a + 10;
//   console.log(b);
// }
// a = 20;
// update();

// v3
// a发生变更，希望 b 自动更新

// 申明相应对象
// ref =>number
// let a = reactive({
//   value: 1,
// });
// let b;

// effectWatch(() => {
//   b = a.value + 10;
//   console.log(b);
// });

// a.value = 30;

// // vue3
// const App = {
export default {
  // template -> render
  render(context) {
    // 构建view = b
    // view -> 每次都需要重新创建
    // 优化点 要计算出最小更新点 -> vdom
    //  js -> diff

    // reset

    // tag
    // props
    // children
    // const div = document.createElement("div");
    // div.innerText = context.state.count;
    // return div;
    return h(
      "div",
      {
        id: "app-id" + context.state.count,
        class: "showTipe",
      },
      // String(context.state.count)
      [h("p", null, String(context.state.count)), h("p", null, "heihe")]
    );
  },

  setup() {
    //  a = 响应式数据
    const state = reactive({
      count: 0,
    });
    window.state = state;
    return {
      state,
    };
  },
};

// app.render(app.setup())

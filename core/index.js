import { effectWatch } from "./reactivity/index.js";
import { mountElement, diff } from "./renderer/index.js";
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      const context = rootComponent.setup();
      let isMounted = false;
      let preSubTree;
      effectWatch(() => {
        if (!isMounted) {
          // init
          rootContainer.innerHTML = "";

          isMounted = true;
          const subTree = rootComponent.render(context);
          console.log(subTree);
          mountElement(subTree, rootContainer);
          preSubTree = subTree;
        } else {
          // update;
          const subTree = rootComponent.render(context);
          diff(preSubTree, subTree);
          preSubTree = subTree;
        }
        // diff
        // newVnode oldVnode
        // rootContainer.append(element);
      });
    },
  };
}

// 创建一个虚拟节点 vdom vNode

export function h(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}

// import _ from 'lodash'
// import App from './app.jsx';
// import {render} from '../build/node_modules/react-dom/cjs/react-dom.development.js'
import React from '../build/node_modules/react/cjs/react.development';


/*
Step I: The createElement Function
Step II: The render Function
Step III: Concurrent Mode
Step IV: Fibers
Step V: Render and Commit Phases
Step VI: Reconciliation
Step VII: Function Components
Step VIII: Hooks
*/


// const dfs = (root)=> {
//   if(typeof root === 'string'){
//     console.log('达到最底层', root)
//   }else if(!_.isArray(root.props.children) && root.props.children){
//     console.log(root)
//     dfs(root.props.children)
//   }else if(_.isArray(root.props.children)){
//     for(const item of root.props.children){
//     console.log(item)
//       dfs(item)
//     }
//   }

// }

// dfs(App())

// render(<App />, document.getElementById('app'))

const createTextElement = (text) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement (type, props, children){
  console.log(props)
  const childrenLength = arguments.length -2;
  let childList = []

  if(childrenLength === 1){
    childList = Array.isArray(children) ? children : [children]
  }else {
    for(let i = 0; i < childrenLength; i++){
      childList.push(arguments[i+2])
    }
  }


  return {
    type,
    props: {
      ...props,
      children: childList?.map(v=> typeof v === 'object'  ? v : createTextElement(v))
    }
  }
}

let wipFiber
let hookIndex
function useState(initial){
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  }
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

const Didact = {
  createElement,
  useState
}

/** @jsx Didact.createElement */
function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <div onClick={()=> {
        console.log(count)
        setCount(count+1)
      }}>点击</div>
    <div className="1231">{count}</div>
  </div>
  )
}



console.log(App)


let nextUnitOfWork = null
let wipRoot
let currentRoot 
let deletions = null


function reconcileChildren(wipFiber, elements) {
    // 为子元素创建fiber
  // 读取所有属性
  // 父元素统一为当前fiber
  let index = 0;
  // 记录之前的节点，方便建立相邻节点的连接关系
  let prevSibling;
  // 取的是第一个子元素，因为此时协调的就是子元素
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  
  while(index < elements.length || oldFiber!= null){
    const element = elements[index]
    let newFiber  = null;

    // 判断旧元素和子元素是否相等
    // 1 类型相等，只用修改属性
    const sameType = oldFiber && element && element.type === oldFiber.type

    if(sameType){
      newFiber  = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }else if(!sameType && element) {
      console.log('属性', element.props, element)
      newFiber  = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }else if(!sameType && oldFiber){
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }
    
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if(index === 0){
      wipFiber.child = newFiber
    }else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++;
  }
}

// 执行工作单元
/**
 * 
 * 
 * 1、将元素添加到 DOM
 * 2、为元素的子元素创建纤维
 * 3、选择下一个工作单元
 */
function performUnitOfWork(fiber){
  const isFunctionComponent = fiber.type instanceof Function
  if(isFunctionComponent){
    wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
  }else {
    if(!fiber.dom){
      fiber.dom = createDom(fiber)
    }
    reconcileChildren(fiber, fiber.props?.children)
  }


  // 返回下一个工作节点
  // 深度优先遍历
  // 先找子节点=>再找兄弟相邻=>父节点的相邻节点
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

const isGone = (prev, next) => key => !(key in next)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)

function updateDom(dom, prevProps, nextProps) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)
      .filter(
        key =>
          !(key in nextProps) ||
          isNew(prevProps, nextProps)(key)
      )
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2)
        dom.removeEventListener(
          eventType,
          prevProps[name]
        )
      })
  
    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = ""
      })
  
    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name]
      })
  
    // Add event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        console.log(dom, nextProps[name])
        const eventType = name
          .toLowerCase()
          .substring(2)
        dom.addEventListener(
          eventType,
          nextProps[name]
        )
      })
  }


  function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
      domParent.removeChild(fiber.dom)
    } else {
      commitDeletion(fiber.child, domParent)
    }
  }
function commitWork(fiber){

  let domParentFiber = fiber.parent

  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }

  const domParent = domParentFiber.dom


  //  根据当前effectTag来决定执行什么操作
  if(fiber.dom && fiber.effectTag === 'PLACEMENT'){
    console.log('第一次创建',fiber.dom)
    // 将dom添加到父节点
    domParent.appendChild(fiber.dom)
  }else if(fiber.dom && fiber.effectTag === 'UPDATE'){
    console.log('更新节点',fiber.dom)
      updateDom(
        fiber.dom,
        fiber.alternate.props,
        fiber.props
      )
  }else if(fiber.effectTag === 'DELETION'){
    // 将dom从父节点移除
    commitDeletion(fiber, domParent)
  }

  // 递归
  if(fiber.child){
    commitWork(fiber.child)
  }
  if(fiber.sibling){
    commitWork(fiber.sibling)
  }
}

function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function workLoop(deadline){
  let shouldYield = false
  console.log('我空闲了，我来检查一下')
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  // 所有工作都结束了
  // 开始提交最终的渲染
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function createDom(fiber){
  const dom =  fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)
  
  return dom
}

function render(element, container){
    wipRoot = {
      dom: container,
      props: {
        children: [element]
      },
      alternate: currentRoot
    }

    deletions = []
    nextUnitOfWork = wipRoot
  // element?.props?.children.forEach(v=> {
  //   // 递归遍历子节点
  //   render(v, dom)
  // })

  // // 添加dom元素
  // container.appendChild(dom)
}

// function render1(element, container){
//   const dom = createDom(element)
//   element.props.children?.forEach(v=> {
//     render1(v, dom)
//   })
//   container.appendChild(dom)
// }


// setTimeout(()=>{
//   let index = 20000 
//   while(index) {
//     console.log(index--)
//   }
// },50)

//   /** @jsx Didact.createElement */
// const element = (
//   <div>
//     <h2 onClick={()=> {
//       console.log('click')
//     }}>Hello </h2>
//     <div>
//   下面是一个列表

// </div>
//   </div>
// )

render(<App />, document.querySelector('#app'))
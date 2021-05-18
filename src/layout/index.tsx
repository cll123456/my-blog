import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { renderRoutes } from 'react-router-config'
import { BrowserRouter } from 'react-router-dom'
import { routes } from '../routes'
import store from '../store'
import { changeBgColor, changeHeaderBgColor } from '../store/actions/header'
import { EbgColor, EHeaderBgColor } from '../types/store/action/header'
import Header from './Header'
import MyMenu from './MyMenu'
import './index.less'

export default function Layout() {
  // 刷新组件
  const [, reloadComp] = useState({});

  // 改变皮肤的方法
  const handleSkin = (checked: boolean) => {
    // 修改背景颜色
    store.dispatch(changeBgColor(checked ? EbgColor.Sun : EbgColor.Moon));
    // 改变头部背景颜色
    store.dispatch(changeHeaderBgColor(checked ? EHeaderBgColor.Sun : EHeaderBgColor.Moon));

    if (checked) {
      // 明亮主题
      window.location.reload();
    } else {
      import('./../assets/style/index.dark.less')
     
    }
    reloadComp({});
  }
  // 组转body,适应首屏
  let body = composeBody(handleSkin);

  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          {body}
        </Provider>
      </BrowserRouter >
    </>
  )
}

/**
 * 组装body
 * @param handleSkin 
 * @returns 
 */
function composeBody(handleSkin: (checked: boolean) => void) {
  // 获取当前的路径
  const pathname = window.location.pathname
  // 判断当前的路径是否在网站主体页面
  const isNeedHeader = routes.filter(r => r.path === pathname).length > 0;
  let body: JSX.Element = <></>;
  // 需要header, 用来适应网站的主体
  if (isNeedHeader) {
    body = (
      <div className="layout-container">
        {/* 头部 */}
        <Header key={'header'} changeSkin={handleSkin}></Header>
        {/* 主体 */}
        <div key={'menuContainer'} className='main-container'>
          {/* 左侧菜单 */}
          <div key={'myMenu'} className='myMenu-container'>
            <MyMenu></MyMenu>
          </div>
          {/* 主体内容路由区域 */}
          <div key={'routes'} className='body-container'>
            {renderRoutes(routes)}
          </div>
        </div>
      </div>
    )
  } else {
    // 这么替换的目的是，为了防止过多对比节点，这个是为了用来适应首屏的
    body = (
      <div>
        {/* 头部 */}
        <div key={'header'}></div>
        {/* 主体 */}
        <div key={'menuContainer'}>
          {/* 左侧菜单 */}
          <div key={'myMenu'}>
          </div>
          {/* 主体内容路由区域 */}
          <div key={'routes'}>
            {renderRoutes(routes)}
          </div>
        </div>
      </div>
    )
  }
  return body;
}
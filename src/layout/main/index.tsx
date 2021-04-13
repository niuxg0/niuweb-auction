import React from 'react';
import { Layout, Menu } from 'antd';
import { HomeOutlined, PictureOutlined } from '@ant-design/icons'
import { Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom'
import logo from '../../static/logo'
import Index from './pages/index'
import Picture from './pages/picture'

const Main = () => {
  const location = useLocation()
  const history = useHistory()

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout.Sider theme="dark" collapsed={true}>
        <div style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={logo} style={{ width: 48, height: 48 }} />
        </div>
        <Menu
          theme="dark"
          selectedKeys={[ location.pathname ]}
          onClick={({ key }) => history.push(key as string)}
          style={{ marginTop: -3 }}
        >
          <Menu.Item key='/main' icon={<HomeOutlined />}>首页</Menu.Item>
          <Menu.Item key='/main/picture' icon={<PictureOutlined />}>首页</Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout.Content>
        <Layout.Header style={{ background: '#ffffff' }}>
          {location.pathname}
        </Layout.Header>
        <Layout.Content style={{ padding: 16, height: 'calc(100vh - 110px)' }}>
          <Switch>
            <Route path="/main" exact component={Index} />
            <Route path="/main/picture" component={Picture} />
            <Redirect to="/main" />
          </Switch>
        </Layout.Content>
        <div style={{ margin: 16, fontSize: 12, color: '#999999' }}>Copyright {new Date().getFullYear()} NiuWeb.com.cn </div>
      </Layout.Content>
    </Layout>
  )
}

export default Main
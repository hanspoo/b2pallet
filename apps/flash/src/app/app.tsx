import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useState } from 'react';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { Productos } from '@flash-ws/components';
import Ordenes from '../../../../libs/components/src/lib/ordenes/ordenes';

const { Header, Sider, Content } = Layout;

enum Modo {
  PEDIDOS = 'PEDIDOS',
  ORDENES = 'ORDENES',
  LOCALES = 'LOCALES',
  PRODUCTOS = 'PRODUCTOS',
  PREFS = 'PREFS',
}

const App = () => {
  const [modo, setModo] = useState(Modo.PRODUCTOS);
  const [collapsed, setCollapsed] = useState(false);

  function onChangeMenu(args: any) {
    setModo(args.key);
  }

  return (
    <Layout id="container" role="container">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          onClick={onChangeMenu}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[Modo.PRODUCTOS + '']}
          items={[
            {
              key: Modo.PRODUCTOS,
              icon: <UploadOutlined />,
              label: 'Productos',
            },
            {
              key: Modo.ORDENES,
              icon: <UserOutlined />,
              label: 'Órdenes',
            },
            {
              key: Modo.PEDIDOS,
              icon: <UserOutlined />,
              label: 'Pedidos',
            },
            {
              key: Modo.LOCALES,
              icon: <VideoCameraOutlined />,
              label: 'Locales',
            },
            {
              key: Modo.PREFS,
              icon: <VideoCameraOutlined />,
              label: 'Preferencias',
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
          }}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            }
          )}
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}
        >
          {modo === Modo.PRODUCTOS && <Productos />}
          {modo === Modo.ORDENES && <Ordenes />}
          {modo === Modo.PREFS && <p>Preferencias</p>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import React, { useState } from 'react';

import { LoginState, LoginForm, Productos, SeccionOrdenes, Preferencias } from '@flash-ws/components';
import { useDispatch, useSelector } from 'react-redux';
import { logout, RootState } from '@flash-ws/reductor';
import { GlobalLoader } from './GlobalLoader';

const { Header, Sider, Content } = Layout;

enum Modo {
  PEDIDOS = 'PEDIDOS',
  ORDENES = 'ORDENES',
  LOCALES = 'LOCALES',
  PRODUCTOS = 'PRODUCTOS',
  PREFS = 'PREFS',
  CLIENTES = 'CLIENTES',
}

const App = () => {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state: RootState) => state.counter.loggedIn)
  const [modo, setModo] = useState(Modo.ORDENES);
  const [collapsed, setCollapsed] = useState(false);

  if (!loggedIn)
    return <LoginForm />

  function onChangeMenu(args: any) {
    setModo(args.key);
  }

  return (
    <GlobalLoader>
      <Layout id="container" role="container" >
        <LoginState />
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />

          <Menu
            onClick={onChangeMenu}
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[Modo.ORDENES + '']}
            items={[
              {
                key: Modo.ORDENES,
                icon: <UserOutlined />,
                label: 'Órdenes',
              },
              {
                key: Modo.PRODUCTOS,
                icon: <UploadOutlined />,
                label: 'Productos',
              },
              {
                key: Modo.PEDIDOS,
                icon: <UserOutlined />,
                label: 'Pedidos',
              },
              {
                key: Modo.CLIENTES,
                icon: <VideoCameraOutlined />,
                label: 'Clientes',
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

              padding: 24,
              minHeight: 280,
            }}
          >
            {modo === Modo.PEDIDOS && <p>En construcción</p>}
            {modo === Modo.CLIENTES && <p>En construcción</p>}
            {modo === Modo.LOCALES && <p>En construcción</p>}
            {modo === Modo.PRODUCTOS && <Productos />}
            {modo === Modo.ORDENES && <SeccionOrdenes />}
            {modo === Modo.PREFS && <Preferencias />}
            <Button style={{ position: "absolute", left: '1em', bottom: '1em' }} type="link" onClick={() => {
              dispatch(logout())
            }}>Borrar access token</Button>
          </Content>
        </Layout>

      </Layout>
    </GlobalLoader>
  );
};

export default App;

function Home() {
  return <div>Home</div>;
}
function About() {
  return <div>About</div>;
}
function Dashboard() {
  return <div>Dashboard</div>;
}
function NoMatch() {
  return <div>NoMatch</div>;
}

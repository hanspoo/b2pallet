import React, { useMemo, useState } from 'react';
import styles from "./login-form.module.css"
import { Button, Checkbox, Form, Input, notification, Spin, Typography } from 'antd';
import { LoginRequest } from '@flash-ws/api-interfaces';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '@flash-ws/reductor';
import { SignupForm } from '../signup-form/signup-form';



const { Title } = Typography

enum View {
  LOGIN, REGISTER
}

export const LoginForm: React.FC = () => {
  const [view, setView] = useState(View.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ name: 'Ant Design' }), []);

  const dispatch = useDispatch();

  if (view === View.REGISTER)
    return <SignupForm cancel={() => setView(View.LOGIN)} />

  const onFinish = (values: any) => {

    const { email, password } = values;

    setLoading(true);
    const data: LoginRequest = { email, password };
    fetch(`${process.env['NX_SERVER_URL']}/api/auth/login`, {
      headers: {
        "content-type": "application/json"
      }, body: JSON.stringify(data), method: "POST"
    }).then(response => {

      console.log("response.headers", response.headers);


      const token = response.headers.get("x-token");
      if (!token) { console.log(`El token ${token} es inválido`); return; }

      response.text().then(data => {
        if (data !== "login Ok") {
          api.error({
            message: `Problemas al iniciar la sesión`,
            description: data,
            placement: "top"
          });
          setLoading(false)
        } else {
          let i = 0;

          console.log(i++);

          console.log(i++);
          console.log("el token es", token);

          dispatch(setLoggedIn(token));
          console.log(i++);
          setLoading(false)
          console.log(i++);
        }

      }).catch(error => {
        setError(JSON.stringify(error));
        setLoading(false)

      })
    })
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };



  const Context = React.createContext({ name: 'Default' });
  return (
    <Context.Provider value={contextValue}>

      <div className={styles["login-form"]}>
        {contextHolder}
        <Form
          layout="vertical"
          className={styles["ant-form"]}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >

          <Title level={3} style={{ marginBottom: '1em' }}>Ingresar</Title>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 0 }}>
            <Checkbox>Recordarme en este equipo</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {loading ? <Spin /> : "Enviar"}
            </Button>
          </Form.Item>
          <Button onClick={() => setView(View.REGISTER)} style={{ margin: 0, padding: 0 }} type="link">Registrar Gratís</Button>
        </Form>
      </div >
    </Context.Provider>
  );
};


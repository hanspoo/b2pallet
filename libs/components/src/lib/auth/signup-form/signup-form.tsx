import React, { useMemo, useState } from 'react';
import styles from '../auth-form.module.css';
import {
  Button,
  Checkbox,
  Form,
  Input,
  notification,
  Spin,
  Typography,
} from 'antd';
import { SignupRequest } from '@flash-ws/api-interfaces';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '@flash-ws/reductor';
import axios from 'axios';

const { Title } = Typography;

enum View {
  FORM,
  LANDING,
}

export const SignupForm: React.FC<{ cancel: () => void }> = ({ cancel }) => {
  const [view, setView] = useState(View.FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ name: 'Ant Design' }), []);

  const dispatch = useDispatch();

  if (view === View.LANDING) return <LandingRegistration />;

  const onFinish = (values: any) => {
    const { empresa, nombre, email, password, identLegal } = values;

    setLoading(true);
    const data: SignupRequest = {
      empresa,
      nombre,
      email,
      password,
      identLegal,
    };
    axios
      .post(`${process.env['NX_SERVER_URL']}/api/auth/signup`, data)
      .then((response) => {
        console.log(response.data);
        cancel();
      })
      .catch((error) => {
        setError(JSON.stringify(error));
        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  if (error) return <p>{error}</p>;

  const Context = React.createContext({ name: 'Default' });
  return (
    <Context.Provider value={contextValue}>
      <div className={styles['login-form']}>
        {contextHolder}
        <Form
          style={{ width: 400 }}
          layout="vertical"
          className={styles['ant-form']}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Title level={3} style={{ marginBottom: '1em' }}>
            Registrar
          </Title>

          <Form.Item
            label="Empresa"
            name="empresa"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="RUT"
            name="identLegal"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Nombre Completo"
            name="nombre"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contrase??a"
            name="password"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Repetir Contrase??a"
            name="repassword"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input.Password />
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '3em' }}>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {loading ? <Spin /> : 'Enviar'}
              </Button>
            </Form.Item>
          </div>
          <Button block type="link" onClick={cancel}>
            Volver al inicio
          </Button>
        </Form>
      </div>
    </Context.Provider>
  );
};

function LandingRegistration() {
  return (
    <div>
      <Title level={3}>Estamos casi listos</Title>
      <p>
        Hola, te hemos enviado un correo electr??nico con un link para completar
        el registro.{' '}
      </p>
    </div>
  );
}

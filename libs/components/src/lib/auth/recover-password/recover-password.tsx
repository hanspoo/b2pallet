import React, { useMemo, useState } from 'react';
import styles from "../auth-form.module.css"
import { Button, Checkbox, Form, Input, notification, Typography } from 'antd';
import { LoginRequest, RecoverPasswordRequest } from '@flash-ws/api-interfaces';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '@flash-ws/reductor';
import axios from 'axios';


const { Title } = Typography

export const RecoverPassword: React.FC<{ cancel: () => void }> = ({ cancel }) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ name: 'Ant Design' }), []);

  const dispatch = useDispatch();



  const onFinish = (values: any) => {

    const { email } = values;

    setLoading(true);
    const data: RecoverPasswordRequest = { email };

    axios.post(`${process.env['NX_SERVER_URL']}/api/auth/recover-pass`, data

    ).then(response => {
      console.log(response.data);
      setLoading(false)
    }).catch(error => { setError(error); setLoading(false) });
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };




  return (


    <div className={styles["login-form"]}>


      <Form
        layout="vertical"
        className={styles["ant-form"]}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >

        <Title level={3} style={{ marginBottom: '1em' }}>Recuperar contraseña</Title>
        <p>Ingrese tu correo electrónico y te enviaremos un email
          para que pueda establecer una nueva contraseña:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}


        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: "email", required: true }]}
        >
          <Input />
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Form.Item>
            <Button block type="primary" htmlType="submit" style={{ marginRight: '0.1em' }}>
              Enviar
            </Button>
          </Form.Item>
          <Button style={{ marginTop: '1em' }} type="link" onClick={cancel} >Volver al inicio</Button>
        </div>
      </Form>
    </div >

  );
};


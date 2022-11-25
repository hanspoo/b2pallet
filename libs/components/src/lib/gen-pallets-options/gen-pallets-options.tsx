import { useState } from 'react';
import { Form, Input, Button, Radio } from 'antd';
import styles from './gen-pallets-options.module.css';

import { OpcionesGenPallets } from '../pallets-generator/pallets-generator';
import { TipoHU, Distribuir, Ordenar } from '@flash-ws/api-interfaces';
import { capitalize } from '@flash-ws/shared';

const GenPalletsOptions = ({
  genPallets,
}: {
  genPallets: (options: OpcionesGenPallets) => void;
}) => {
  const [usarHUManual, setHUManual] = useState(false);
  const onValuesChange = ({ tipoHU }: { tipoHU: TipoHU }) => {
    setHUManual(tipoHU === TipoHU.MANUAL);
  };

  const onFinish = (values: OpcionesGenPallets) => {
    genPallets(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles['container']}>
      <Form
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        initialValues={{
          distribuir: Distribuir.HORIZONTAL,
          ordenar: Ordenar.PESO,
          tipoHU: TipoHU.AUTOMATICA,
        }}
        onValuesChange={onValuesChange}
      >
        <Form.Item
          label="Distribuir"
          name="distribuir"
          style={{ marginBottom: 0 }}
        >
          <Radio.Group>
            {Object.keys(Distribuir).map((s) => (
              <Radio value={s} key={s}>
                {capitalize(s)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <div style={{ marginBottom: '1em' }}>
          <div style={{ marginBottom: '0.25em' }}>
            Luego de ordenar las cajas por el criterio seleccionado:
          </div>
          <div>
            <b>Horizontal</b>: Crea todos los pallets y va asignando una caja a
            cada pallet hasta que las distribuye todas.
          </div>
          <div>
            <b>Vertical</b>: Completa un pallet, luego el siguiente hasta que
            distribuye todas las cajas.
          </div>
        </div>
        <Form.Item label="Ordenar" name="ordenar">
          <Radio.Group>
            {Object.keys(Ordenar).map((s) => (
              <Radio value={s} key={s}>
                {capitalize(s)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Tipo HU"
          name="tipoHU"
          style={{ marginBottom: '0.5em' }}
        >
          <Radio.Group>
            {Object.keys(TipoHU).map((s) => (
              <Radio value={s} key={s}>
                {capitalize(s)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="HU Comenzar"
          name="huComenzar"
          rules={[
            {
              required: usarHUManual,
              message: 'Por favor ingrese la próxima HU',
            },
          ]}
        >
          <Input disabled={!usarHUManual} />
        </Form.Item>
        <div style={{ marginBottom: '1em' }}>
          <div>
            <b>Automática</b>: El sistema comenzará a partir de la última HU
            asignada.
          </div>
          <div>
            <b>Manual</b>: Ingrese manualmente la HU a utilizar.
          </div>
        </div>
        <Button htmlType="submit" type="primary" style={{ marginTop: '1.5em' }}>
          Enviar
        </Button>
      </Form>
    </div>
  );
};

export { GenPalletsOptions };

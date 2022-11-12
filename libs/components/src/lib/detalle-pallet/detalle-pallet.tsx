import { IPalletConsolidado } from '@flash-ws/api-interfaces';
import { Col, Descriptions, Row } from 'antd';
import styles from './detalle-pallet.module.css';

/* eslint-disable-next-line */
export interface DetallePalletProps {
  pallet: IPalletConsolidado;
}

export function DetallePallet({ pallet }: DetallePalletProps) {
  const { numcajas, vol, peso, palletid, nombrelocal, porcUso } = pallet;
  return (
    <Row>
      <Col span="4" style={{ display: 'flex', alignItems: 'center' }}>
        <Icono pallet={pallet} />
      </Col>
      <Col span="12">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Local">{nombrelocal}</Descriptions.Item>
          <Descriptions.Item label="% Uso">
            {porcUso.toFixed(1)}%
          </Descriptions.Item>
          <Descriptions.Item label="Número cajas">{numcajas}</Descriptions.Item>
          <Descriptions.Item label="Volumen usado">
            {(vol / 10000).toFixed(0)} cm<sup>3</sup>
          </Descriptions.Item>
          <Descriptions.Item label="Peso">
            {(peso / 1000).toFixed(2)} kgs
          </Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  );
}
export function Icono({
  pallet: { peso, porcUso, numcajas },
}: DetallePalletProps) {
  const opacity = peso / 50000;
  const backgroundColor = `rgba(9,56,100,${opacity})`;

  return (
    <div
      className={styles['pallet-box']}
      title={`${(peso / 1000).toFixed(2)} kgs / ${porcUso.toFixed(
        2
      )} vol / ${numcajas} cajas`}
    >
      <div
        style={{
          height: `${porcUso.toFixed(0)}px`,
          backgroundColor,
        }}
      ></div>
    </div>
  );
}

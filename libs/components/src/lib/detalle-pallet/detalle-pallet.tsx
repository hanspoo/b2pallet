import { IPalletConsolidado } from '@flash-ws/api-interfaces';
import { Col, Descriptions, Row } from 'antd';

import { ContainerCajasPallets } from '../lista-cajas-pallet/ContainerCajasPallets';
import styles from './detalle-pallet.module.css';
import { EtiquetaPallet } from './EtiquetaPallet';



/* eslint-disable-next-line */
export interface DetallePalletProps {
  pallet: IPalletConsolidado;
}

export function DetallePallet({ pallet }: DetallePalletProps) {
  const { numcajas, vol, peso, palletid, nombrelocal, porcUso, hu } = pallet;
  return (
    <div>
      <div style={{ position: "absolute", right: '1em' }}>
        <EtiquetaPallet pallet={pallet} />
      </div>
      <Row>
        <Col span="4" style={{ display: 'flex', alignItems: 'center' }}>
          <Icono pallet={pallet} />
        </Col>
        <Col span="12">

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="HU">
              <b>{hu}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Local">
              <b>{nombrelocal}</b>
            </Descriptions.Item>
            <Descriptions.Item label="% Uso">
              {porcUso.toFixed(1)}%
            </Descriptions.Item>
            <Descriptions.Item label="Número cajas">
              {numcajas}
            </Descriptions.Item>
            <Descriptions.Item label="Volumen usado">
              {(vol / 1000).toFixed(2)} m<sup>3</sup>
            </Descriptions.Item>
            <Descriptions.Item label="Peso">
              {(peso / 1000).toFixed(2)} kgs
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <div style={{ margin: '1em 0' }}>
        <ContainerCajasPallets pallet={pallet} />
      </div>
    </div>
  );
}
export function Icono({
  pallet: { peso, porcUso, numcajas },
}: DetallePalletProps) {
  const opacity = peso / 50000;
  const backgroundColor = `rgba(9,56,100,${opacity})`;

  return (
    <div
      style={{ height: scale(100) }}
      className={styles['pallet-box']}
      title={`${(peso / 1000).toFixed(2)} kgs / ${porcUso.toFixed(
        2
      )} vol / ${numcajas} cajas`}
    >
      <div
        style={{
          height: scale(porcUso),
          backgroundColor,
        }}
      ></div>
    </div>
  );
}

const scale = (n: number) => n * 2.3;



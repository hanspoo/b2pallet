import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { IPalletConsolidado } from '@flash-ws/api-interfaces';
import { capitalize } from '@flash-ws/shared';

import { Row, Col, Radio } from 'antd';
import { useState } from 'react';
import { Cubeta } from './Cubeta';

export interface PalletsIconoProps {
  pallets: IPalletConsolidado[];
}

enum CriteriosOrden {
  PESO = 'PESO',
  VOLUMEN = 'VOLUMEN',
  NUM_CAJAS = 'NUM_CAJAS',
}
enum Orden {
  ASC,
  DESC,
}

export function PalletsIcono({ pallets }: PalletsIconoProps) {
  const [ordenarPor, setOrdenarPor] = useState<CriteriosOrden>();
  const [orden, setOrden] = useState<Orden>(Orden.ASC);

  const handleChange = (value: string) => {
    setOrdenarPor(value as CriteriosOrden);
  };

  const palletsOrdenados = ordenarPor
    ? ordenarPallets(pallets, ordenarPor, orden)
    : pallets;
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span="24" style={{ textAlign: 'right', marginBottom: '1em' }}>
          <label>Ordenar por </label>
          <Radio.Group
            value={ordenarPor}
            onChange={(e) => handleChange(e.target.value)}
          >
            {Object.keys(CriteriosOrden).map((v) => (
              <Radio.Button value={v}>
                {capitalize(v.replace('_', ' '))}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Radio.Button onClick={() => setOrden(Orden.ASC)}>
            <ArrowUpOutlined />
          </Radio.Button>
          <Radio.Button onClick={() => setOrden(Orden.DESC)}>
            <ArrowDownOutlined />
          </Radio.Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {palletsOrdenados.map((p) => (
          <Col
            span="3"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Cubeta pallet={p} />
            <div>{p.nombrelocal.toLowerCase()}</div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default PalletsIcono;

function ordenarPallets(
  pallets: IPalletConsolidado[],
  ordenar: CriteriosOrden,
  orden: Orden
): IPalletConsolidado[] {
  if (ordenar === CriteriosOrden.PESO)
    return pallets.sort((a, b) =>
      orden === Orden.ASC ? a.peso - b.peso : b.peso - a.peso
    );
  if (ordenar === CriteriosOrden.VOLUMEN)
    return pallets.sort((a, b) =>
      orden === Orden.ASC ? a.vol - b.vol : b.vol - a.vol
    );
  if (ordenar === CriteriosOrden.NUM_CAJAS)
    return pallets.sort((a, b) =>
      orden === Orden.ASC ? a.numcajas - b.numcajas : b.numcajas - a.numcajas
    );

  return pallets;
}

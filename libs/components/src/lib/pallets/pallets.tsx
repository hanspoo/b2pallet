import {
  IConsolidadoCajas,
  IPalletConsolidado,
} from '@flash-ws/api-interfaces';
import { Table } from 'antd';
import { volumenProtoPallet } from '../front-utils';
import ProgressBar from '../grafico-avance/ProgressBar';

/* eslint-disable-next-line */
export interface PalletsProps {
  pallets: IPalletConsolidado[];
}

export function Pallets({ pallets }: PalletsProps) {
  const cols = [
    {
      title: 'palletid',
      dataIndex: 'palletid',
      align: 'right' as any,
      width: '1em',
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.palletid - b.palletid,
    },
    {
      title: 'nombrelocal',
      dataIndex: 'nombrelocal',
      width: '200px',
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.nombrelocal.localeCompare(b.nombrelocal),
    },
    {
      title: 'numcajas',
      dataIndex: 'numcajas',
      align: 'right' as any,
      width: '80px',
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.numcajas.localeCompare(b.numcajas),
    },
    {
      title: 'vol',
      dataIndex: 'vol',
      align: 'right' as any,
      width: '100px',
      render: (vol: string) =>
        parseFloat(vol).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        parseInt(a.vol) - parseInt(b.vol),
    },
    {
      title: 'peso',
      dataIndex: 'peso',
      align: 'right' as any,
      width: '100px',
      render: (vol: string) => parseFloat(vol).toLocaleString(),

      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.peso.localeCompare(b.peso),
    },
    {
      title: '%Uso',
      dataIndex: 'vol',
      width: '100px',
      render: (vol: string) => {
        const v = (parseFloat(vol) * 100) / volumenProtoPallet;
        return (
          <div
            title={`${v.toFixed(0)}%`}
            style={{ width: 100, border: 'solid 1px #ccc' }}
          >
            <div
              style={{
                height: '14px',
                backgroundColor: '#1890ff',
                width: v.toFixed(0) + 'px',
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <span>
      <Table dataSource={pallets} columns={cols} />;
    </span>
  );
}

export default Pallets;

function volCajas(cajas: IConsolidadoCajas[]): number {
  return cajas.reduce((acc, caja) => {
    const x = parseFloat(caja.largo);
    const y = parseFloat(caja.ancho);
    const z = parseFloat(caja.alto);

    acc += x * y * z;
    return acc;
  }, 0.0);
}

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

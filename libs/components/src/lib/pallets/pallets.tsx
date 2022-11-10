import { IPalletConsolidado } from '@flash-ws/api-interfaces';
import { Table } from 'antd';

/* eslint-disable-next-line */
export interface PalletsProps {
  pallets: IPalletConsolidado[];
}

export function Pallets({ pallets }: PalletsProps) {
  const cols = [
    {
      title: 'id',
      dataIndex: 'palletid',
      align: 'right' as any,
      width: '1em',
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.palletid - b.palletid,
    },
    {
      title: 'Local',
      dataIndex: 'nombrelocal',
      width: '200px',
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.nombrelocal.localeCompare(b.nombrelocal),
    },
    {
      title: '#Cajas',
      dataIndex: 'numcajas',
      align: 'right' as any,
      width: '80px',
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) =>
        a.numcajas - b.numcajas,
    },
    {
      title: 'Vol',
      dataIndex: 'vol',
      align: 'right' as any,
      width: '100px',
      render: (vol: string) =>
        parseFloat(vol).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) => a.vol - b.vol,
    },
    {
      title: 'Peso',
      dataIndex: 'peso',
      align: 'right' as any,
      width: '100px',
      render: (vol: string) => parseFloat(vol).toLocaleString(),

      sorter: (a: IPalletConsolidado, b: IPalletConsolidado) => a.peso - b.peso,
    },
    {
      title: '%Uso',
      dataIndex: 'vol',
      width: '100px',
      render: (vol: string, a: IPalletConsolidado) => {
        return (
          <div
            title={`${a.porcUso.toFixed(0)}%`}
            style={{ width: 100, border: 'solid 1px #ccc' }}
          >
            <div
              style={{
                height: '14px',
                backgroundColor: '#1890ff',
                width: a.porcUso.toFixed(0) + 'px',
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

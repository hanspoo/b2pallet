import { Typography } from 'antd';

import { Table } from 'antd';

import { useState } from 'react';
import Search from 'antd/lib/input/Search';
import { LineaDetalle, Producto } from '@flash-ws/dao';

const { Title } = Typography;

const columns = [
  {
    title: 'Cantidad',
    dataIndex: 'cantidad',
    sorter: (a: LineaDetalle, b: LineaDetalle) => {
      return a.cantidad - b.cantidad;
    },
  },
];

/* eslint-disable-next-line */
export interface TablaLineasProps {
  lineas: LineaDetalle[];
}

export function TablaLineas({ lineas }: TablaLineasProps) {
  const [search, setSearch] = useState<RegExp>();

  function onSearch(e: any) {
    const regex = new RegExp(e.target.value, 'i');
    setSearch(regex);
  }

  return (
    <div>
      <Title level={2}>Lineas de detalle</Title>
      <p>Hay {lineas.length} lineas</p>
      <Search
        style={{ marginBottom: '0.5em' }}
        placeholder="buscar..."
        onKeyUp={onSearch}
        enterButton
      />
      <Table
        dataSource={lineas}
        columns={columns}
        pagination={{ defaultPageSize: 1000 }}
      />
      ;
    </div>
  );
}

export default TablaLineas;

import { Producto } from '@flash-ws/dao';
import { Spin, Table } from 'antd';

import styles from './productos.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'First Name',
    dataIndex: 'firstName',
  },
];

/* eslint-disable-next-line */
export interface ProductosProps {}

export function Productos(props: ProductosProps) {
  const [data, setData] = useState<Array<Producto>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('/api/productos')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(JSON.stringify(error));
        setLoading(false);
      });
  }, []);

  if (loading) return <Spin />;
  if (error) return <p>{error}</p>;

  if (!data) return <p>Internal error</p>;

  return (
    <div className={styles['container']}>
      <h1>There are {data.length} productos</h1>
      <Table dataSource={data} columns={columns} />;
    </div>
  );
}

export default Productos;

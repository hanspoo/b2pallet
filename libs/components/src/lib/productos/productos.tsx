import { Typography } from 'antd';

import { Producto } from '@flash-ws/dao';

import { Spin, Table } from 'antd';

import styles from './productos.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SubirProductos } from './SubirProductos';
import { Producto3d } from './Producto3d';
import Search from 'antd/lib/input/Search';
import {
  comparaVigencia,
  fmtMedida,
  numberWithCommas,
  volumen,
} from '../front-utils';

const { Title } = Typography;

const columns = [
  {
    title: 'Código',
    dataIndex: 'codigo',
    sorter: (a: Producto, b: Producto) => {
      return a.codigo.localeCompare(b.codigo);
    },
  },
  {
    title: 'Nombre',
    dataIndex: 'nombre',
    sorter: (a: Producto, b: Producto) => {
      return a.nombre.localeCompare(b.nombre);
    },
  },
  {
    title: 'Peso',
    dataIndex: 'peso',
    align: 'right' as const,
    sorter: (a: Producto, b: Producto) => {
      return a.peso - b.peso;
    },

    render: (p: number) => numberWithCommas(p),
  },
  {
    title: 'Cencosud',
    dataIndex: 'codCenco',
    sorter: (a: Producto, b: Producto) => {
      return a.codCenco.localeCompare(b.codCenco);
    },
  },

  {
    title: 'Largo',
    dataIndex: 'box',
    align: 'right' as const,
    sorter: (a: Producto, b: Producto) => {
      return a.box.largo - b.box.largo;
    },

    render: (box: any) => {
      return fmtMedida(box.largo);
    },
  },
  {
    title: 'Ancho',
    dataIndex: 'box',
    align: 'right' as const,
    sorter: (a: Producto, b: Producto) => {
      return a.box.ancho - b.box.ancho;
    },

    render: (box: any) => {
      return fmtMedida(box.ancho);
    },
  },
  {
    title: 'Alto',
    dataIndex: 'box',
    align: 'right' as const,
    sorter: (a: Producto, b: Producto) => {
      return a.box.alto - b.box.alto;
    },

    render: (box: any) => {
      return fmtMedida(box.alto);
    },
  },
  {
    title: 'Volumen',
    dataIndex: 'codigo',
    sorter: (a: Producto, b: Producto) => {
      return volumen(a.box) - volumen(b.box);
    },
    render: (codigo: any, producto: Producto) => <Producto3d p={producto} />,
  },
  {
    title: 'Vig',
    dataIndex: 'vigente',
    sorter: (a: Producto, b: Producto) => {
      return comparaVigencia(a, b);
    },

    render: (vigente: boolean) => (vigente ? 'Si' : 'No'),
  },
];

/* eslint-disable-next-line */
export interface ProductosProps {}

export function Productos(props: ProductosProps) {
  const [search, setSearch] = useState<RegExp>();
  const [data, setData] = useState<Array<Producto>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env['NX_SERVER_URL']}/api/productos`)
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

  function onSearch(e: any) {
    const regex = new RegExp(e.target.value, 'i');
    setSearch(regex);
  }

  const productos = search
    ? data.filter(
        (prod) =>
          search.test(prod.nombre) ||
          search.test(prod.codigo) ||
          search.test(prod.codCenco)
      )
    : data;

  return (
    <div className={styles['container']}>
      <div style={{ float: 'right', position: 'relative', top: '+48px' }}>
        <SubirProductos />
      </div>
      <Title level={2}>Productos</Title>
      <p>Hay {productos.length} productos</p>
      <Search
        style={{ marginBottom: '0.5em' }}
        placeholder="buscar..."
        onKeyUp={onSearch}
        enterButton
      />
      <Table
        dataSource={productos}
        columns={columns}
        pagination={{ defaultPageSize: 1000 }}
        rowClassName={(record) => (record.vigente ? '' : 'disabled-row')}
      />
      ;
    </div>
  );
}

export default Productos;

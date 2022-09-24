import { Typography } from 'antd';

import { Producto } from '@flash-ws/dao';

import { Spin, Table } from 'antd';

import styles from './productos.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SubirProductos } from './SubirProductos';
import { Producto3d } from './Producto3d';
import Search from 'antd/lib/input/Search';

const { Title } = Typography;

function volumen(p: Producto) {
  const { largo, ancho, alto } = p.box;
  return largo * ancho * alto;
}

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
      return volumen(a) - volumen(b);
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
      <div style={{ float: 'right' }}>
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

function numberWithCommas(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function comparaVigencia(a: Producto, b: Producto) {
  const x = a.vigente ? 1 : 0;
  const y = b.vigente ? 1 : 0;

  return x - y;
}

function fmtMedida(n: number) {
  return n / 10;
}

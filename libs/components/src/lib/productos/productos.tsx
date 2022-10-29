import { Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';

import { IProducto } from '@flash-ws/api-interfaces';

import { Spin, Table } from 'antd';

import styles from './productos.module.css';
import { useEffect, useState } from 'react';
import { SubirIProductos } from './SubirProductos';
import { Producto3d } from './Producto3d';
import Search from 'antd/lib/input/Search';
import {
  comparaVigencia,
  fmtMedida,
  formatNumber,
  volumen,
} from '../front-utils';

const { Title } = Typography;

const columns = [
  {
    title: 'Código',
    dataIndex: 'codigo',
    sorter: (a: IProducto, b: IProducto) => {
      return a.codigo.localeCompare(b.codigo);
    },
  },
  {
    title: 'Nombre',
    dataIndex: 'nombre',
    sorter: (a: IProducto, b: IProducto) => {
      return a.nombre.localeCompare(b.nombre);
    },
  },
  {
    title: 'Peso',
    dataIndex: 'peso',
    align: 'right' as const,
    sorter: (a: IProducto, b: IProducto) => {
      return a.peso - b.peso;
    },

    render: (p: number) => formatNumber(p),
  },
  {
    title: 'Cencosud',
    dataIndex: 'codCenco',
    sorter: (a: IProducto, b: IProducto) => {
      return a.codCenco.localeCompare(b.codCenco);
    },
  },

  {
    title: 'Largo',
    dataIndex: 'box',
    align: 'right' as const,
    sorter: (a: IProducto, b: IProducto) => {
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
    sorter: (a: IProducto, b: IProducto) => {
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
    sorter: (a: IProducto, b: IProducto) => {
      return a.box.alto - b.box.alto;
    },

    render: (box: any) => {
      return fmtMedida(box.alto);
    },
  },
  {
    title: 'Volumen',
    dataIndex: 'codigo',
    sorter: (a: IProducto, b: IProducto) => {
      return volumen(a.box) - volumen(b.box);
    },
    render: (codigo: any, producto: IProducto) => <Producto3d p={producto} />,
  },
  {
    title: 'Vig',
    dataIndex: 'vigente',
    sorter: (a: IProducto, b: IProducto) => {
      return comparaVigencia(a, b);
    },

    render: (vigente: boolean) => (vigente ? 'Si' : 'No'),
  },
];

/* eslint-disable-next-line */
export interface ProductosProps {}

export function IProductos(props: ProductosProps) {
  const [search, setSearch] = useState<RegExp>();
  const [data, setData] = useState<Array<IProducto>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const productos = queryClient.getQueryData<Array<IProducto>>([
      'productos',
    ]) as any;
    setData(productos);
    setLoading(false);
  }, [queryClient]);

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
        <SubirIProductos />
      </div>
      <Title level={2}>IProductos</Title>
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

export default IProductos;

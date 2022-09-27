import { Button, Typography } from 'antd';

import { OrdenCompra } from '@flash-ws/dao';

import { Spin, Table } from 'antd';

import styles from './ordenes.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Search from 'antd/lib/input/Search';
import { SubirOrdenes } from './SubirOrdenes';
import { UploadOrden } from '../upload-orden/upload-orden';

const { Title } = Typography;

const columns = [
  {
    title: 'Id',
    dataIndex: 'id',
    sorter: (a: OrdenCompra, b: OrdenCompra) => {
      return a.id - b.id;
    },
  },
  // {
  //   title: 'Cliente',
  //   dataIndex: 'cliente',
  //   sorter: (a: OrdenCompra, b: OrdenCompra) => {
  //     return a.nombre.localeCompare(b.nombre);
  //   },
  // },
  // {
  //   title: 'Unidad',
  //   dataIndex: 'nombre',
  //   sorter: (a: OrdenCompra, b: OrdenCompra) => {
  //     return a.nombre.localeCompare(b.nombre);
  //   },
  // },
  // {
  //   title: 'Peso',
  //   dataIndex: 'peso',
  //   align: 'right' as const,
  //   sorter: (a: OrdenCompra, b: OrdenCompra) => {
  //     return a.peso - b.peso;
  //   },

  //   render: (p: number) => numberWithCommas(p),
  // },
  // {
  //   title: 'Volumen',
  //   dataIndex: 'codigo',
  //   sorter: (a: OrdenCompra, b: OrdenCompra) => {
  //     return volumen(a) - volumen(b);
  //   },
  //   render: (codigo: any, ordenCompra: OrdenCompra) => (
  //     <OrdenCompra3d p={producto} />
  //   ),
  // },
  // {
  //   title: 'Estado',
  //   dataIndex: 'vigente',
  //   sorter: (a: OrdenCompra, b: OrdenCompra) => {
  //     return comparaVigencia(a, b);
  //   },

  //   render: (vigente: boolean) => (vigente ? 'Si' : 'No'),
  // },
];

/* eslint-disable-next-line */
export interface OrdenesProps {}

enum Vista {
  Listado,
  Subir,
}

export function Ordenes(props: OrdenesProps) {
  const [vista, setVista] = useState(Vista.Listado);

  return (
    <div className={styles['container']}>
      <Title level={2}>Ordenes</Title>
      <div style={{ float: 'right', position: 'relative', top: '-24px' }}>
        <Button onClick={() => setVista(Vista.Subir)}>Subir planilla</Button>
        <Button onClick={() => setVista(Vista.Listado)}>Listado</Button>
      </div>
      {vista === Vista.Listado && <ListadoOrdenes />}
      {vista === Vista.Subir && <UploadOrden />}
    </div>
  );
}

function ListadoOrdenes(props: OrdenesProps) {
  const [search, setSearch] = useState<RegExp>();
  const [data, setData] = useState<Array<OrdenCompra>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env['NX_SERVER_URL']}/api/ordenes`)
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

  const ordenes = search
    ? data.filter((prod) => search.test(prod.unidad.nombre))
    : data;

  return (
    <div className={styles['container']}>
      <p>
        {ordenes.length === 1 ? 'hay 1 orden' : `hay ${ordenes.length} ordenes`}
      </p>
      <Search
        style={{ marginBottom: '0.5em' }}
        placeholder="buscar..."
        onKeyUp={onSearch}
        enterButton
      />
      <Table
        dataSource={ordenes}
        columns={columns}
        pagination={{ defaultPageSize: 1000 }}
      />
    </div>
  );
}

export default Ordenes;

import { Button, Typography } from 'antd';

import { OrdenCompra, Pedido, UnidadNegocio } from '@flash-ws/dao';

import { Spin, Table } from 'antd';

import styles from './ordenes.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Search from 'antd/lib/input/Search';
import { UploadOrden } from '../upload-orden/upload-orden';
import { DetalleOrden } from './DetalleOrden';

const { Title } = Typography;

// const columns = [
//   {
//     title: 'Id',
//     dataIndex: 'id',
//     sorter: (a: OrdenCompra, b: OrdenCompra) => {
//       return a.id - b.id;
//     },
//   },

/* eslint-disable-next-line */
export interface OrdenesProps {}

enum Vista {
  Listado,
  Subir,
  Detalle,
}

export function Ordenes(props: OrdenesProps) {
  const [vista, setVista] = useState(Vista.Listado);
  const [orden, setOrden] = useState(Vista.Listado);

  function vistaDetalle(id: number) {
    setOrden(id);
    setVista(Vista.Detalle);
  }

  return (
    <div className={styles['container']}>
      <Title level={2}>Ordenes</Title>
      <div style={{ float: 'right', position: 'relative', top: '-24px' }}>
        <Button onClick={() => setVista(Vista.Subir)}>Subir planilla</Button>
        <Button onClick={() => setVista(Vista.Listado)}>Listado</Button>
      </div>
      {vista === Vista.Listado && (
        <ListadoOrdenes vistaDetalle={vistaDetalle} />
      )}
      {vista === Vista.Subir && <UploadOrden />}
      {vista === Vista.Detalle && <DetalleOrden id={orden} />}
    </div>
  );
}

type ListadoProps = {
  vistaDetalle: (id: number) => void;
};

function ListadoOrdenes(props: ListadoProps) {
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

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      sorter: (a: OrdenCompra, b: OrdenCompra) => {
        return a.id - b.id;
      },
      render: (id: number) => {
        return (
          <Button onClick={() => props.vistaDetalle(id)} type="link">
            {id}
          </Button>
        );
      },
    },
    {
      title: 'Numero',
      dataIndex: 'numero',
      sorter: (a: OrdenCompra, b: OrdenCompra) => {
        return a.numero.localeCompare(b.numero);
      },
      render: (numero: number, orden:OrdenCompra) => {
        return (
          <Button onClick={() => props.vistaDetalle(orden.id)} type="link">
            {numero}
          </Button>
        );
      },
    },
    {
      title: 'Emision',
      dataIndex: 'emision',
      sorter: (a: OrdenCompra, b: OrdenCompra) => {
        return a.emision.localeCompare(b.emision);
      },
    },
    {
      title: 'Entrega',
      dataIndex: 'entrega',
      sorter: (a: OrdenCompra, b: OrdenCompra) => {
        return a.entrega.localeCompare(b.entrega);
      },
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad',
      render: (unidad:UnidadNegocio) => unidad.nombre
    },

    {
      title: 'Pedido',
      dataIndex: 'pedido',
      render: (pedido:Pedido) => pedido ? pedido.id : "--"
    },
  ];
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

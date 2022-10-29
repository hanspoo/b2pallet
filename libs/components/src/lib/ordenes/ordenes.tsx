import { Button, Typography } from 'antd';

import { IOrdenCompra, IPedido, IUnidadNegocio } from '@flash-ws/api-interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { Spin, Table } from 'antd';

import styles from './ordenes.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Search from 'antd/lib/input/Search';
import { UploadOrden } from '../upload-orden/upload-orden';
import { DetalleOrden } from './DetalleOrden';
import { formatNumber } from '../front-utils';
import { useQueryClient } from '@tanstack/react-query';

const { Title } = Typography;

// const columns = [
//   {
//     title: 'Id',
//     dataIndex: 'id',
//     sorter: (a: IOrdenCompra, b: IOrdenCompra) => {
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
  const ordenes: Array<IOrdenCompra> = useSelector(
    (state: any) => state.counter.ordenes as Array<IOrdenCompra>
  );
  const [search, setSearch] = useState<RegExp>();
  const [selected, setSelected] = useState<Array<number>>();
  // const [data, setData] = useState<Array<IOrdenCompra>>();
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  // useEffect(() => {
  //   const list = queryClient.getQueryData<Array<IOrdenCompra>>([
  //     'ordenes',
  //   ]) as any;
  //   setData(list);
  //   setLoading(false);
  // }, [queryClient]);

  // const [error, setError] = useState('');

  // useEffect(() => {
  //   axios
  //     .get<Array<IOrdenCompra>>(`${process.env['NX_SERVER_URL']}/api/ordenes`)
  //     .then((response) => {
  //       setData(response.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       setError(JSON.stringify(error));
  //       setLoading(false);
  //     });
  // }, []);

  if (loading) return <Spin />;
  // if (error) return <p>{error}</p>;

  if (!ordenes) return <p>Error, no se han cargado las ordenes en el cache</p>;

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: IOrdenCompra, b: IOrdenCompra) => {
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
      sorter: (a: IOrdenCompra, b: IOrdenCompra) => {
        return a.numero.localeCompare(b.numero);
      },
      render: (numero: number, orden: IOrdenCompra) => {
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
      sorter: (a: IOrdenCompra, b: IOrdenCompra) => {
        return a.emision.localeCompare(b.emision);
      },
    },
    {
      title: 'Entrega',
      dataIndex: 'entrega',
      sorter: (a: IOrdenCompra, b: IOrdenCompra) => {
        return a.entrega.localeCompare(b.entrega);
      },
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad',
      render: (unidad: IUnidadNegocio) => unidad.nombre,
    },
    {
      title: '#IProductos',
      dataIndex: 'unidad',
      align: 'right' as const,
      render: (unidad: IUnidadNegocio, orden: IOrdenCompra) => {
        return formatNumber(orden.lineas.length);
      },
    },

    {
      title: 'IPedido',
      dataIndex: 'pedido',
      render: (pedido: IPedido) => (pedido ? pedido.id : '--'),
    },
  ];
  function onSearch(e: any) {
    const regex = new RegExp(e.target.value, 'i');
    setSearch(regex);
  }

  const filtradas = search
    ? ordenes.filter((prod) => search.test(prod.unidad.nombre))
    : ordenes;
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: IOrdenCompra[]) => {
      setSelected(selectedRowKeys);
    },
  };

  function borrarSeleccionadas() {
    selected?.forEach((id) => {
      axios
        .delete(`${process.env['NX_SERVER_URL']}/api/ordenes/${id}`)
        .then((response) => console.log(`Orden ${id} eliminada`))
        .catch((error) => console.log(error));
    });
  }

  return (
    <div className={styles['container']}>
      <p>
        {filtradas.length === 1
          ? 'hay 1 orden'
          : `hay ${filtradas.length} ordenes`}
      </p>
      <Search
        style={{ marginBottom: '0.5em' }}
        placeholder="buscar..."
        onKeyUp={onSearch}
        enterButton
      />
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        rowKey={(record: IOrdenCompra) => record.id}
        dataSource={filtradas}
        columns={columns}
        pagination={{ defaultPageSize: 1000 }}
      />
      <Button onClick={borrarSeleccionadas} disabled={selected?.length === 0}>
        Borrar Seleccionadas
      </Button>
    </div>
  );
}

export default Ordenes;

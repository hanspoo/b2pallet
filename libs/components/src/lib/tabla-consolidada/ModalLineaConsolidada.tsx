import { EstadoLinea } from '@flash-ws/api-interfaces';
import { LineaDetalle, Local, OrdenCompra, Producto } from '@flash-ws/dao';
import { actualizarOrdenes } from '@flash-ws/reductor';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox, Col, Input, Modal, Row, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatNumber } from '../front-utils';
import { lineas } from './datos';

import { EstadoUnitario } from './EstadoUnitario';

const { Title } = Typography;

export type ModalLineaConsolidadaProps = {
  productoID: number;
  orden: OrdenCompra;
  cerrar: () => void;
  actualizarConsolidada: () => void;
  editar: boolean;
};
export function ModalLineaConsolidada({
  productoID,
  orden,
  cerrar,
  actualizarConsolidada,
}: ModalLineaConsolidadaProps) {
  const dispatch = useDispatch();
  const [producto, setProducto] = useState<Producto>();
  const [data, setData] = useState<Array<LineaDetalle>>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>('');
  const [editar, setEditar] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const productos = queryClient.getQueryData<Array<Producto>>([
      'productos',
    ]) as Array<Producto>;
    const locales = queryClient.getQueryData<Array<Local>>(['locales']) as any;

    function findProd(id: number): Producto | undefined {
      return productos.find((p: Producto) => p.id === id);
    }

    function findLocal(id: number): Local | undefined {
      return locales.find((p: Local) => p.id === id);
    }

    const hidratadas = orden?.lineas
      .filter((linea) => linea.productoId === productoID)
      .map((linea) => {
        const producto = linea.productoId
          ? findProd(linea.productoId)
          : undefined;
        const local = linea.localId ? findLocal(linea.localId) : undefined;
        if (!(producto && local)) throw Error(`producto o local no encontrado`);
        return {
          ...linea,
          producto,
          local,
        };
      });

    setData(hidratadas);
    setLoading(false);
    setProducto(findProd(productoID));
  }, [orden?.lineas, productoID, queryClient]);

  if (loading) return <p>Cargando...</p>;

  function actualizarLineas(estado: EstadoLinea) {
    dispatch(actualizarOrdenes());
    actualizarConsolidada();
  }

  const columns = [
    {
      title: 'Local',
      dataIndex: 'local',
      filteredValue: [search],
      onFilter: (value: string, record: LineaDetalle) => {
        if (!value) return true;

        const regex = new RegExp(value, 'i');
        return regex.test(record.local?.nombre);
      },
      sorter: (a: LineaDetalle, b: LineaDetalle) => {
        return a.local.nombre.localeCompare(b.local.nombre);
      },

      render: (p: Local) => {
        return p ? p.nombre : 'No encontrado';
      },
    },

    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      width: '10em',
      sorter: (a: LineaDetalle, b: LineaDetalle) => {
        return a.cantidad - b.cantidad;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: `${editar ? 18 : 4}em`,
      render: (estado: string, linea: LineaDetalle) => {
        if (!editar)
          return (
            <EstadoUnitario
              editar={false}
              actual={estado as EstadoLinea}
              actualizar={actualizarLineas}
              estado={estado as EstadoLinea}
              lineaID={linea.id}
              ordenID={orden.id}
            />
          );
        return (
          <>
            {Object.keys(EstadoLinea).map((est) => (
              <EstadoUnitario
                editar={true}
                actual={estado as EstadoLinea}
                actualizar={actualizarLineas}
                estado={est as EstadoLinea}
                lineaID={linea.id}
                ordenID={orden.id}
              />
            ))}
          </>
        );
      },
      sorter: (a: LineaDetalle, b: LineaDetalle) => {
        return a.estado.localeCompare(b.estado);
      },
    },
  ];

  return (
    <Modal
      title={<Title level={3}>{producto?.nombre}</Title>}
      open={true}
      onCancel={cerrar}
      onOk={cerrar}
      width="75%"
    >
      <>
        <Row style={{ marginBottom: '0.5em' }}>
          <Col
            span={8}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Hay {formatNumber(lineas?.length)} items
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Checkbox onChange={() => setEditar(!editar)}>Editar</Checkbox>
          </Col>
        </Row>
        <Input
          style={{ width: '100%', marginBottom: '1.25em' }}
          placeholder="buscar..."
          allowClear
          onChange={(e: any) => {
            console.log(typeof e.target.value, e.target.value);

            setSearch(e.target.value);
          }}
        />

        <Table
          id="lineas"
          rowKey={(linea: LineaDetalle) => linea.id}
          className="lineas"
          dataSource={data}
          columns={columns as any}
          pagination={{ defaultPageSize: 100 }}
        />
      </>
    </Modal>
  );
}

import { LineaDetalle, Local, OrdenCompra, Producto } from '@flash-ws/dao';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const { Title } = Typography;

export type ModalLineaConsolidadaProps = {
  productoID: number;
  ordenID: number;
  cerrar: () => void;
};
export function ModalLineaConsolidada({
  productoID,
  ordenID,
  cerrar,
}: ModalLineaConsolidadaProps) {
  const [producto, setProducto] = useState<Producto>();
  const [data, setData] = useState<Array<LineaDetalle>>();
  const [loading, setLoading] = useState(true);
  const ordenes: Array<OrdenCompra> = useSelector(
    (state: any) => state.counter.ordenes as Array<OrdenCompra>
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const orden = ordenes.find((orden) => orden.id === ordenID);
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
  }, [productoID, ordenID, queryClient]);

  if (loading) return <p>Cargando...</p>;

  const columns = [
    {
      title: 'Local',
      dataIndex: 'local',
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
  ];

  return (
    <Modal
      title={<Title level={3}>{producto?.nombre}</Title>}
      open={true}
      onCancel={cerrar}
      onOk={cerrar}
      width="75%"
    >
      <Table
        id="lineas"
        rowKey={(linea: LineaDetalle) => linea.id}
        className="lineas"
        dataSource={data}
        columns={columns as any}
        pagination={{ defaultPageSize: 100 }}
      />
    </Modal>
  );
}

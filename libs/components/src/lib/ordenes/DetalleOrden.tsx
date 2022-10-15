import { OrdenCompra } from '@flash-ws/dao';
import { Descriptions, Spin } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';
import TablaLineas from './TablaLineas';

type PropsDetalleOrden = {
  id: number;
};

export function DetalleOrden({ id }: PropsDetalleOrden) {
  const [o, setOrden] = useState<OrdenCompra>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get<OrdenCompra>(`${process.env['NX_SERVER_URL']}/api/ordenes/${id}`)
      .then((response) => {
        setOrden(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(`Error: ${JSON.stringify(error)}`);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spin />;
  if (error) return <p>Error: {error}</p>;

  if (!o) return <p>Internal error</p>;

  return (
    <>
      <Descriptions
        title="OrdenCompra"
        bordered
        column={1}
        style={{ marginBottom: '1em' }}
        labelStyle={{ width: '1em' }}
      >
        <Descriptions.Item label="Id">{o.id}</Descriptions.Item>
        <Descriptions.Item label="Número">{o.numero}</Descriptions.Item>
        <Descriptions.Item label="Emision">{o.emision}</Descriptions.Item>
        <Descriptions.Item label="Entrega">{o.entrega}</Descriptions.Item>
        <Descriptions.Item label="Unidad">{o.unidad?.nombre}</Descriptions.Item>
        <Descriptions.Item label="Pedido">{o.pedido?.id}</Descriptions.Item>
      </Descriptions>

      <TablaLineas lineas={o.lineas} orden={o} />
    </>
  );
}

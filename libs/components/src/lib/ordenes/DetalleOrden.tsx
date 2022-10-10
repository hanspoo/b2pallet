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
        setError(JSON.stringify(error));
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spin />;
  if (error) return <p>{error}</p>;

  if (!o) return <p>Internal error</p>;

  return (
    <>
      <Descriptions
        title="OrdenCompra"
        bordered
        column={1}
        labelStyle={{ width: '1em' }}
      >
        <Descriptions.Item label="Id">{o.id}</Descriptions.Item>
        <Descriptions.Item label="Número">{o.numero}</Descriptions.Item>
        <Descriptions.Item label="Emision">{o.emision}</Descriptions.Item>
        <Descriptions.Item label="Entrega">{o.entrega}</Descriptions.Item>
        <Descriptions.Item label="Unidad">{o.unidad?.nombre}</Descriptions.Item>
        <Descriptions.Item label="Pedido">{o.pedido?.id}</Descriptions.Item>
      </Descriptions>

      <div>
        Hay {o.lineas.length} item{o.lineas.length === 1 ? '' : 's'}
      </div>
      <TablaLineas lineas={o.lineas} />
    </>
  );
}

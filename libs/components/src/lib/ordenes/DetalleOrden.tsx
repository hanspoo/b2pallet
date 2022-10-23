import { OrdenCompra } from '@flash-ws/dao';
import { Button, Col, Descriptions, Row, Spin } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { ContainerTablaConsolidada } from '../tabla-consolidada/container-tabla-consolidada';
import TablaLineas from './TablaLineas';

type PropsDetalleOrden = {
  id: number;
};

enum Vista {
  NORMAL,
  CONSOLIDADA,
}

export function DetalleOrden({ id }: PropsDetalleOrden) {
  const [vista, setVista] = useState<Vista>(Vista.NORMAL);
  const [o, setOrden] = useState<OrdenCompra>();
  const [loading, setLoading] = useState(true);
  const [recargar, setRecargar] = useState<boolean>();
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

      <div style={{ marginBottom: '1em' }}>
        <Button onClick={() => setVista(Vista.NORMAL)}>Normal</Button>
        <Button onClick={() => setVista(Vista.CONSOLIDADA)}>Consolidada</Button>
      </div>
      {recargar && <p>Espere...</p>}

      {!recargar && vista === Vista.NORMAL && (
        <TablaLineas
          lineas={o.lineas}
          orden={o}
          recargar={(orden: OrdenCompra) => {
            setOrden(orden);
            // setRecargar(true);
            // setTimeout(() => setRecargar(false), 2000);
          }}
        />
      )}
      {!recargar && vista === Vista.CONSOLIDADA && (
        <ContainerTablaConsolidada id={o.id} />
      )}
    </>
  );
}

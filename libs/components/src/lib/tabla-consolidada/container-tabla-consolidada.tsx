import { Producto } from '@flash-ws/dao';
import { useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { ILineaConsolidada } from './datos';
import { TablaConsolidada } from './tabla-consolidada';

type PropsDetalleOrden = {
  id: number;
};

export function ContainerTablaConsolidada({ id }: PropsDetalleOrden) {
  const [lineas, setLineas] = useState<Array<ILineaConsolidada>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const productos = queryClient.getQueryData<Array<Producto>>([
    'productos',
  ]) as Array<Producto>;

  useEffect(() => {
    axios
      .get<Array<ILineaConsolidada>>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/${id}/consolidada`
      )
      .then((response) => {
        setLineas(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(`Error: ${JSON.stringify(error)}`);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spin />;
  if (error) return <p>Error: {error}</p>;

  if (!lineas) return <p>Internal error</p>;

  return (
    <TablaConsolidada productos={productos} lineas={lineas} ordenID={id} />
  );
}

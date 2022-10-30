import { IOrdenCompra, ISuperOrden } from '@flash-ws/api-interfaces';
import { actualizarOrdenes } from '@flash-ws/reductor';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Descriptions, Spin } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GraficoAvance from '../grafico-avance/grafico-avance';
import { SuperConsolidada } from '../new-consolidada/SuperConsolidada';

import TablaLineas from './TablaLineas';

type PropsDetalleOrden = {
  id: number;
};

enum Vista {
  NORMAL,
  CONSOLIDADA,
}

export function DetalleOrden({ id }: PropsDetalleOrden) {
  const dispatch = useDispatch();
  const ordenes: Array<IOrdenCompra> = useSelector(
    (state: any) => state.counter.ordenes as Array<IOrdenCompra>
  );

  const [vista, setVista] = useState<Vista>(Vista.CONSOLIDADA);
  // const [orden, setOrden] = useState<IOrdenCompra>();
  const [loading, setLoading] = useState(false);
  const [recargar, setRecargar] = useState<boolean>();
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const orden = ordenes.find((orden) => orden.id === id);

  // const [search, setSearch] = useState<RegExp>();
  // const [selected, setSelected] = useState<Array<number>>();
  // const [data, setData] = useState<Array<IOrdenCompra>>();
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const list = queryClient.getQueryData<Array<IOrdenCompra>>([
  //     'ordenes',
  //   ]) as any;
  //   setOrden(list.find((iter: IOrdenCompra) => iter.id === id));
  //   setLoading(false);
  // }, [id, queryClient]);

  // useEffect(() => {
  //   axios
  //     .get<IOrdenCompra>(`${process.env['NX_SERVER_URL']}/api/ordenes/${id}`)
  //     .then((response) => {
  //       setOrden(response.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       setError(`Error: ${JSON.stringify(error)}`);
  //       setLoading(false);
  //     });
  // }, [id]);

  if (loading) return <Spin />;
  // if (error) return <p>Error: {error}</p>;

  if (!orden) return <p>Internal error</p>;

  return (
    <>
      <Descriptions
        title="IOrdenCompra"
        bordered
        column={1}
        style={{ marginBottom: '1em' }}
        labelStyle={{ width: '1em' }}
      >
        <Descriptions.Item label="Id">{orden.id}</Descriptions.Item>
        <Descriptions.Item label="Número">{orden.numero}</Descriptions.Item>
        <Descriptions.Item label="Emision">{orden.emision}</Descriptions.Item>
        <Descriptions.Item label="Entrega">{orden.entrega}</Descriptions.Item>
        <Descriptions.Item label="Unidad">
          {orden.unidad?.nombre}
        </Descriptions.Item>
        <Descriptions.Item label="IPedido">
          {orden.pedido?.id}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginBottom: '1em' }}>
        <Button
          type={vista === Vista.CONSOLIDADA ? 'primary' : 'default'}
          onClick={() => setVista(Vista.CONSOLIDADA)}
        >
          Consolidada
        </Button>
        <Button
          type={vista === Vista.NORMAL ? 'primary' : 'default'}
          onClick={() => setVista(Vista.NORMAL)}
        >
          Detallada
        </Button>
      </div>
      {recargar && <p>Espere...</p>}

      {!recargar && vista === Vista.NORMAL && (
        <TablaLineas
          // lineas={orden.lineas}
          orden={orden}
          recargar={(orden: IOrdenCompra) => {
            dispatch(actualizarOrdenes());

            // setOrden(orden);
            // setRecargar(true);
            // setTimeout(() => setRecargar(false), 2000);
          }}
        />
      )}
      {!recargar && vista === Vista.CONSOLIDADA && (
        <span>
          <GraficoAvance orden={orden as ISuperOrden} />
          <SuperConsolidada orden={orden as ISuperOrden} />
        </span>
      )}
    </>
  );
}

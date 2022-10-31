import { MailOutlined } from '@ant-design/icons';
import { IOrdenCompra, ISuperOrden } from '@flash-ws/api-interfaces';
import { actualizarOrdenes } from '@flash-ws/reductor';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Descriptions, Menu, Spin } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GraficoAvance from '../grafico-avance/grafico-avance';
import { SuperConsolidada } from '../new-consolidada/SuperConsolidada';
import PalletsGenerator from '../pallets-generator/pallets-generator';

import TablaLineas from './TablaLineas';

type PropsDetalleOrden = {
  id: number;
};

enum Vista {
  CONSOLIDADA = 'CONSOLIDADA',
  NORMAL = 'NORMAL',
  PALLETS = 'PALLETS',
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

  const items = [
    { label: 'item 1', key: 'item-1' }, // remember to pass the key prop
    { label: 'item 2', key: 'item-2' }, // which is required
    {
      label: 'sub menu',
      key: 'submenu',
      children: [{ label: 'item 3', key: 'submenu-item-1' }],
    },
  ];

  return (
    <>
      <Descriptions
        title="IOrdenCompra"
        bordered
        column={2}
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

      <Menu
        style={{ marginBottom: '1em' }}
        mode="horizontal"
        onSelect={(s: any) => {
          setVista(s.key);
        }}
      >
        {Object.keys(Vista).map((x) => {
          const v = x as unknown as Vista;
          return (
            <Menu.Item key={v} icon={<MailOutlined />}>
              {cap(v)}
            </Menu.Item>
          );
        })}
      </Menu>
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
      {!recargar && vista === Vista.PALLETS && (
        <span>
          <PalletsGenerator orden={orden} />
        </span>
      )}
    </>
  );
}

function cap(s: string) {
  return s.substring(0, 1) + s.substring(1).toLocaleLowerCase();
}

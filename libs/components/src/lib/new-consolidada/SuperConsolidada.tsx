import { Producto, SuperOrden } from '@flash-ws/dao';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { ILineaConsolidada } from '../tabla-consolidada/datos';

type SuperConsolidadaProps = {
  orden: SuperOrden;
};

/*
  cantidad: number;
  lineas: Array<LineaDetalle>;
  productoId: number;
  estado: EstadoLinea;
**/

type Hidratada = ILineaConsolidada & { producto: Producto };

export function SuperConsolidada({ orden }: SuperConsolidadaProps) {
  const [lineas, setLineas] = useState<Array<Hidratada>>();
  const [search, setSearch] = useState<string>('');
  const [productoID, setProductoID] = useState<number>();
  const [selected, setSelected] = useState<Array<number>>([]);
  const [data, setData] = useState<Array<Hidratada>>();

  const queryClient = useQueryClient();
  useEffect(() => {
    const productos = queryClient.getQueryData<Array<Producto>>([
      'productos',
    ]) as Array<Producto>;
    const INICIAL: Record<number, Producto> = {};
    const mapaProductos: Record<number, Producto> = productos.reduce(
      (acc, iter) => {
        acc[iter.id] = iter;
        return acc;
      },
      INICIAL
    );
    const lcons = orden.lineasConsolidadas as Array<ILineaConsolidada>;
    const hidratados = lcons.map((linea) => ({
      ...linea,
      producto: mapaProductos[linea.productoId],
    }));

    setLineas(hidratados);
  }, [orden.lineasConsolidadas, queryClient]);

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'producto',
      filteredValue: [search],
      onFilter: (value: string, record: Hidratada) => {
        if (!value) return true;

        const regex = new RegExp(value, 'i');
        return regex.test(record.producto?.nombre);
      },
      sorter: (a: Hidratada, b: Hidratada) => {
        return a.producto.nombre.localeCompare(b.producto.nombre);
      },

      render: (p: Producto) => {
        return p ? (
          <Button type="link" onClick={() => setProductoID(p.id)}>
            {p.nombre}
          </Button>
        ) : (
          'No encontrado'
        );
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: Array<any>) => {
      setSelected(selectedRowKeys);
    },
    getCheckboxProps: (record: Hidratada) => ({
      name: record.productoId + '',
    }),
  };
  return (
    <Table
      rowSelection={{
        type: 'checkbox',
        ...rowSelection,
      }}
      id="lineas"
      rowKey={(linea: Hidratada) => linea.productoId}
      className="lineas"
      dataSource={lineas}
      columns={columns as any}
      pagination={{ defaultPageSize: 100 }}
    />
  );
}

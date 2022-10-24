import { EstadoLinea } from '@flash-ws/api-interfaces';
import { LineaDetalle, Producto, SuperOrden } from '@flash-ws/dao';
import { actualizarOrdenes } from '@flash-ws/reductor';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Col, Input, Row, Select, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatNumber } from '../front-utils';
import { ILineaConsolidada } from '../tabla-consolidada/datos';
import { EstadoProducto } from '../tabla-consolidada/EstadoProducto';
import { ModalLineaConsolidada } from '../tabla-consolidada/ModalLineaConsolidada';

const { Option } = Select;

type SuperConsolidadaProps = {
  orden: SuperOrden;
};

/*
  cantidad: number;
  lineas: Array<LineaDetalle>;
  productoId: number;
  estado: EstadoLinea;
**/

type LineaConsolidadaConProducto = ILineaConsolidada & { producto: Producto };

export function SuperConsolidada({ orden }: SuperConsolidadaProps) {
  const dispatch = useDispatch();
  const [lineas, setLineas] = useState<Array<LineaConsolidadaConProducto>>();
  const [search, setSearch] = useState<string>('');
  const [editar, setEditar] = useState(false);
  const [productoID, setProductoID] = useState<number>();
  const [selected, setSelected] = useState<Array<number>>([]);
  const [estado, setEstado] = useState<EstadoLinea>();
  const [actualizando, setActualizando] = useState(false);

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

  function actualizarLineas(lineas: Array<ILineaConsolidada>) {
    dispatch(actualizarOrdenes());
  }
  const columns = [
    {
      title: 'Producto',
      dataIndex: 'producto',
      filteredValue: [search],
      onFilter: (value: string, record: LineaConsolidadaConProducto) => {
        if (!value) return true;

        const regex = new RegExp(value, 'i');
        return regex.test(record.producto?.nombre);
      },
      sorter: (
        a: LineaConsolidadaConProducto,
        b: LineaConsolidadaConProducto
      ) => {
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
      title: 'Locales',
      dataIndex: 'lineas',
      width: '10em',
      render: (lineas: Array<LineaDetalle>) => (
        <span style={{ float: 'right' }}>{lineas.length}</span>
      ),
      sorter: (
        a: LineaConsolidadaConProducto,
        b: LineaConsolidadaConProducto
      ) => {
        return a.lineas.length - b.lineas.length;
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      width: '10em',
      render: (cantidad: number) => (
        <span style={{ float: 'right' }}>{cantidad}</span>
      ),
      sorter: (
        a: LineaConsolidadaConProducto,
        b: LineaConsolidadaConProducto
      ) => {
        return a.cantidad - b.cantidad;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: `${editar ? 18 : 4}em`,
      render: (estado: string, a: LineaConsolidadaConProducto) => {
        if (!editar)
          return (
            <EstadoProducto
              editar={false}
              actual={estado as EstadoLinea}
              actualizar={actualizarLineas}
              estado={estado as EstadoLinea}
              producto={a.producto}
              ordenID={orden.id}
            />
          );
        return (
          <>
            {Object.keys(EstadoLinea).map((est) => (
              <EstadoProducto
                key={est}
                editar={true}
                actual={estado as EstadoLinea}
                actualizar={actualizarLineas}
                estado={est as EstadoLinea}
                producto={a.producto}
                ordenID={orden.id}
              />
            ))}
          </>
        );
      },
      sorter: (
        a: LineaConsolidadaConProducto,
        b: LineaConsolidadaConProducto
      ) => {
        return a.estado.localeCompare(b.estado);
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: Array<any>) => {
      setSelected(selectedRowKeys);
    },
    getCheckboxProps: (record: LineaConsolidadaConProducto) => ({
      name: record.productoId + '',
    }),
  };

  const handleChange = (e: EstadoLinea) => setEstado(e);
  const onCambiarEstado = () => {
    if (!estado)
      throw Error(
        'debe estar definido el estado a cambiar para llamar este método'
      );
    setActualizando(true);
  };

  function actualizarConsolidada() {
    dispatch(actualizarOrdenes());
  }

  return (
    <div>
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
          <span style={{ display: 'none' }}>
            <Select style={{ width: 120 }} onChange={handleChange} allowClear>
              {Object.keys(EstadoLinea).map((o) => (
                <Option value={o}>{o}</Option>
              ))}
            </Select>
            <Button
              disabled={!(estado && selected.length > 0)}
              onClick={onCambiarEstado}
            >
              {actualizando ? <Spin size="small" /> : 'Cambiar estado'}
            </Button>
          </span>
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

      {productoID && (
        <ModalLineaConsolidada
          editar={editar}
          actualizarConsolidada={actualizarConsolidada}
          cerrar={() => setProductoID(undefined)}
          productoID={productoID}
          orden={orden}
        />
      )}

      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        id="lineas"
        rowKey={(linea: LineaConsolidadaConProducto) => linea.productoId}
        className="lineas"
        dataSource={lineas}
        columns={columns as any}
        pagination={{ defaultPageSize: 100 }}
      />
    </div>
  );
}

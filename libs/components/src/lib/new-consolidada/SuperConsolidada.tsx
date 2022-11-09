import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { EstadoLinea, IOrdenCompra } from '@flash-ws/api-interfaces';
import {
  ILineaDetalle,
  IProducto,
  ISuperOrden,
} from '@flash-ws/api-interfaces';
import { actualizarOrden, actualizarOrdenes } from '@flash-ws/reductor';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Col, Input, Row, Select, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AvanceEstadoConsolidada } from '../avance-estado/avance-estado';
import { formatNumber } from '../front-utils';
import SelectorEstado from '../selector-estado/selector-estado';
import { ILineaConsolidada } from '../tabla-consolidada/datos';
import { EstadoProducto } from '../tabla-consolidada/EstadoProducto';
import { ModalLineaConsolidada } from '../tabla-consolidada/ModalLineaConsolidada';

const { Option } = Select;

type SuperConsolidadaProps = {
  orden: ISuperOrden;
};

/*
  cantidad: number;
  lineas: Array<ILineaDetalle>;
  productoId: number;
  estado: EstadoLinea;
**/

type LineaConsolidadaConIProducto = ILineaConsolidada & { producto: IProducto };

export function SuperConsolidada({ orden }: SuperConsolidadaProps) {
  const dispatch = useDispatch();
  const [lineas, setLineas] = useState<Array<LineaConsolidadaConIProducto>>();
  const [search, setSearch] = useState<string>('');
  const [editar, setEditar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productoID, setIProductoID] = useState<number>();
  const [selected, setSelected] = useState<Array<number>>([]);
  const [estado, setEstado] = useState<EstadoLinea>();
  const [estadoBuscar, setEstadoBuscar] = useState<EstadoLinea>();
  const [actualizando, setActualizando] = useState(false);

  const queryClient = useQueryClient();
  useEffect(() => {
    const productos = queryClient.getQueryData<Array<IProducto>>([
      'productos',
    ]) as Array<IProducto>;
    const INICIAL: Record<number, IProducto> = {};
    const mapaIProductos: Record<number, IProducto> = productos.reduce(
      (acc, iter) => {
        acc[iter.id] = iter;
        return acc;
      },
      INICIAL
    );
    const lcons = orden.lineasConsolidadas as Array<ILineaConsolidada>;
    const hidratados = lcons.map((linea) => ({
      ...linea,
      producto: mapaIProductos[linea.productoId],
    }));

    setLineas(hidratados);
  }, [orden.lineasConsolidadas, queryClient]);

  function actualizarLineas(orden: IOrdenCompra) {
    console.log('orden', orden);

    dispatch(actualizarOrden(orden));
  }
  const columns = [
    {
      title: 'IProducto',
      dataIndex: 'producto',
      filteredValue: [search],
      onFilter: (value: string, record: LineaConsolidadaConIProducto) => {
        if (!value) return true;

        const regex = new RegExp(value, 'i');
        return regex.test(record.producto?.nombre);
      },
      sorter: (
        a: LineaConsolidadaConIProducto,
        b: LineaConsolidadaConIProducto
      ) => {
        return a.producto.nombre.localeCompare(b.producto.nombre);
      },

      render: (p: IProducto) => {
        return p ? (
          <Button type="link" onClick={() => setIProductoID(p.id)}>
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
      render: (lineas: Array<ILineaDetalle>) => (
        <span style={{ float: 'right' }}>{lineas.length}</span>
      ),
      sorter: (
        a: LineaConsolidadaConIProducto,
        b: LineaConsolidadaConIProducto
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
        a: LineaConsolidadaConIProducto,
        b: LineaConsolidadaConIProducto
      ) => {
        return a.cantidad - b.cantidad;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: `${editar ? 18 : 4}em`,
      render: (estado: string, a: LineaConsolidadaConIProducto) => {
        if (!editar)
          return (
            <EstadoProducto
              linea={a}
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
                linea={a}
                producto={a.producto}
                ordenID={orden.id}
              />
            ))}
          </>
        );
      },
      sorter: (
        a: LineaConsolidadaConIProducto,
        b: LineaConsolidadaConIProducto
      ) => {
        return a.estado.localeCompare(b.estado);
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: Array<any>) => {
      setSelected(selectedRowKeys);
    },
    getCheckboxProps: (record: LineaConsolidadaConIProducto) => ({
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

  const reload = () => {
    setLoading(true);
    actualizarOrden(orden);
    setTimeout(() => setLoading(false), 2000);
  };

  if (loading) return <Spin />;

  return (
    <div>
      <AvanceEstadoConsolidada
        orden={orden}
        estado={estadoBuscar}
        onChange={(s?: EstadoLinea) => setEstadoBuscar(s)}
      />
      <Row style={{ marginBottom: '0.5em' }}>
        <Col
          span={8}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          hay {formatNumber(lineas?.length)} items
        </Col>
        <Col span={16} style={{ textAlign: 'right' }}>
          <ReloadOutlined
            onClick={reload}
            style={{ marginRight: '1em', color: 'green' }}
          />
          {/* <SelectorEstado
            onChange={(s: EstadoLinea) => setEstadoBuscar(s)}
            estado={estadoBuscar}
          /> */}

          <span style={{ marginLeft: '1em' }}>
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

          <Checkbox
            style={{ marginLeft: '1em' }}
            onChange={() => setEditar(!editar)}
          >
            Editar
          </Checkbox>
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
          cerrar={() => setIProductoID(undefined)}
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
        rowKey={(linea: LineaConsolidadaConIProducto) => linea.productoId}
        className="lineas"
        dataSource={
          estadoBuscar
            ? lineas?.filter((l) => l.estado === estadoBuscar)
            : lineas
        }
        columns={columns as any}
        pagination={{ defaultPageSize: 100 }}
      />
    </div>
  );
}

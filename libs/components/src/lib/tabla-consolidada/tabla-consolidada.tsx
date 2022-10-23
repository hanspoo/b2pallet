import { EstadoLinea } from '@flash-ws/api-interfaces';
import { LineaDetalle, OrdenCompra, Producto } from '@flash-ws/dao';
import { Button, Col, Input, Row, Select, Spin, Table } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';
import { formatNumber } from '../front-utils';
import { ILineaConsolidada } from './datos';
import { EstadoProducto } from './EstadoProducto';

const { Option } = Select;
type TablaConsolidadaProps = {
  lineas: Array<ILineaConsolidada>;
  productos: Array<Producto>;
  ordenID: number;
};

type Hidratada = ILineaConsolidada & { producto: Producto };

export function TablaConsolidada({
  ordenID,
  lineas,
  productos,
}: TablaConsolidadaProps) {
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<Array<number>>([]);
  const [data, setData] = useState<Array<Hidratada>>();

  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState<EstadoLinea>();
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const INICIAL: Record<number, Producto> = {};
    const mapaProductos: Record<number, Producto> = productos.reduce(
      (acc, iter) => {
        acc[iter.id] = iter;
        return acc;
      },
      INICIAL
    );
    const hidratados = lineas.map((linea) => ({
      ...linea,
      producto: mapaProductos[linea.productoId],
    }));
    console.log(hidratados);

    setData(
      hidratados.sort((a, b) =>
        a.producto.nombre
          .toLowerCase()
          .localeCompare(b.producto.nombre.toLowerCase())
      )
    );
  }, [lineas, productos]);

  function actualizarLineas(lineas: Array<ILineaConsolidada>) {
    const INICIAL: Record<number, Producto> = {};
    const mapaProductos: Record<number, Producto> = productos.reduce(
      (acc, iter) => {
        acc[iter.id] = iter;
        return acc;
      },
      INICIAL
    );
    const hidratados = lineas.map((linea) => ({
      ...linea,
      producto: mapaProductos[linea.productoId],
    }));
    console.log(hidratados);

    setData(
      hidratados.sort((a, b) =>
        a.producto.nombre
          .toLowerCase()
          .localeCompare(b.producto.nombre.toLowerCase())
      )
    );
  }

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
        return p ? p.nombre : 'No encontrado';
      },
    },
    {
      title: 'Locales',
      dataIndex: 'lineas',
      width: '10em',
      render: (lineas: Array<LineaDetalle>) => (
        <span style={{ float: 'right' }}>{lineas.length}</span>
      ),
      sorter: (a: Hidratada, b: Hidratada) => {
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
      sorter: (a: Hidratada, b: Hidratada) => {
        return a.cantidad - b.cantidad;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: '18em',
      render: (estado: string, a: Hidratada) => (
        <>
          {Object.keys(EstadoLinea).map((est) => (
            <EstadoProducto
              actual={estado as EstadoLinea}
              actualizar={actualizarLineas}
              estado={est as EstadoLinea}
              producto={a.producto}
              ordenID={ordenID}
            />
          ))}
        </>
      ),
      sorter: (a: Hidratada, b: Hidratada) => {
        return a.estado.localeCompare(b.estado);
      },
    },
  ];

  const onCambiarEstado = () => {
    if (!estado)
      throw Error(
        'debe estar definido el estado a cambiar para llamar este método'
      );
    setActualizando(true);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: Array<any>) => {
      setSelected(selectedRowKeys);
    },
    getCheckboxProps: (record: Hidratada) => ({
      name: record.productoId + '',
    }),
  };
  const handleChange = (e: EstadoLinea) => setEstado(e);

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
          Hay {formatNumber(lineas.length)} items
        </Col>
        <Col span={16} style={{ textAlign: 'right' }}>
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

      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        id="lineas"
        rowKey={(linea: Hidratada) => linea.productoId}
        className="lineas"
        dataSource={data}
        columns={columns as any}
        pagination={{ defaultPageSize: 100 }}
      />
    </div>
  );
}

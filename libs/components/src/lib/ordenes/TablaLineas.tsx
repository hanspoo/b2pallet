import { Button, Select, Space, Spin, Table } from 'antd';

import { useEffect, useState } from 'react';
import Search from 'antd/lib/input/Search';
import { LineaDetalle, Local, OrdenCompra, Producto } from '@flash-ws/dao';
import { formatNumber } from '../front-utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircleOutlined,
  PauseOutlined,
  QuestionOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { EstadoLinea } from '@flash-ws/api-interfaces';
import axios from 'axios';

export interface TablaLineasProps {
  lineas: LineaDetalle[];
  orden: OrdenCompra;
}

const { Option } = Select;
export function TablaLineas({ lineas, orden }: TablaLineasProps) {
  const [search, setSearch] = useState<RegExp>();
  const [data, setData] = useState<Array<LineaDetalle>>();
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState<EstadoLinea>();
  const [actualizando, setActualizando] = useState(false);
  const [selected, setSelected] = useState<Array<number>>([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const productos = queryClient.getQueryData<Array<Producto>>([
      'productos',
    ]) as any;
    const locales = queryClient.getQueryData<Array<Local>>(['locales']) as any;

    function findProd(id: number): Producto | undefined {
      return productos.find((p: Producto) => p.id === id);
    }

    function findLocal(id: number): Local | undefined {
      return locales.find((p: Local) => p.id === id);
    }

    const hidratadas = lineas.map((linea) => ({
      ...linea,
      producto: findProd(linea.productoId || -1)!,
      local: findLocal(linea.localId || -1)!,
    }));

    setData(hidratadas);
    setLoading(false);
  }, [lineas, queryClient]);

  if (loading) return <Spin />;

  const columns = [
    {
      title: 'E',
      dataIndex: 'estado',
      width: 24,
      render: (estado: EstadoLinea) => {
        switch (estado) {
          case EstadoLinea.Aprobada:
            return <CheckCircleOutlined style={{ color: 'green' }} />;
          case EstadoLinea.Nada:
            return <QuestionOutlined style={{ color: 'gray' }} />;
          case EstadoLinea.Pendiente:
            return <PauseOutlined style={{ color: 'orange' }} />;
          case EstadoLinea.Rechazada:
            return <StopOutlined style={{ color: 'pink' }} />;
          default:
            return <p>Error</p>;
        }
      },
      sorter: (a: LineaDetalle, b: LineaDetalle) => {
        return a.estado.localeCompare(b.estado);
      },
    },
    {
      title: 'Producto',
      dataIndex: 'producto',
      render: (p: Producto) => {
        return p ? p.nombre : 'No encontrado';
      },
    },
    {
      title: 'Local',
      dataIndex: 'local',
      render: (p: Local) => {
        return p ? p.nombre : 'No encontrado';
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      sorter: (a: LineaDetalle, b: LineaDetalle) => {
        return a.cantidad - b.cantidad;
      },
    },
  ];

  function onSearch(e: any) {
    const regex = new RegExp(e.target.value, 'i');
    setSearch(regex);
  }
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: LineaDetalle[]) => {
      setSelected(selectedRowKeys);
    },
    getCheckboxProps: (record: LineaDetalle) => ({
      name: record.id + '',
    }),
  };

  const handleChange = (e: EstadoLinea) => setEstado(e);
  const onCambiarEstado = () => {
    setActualizando(true);
    axios
      .post<OrdenCompra>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/cambiar-estado/${orden.id}`,
        selected
      )
      .then((response) => {
        console.log(response.data);
        setActualizando(false);
      })
      .catch((error) => {
        console.log(error);
        setActualizando(false);
      });
  };

  return (
    <div>
      <p>Hay {formatNumber(lineas.length)} items</p>
      <div style={{ marginBottom: '0.5em' }}>
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
      </div>
      <Search
        style={{ marginBottom: '0.5em' }}
        placeholder="buscar..."
        onKeyUp={onSearch}
        enterButton
      />
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        id="lineas"
        rowKey={(linea: LineaDetalle) => linea.id}
        className="lineas"
        dataSource={data}
        columns={columns}
        pagination={{ defaultPageSize: 100 }}
      />
    </div>
  );
}

export default TablaLineas;

import { Button, Col, Input, Row, Select, Spin, Table } from 'antd';

import { useEffect, useState } from 'react';

import {
  ILineaDetalle,
  ILocal,
  IOrdenCompra,
  IProducto,
} from '@flash-ws/api-interfaces';
import { formatNumber } from '../front-utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircleOutlined,
  PauseOutlined,
  QuestionOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { CambiarEstadoBody, EstadoLinea } from '@flash-ws/api-interfaces';
import axios from 'axios';

export interface TablaLineasProps {
  orden: IOrdenCompra;
  recargar(orden: IOrdenCompra): void;
}

const { Option } = Select;
export function TablaLineas({ orden, recargar }: TablaLineasProps) {
  const [search, setSearch] = useState<string>('');
  const [data, setData] = useState<Array<ILineaDetalle>>();
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState<EstadoLinea>();
  const [actualizando, setActualizando] = useState(false);
  const [selected, setSelected] = useState<Array<number>>([]);

  const queryClient = useQueryClient();

  const lineas = orden.lineas;

  useEffect(() => {
    const productos = queryClient.getQueryData<Array<IProducto>>([
      'productos',
    ]) as Array<IProducto>;
    const locales = queryClient.getQueryData<Array<ILocal>>(['locales']) as any;

    function findProd(id: number): IProducto | undefined {
      return productos.find((p: IProducto) => p.id === id);
    }

    function findLocal(id: number): ILocal | undefined {
      return locales.find((p: ILocal) => p.id === id);
    }

    const hidratadas = lineas.map((linea) => {
      const producto = linea.productoId
        ? findProd(linea.productoId)
        : undefined;
      const local = linea.localId ? findLocal(linea.localId) : undefined;
      if (!(producto && local)) throw Error(`producto o local no encontrado`);
      return {
        ...linea,
        producto,
        local,
      };
    });

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
            return <StopOutlined style={{ color: 'red' }} />;
          default:
            return <p>Error</p>;
        }
      },
      sorter: (a: ILineaDetalle, b: ILineaDetalle) => {
        return a.estado.localeCompare(b.estado);
      },
    },
    {
      title: 'Código',
      dataIndex: 'producto',
      width: '10em',
      render: (p: IProducto) => {
        return p ? p.codigo : 'N/A';
      },
    },
    {
      title: 'CodCenco',
      dataIndex: 'producto',
      width: '10em',
      render: (p: IProducto) => {
        return p ? p.codCenco : 'N/A';
      },
    },
    {
      title: 'IProducto',
      dataIndex: 'producto',
      filteredValue: [search],
      onFilter: (value: string, record: ILineaDetalle) => {
        if (!value) return true;

        const regex = new RegExp(value, 'i');
        return (
          regex.test(record.producto?.nombre) ||
          regex.test(record.local?.nombre)
        );
      },

      render: (p: IProducto) => {
        return p ? p.nombre : 'No encontrado';
      },
    },
    {
      title: 'ILocal',
      dataIndex: 'local',
      render: (p: ILocal) => {
        return p ? p.nombre : 'No encontrado';
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      width: '10em',
      sorter: (a: ILineaDetalle, b: ILineaDetalle) => {
        return a.cantidad - b.cantidad;
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: Array<any>, selectedRows: ILineaDetalle[]) => {
      setSelected(selectedRowKeys);
    },
    getCheckboxProps: (record: ILineaDetalle) => ({
      name: record.id + '',
    }),
  };

  const handleChange = (e: EstadoLinea) => setEstado(e);
  const onCambiarEstado = () => {
    console.log('onCambiarEstado tabla lineas');

    if (!estado)
      throw Error(
        'debe estar definido el estado a cambiar para llamar este método'
      );
    setActualizando(true);
    const postBody: CambiarEstadoBody = {
      ids: selected,
      estado: estado,
    };
    axios
      .post<IOrdenCompra>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/cambiar-estado/${orden.id}`,
        postBody
      )
      .then((response) => {
        console.log(response.data);
        setActualizando(false);
        recargar(response.data);
      })
      .catch((error) => {
        console.log(error);
        setActualizando(false);
      });
  };

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
          hay {formatNumber(lineas.length)} items
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
        rowKey={(linea: ILineaDetalle) => linea.id}
        className="lineas"
        dataSource={data}
        columns={columns as any}
        pagination={{ defaultPageSize: 100 }}
      />
    </div>
  );
}

export default TablaLineas;

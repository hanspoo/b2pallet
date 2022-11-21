import {
  EstadoLinea,
  ILineaDetalle,
  ILocal,
  IOrdenCompra,
  IPallet,
  IPalletConsolidado,
} from '@flash-ws/api-interfaces';
import { capitalize } from '@flash-ws/shared';

import { Button, Form, Input, Radio, Select, Spin, Table } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import PalletsIcono from '../pallets-icono/pallets-icono';
import Pallets from '../pallets/pallets';
import styles from './pallets-generator.module.css';
import { useLocal } from './useLocal';

/* eslint-disable-next-line */
export interface PalletsGeneratorProps {
  orden: IOrdenCompra;
}

type LocalEntry = {
  local: ILocal;
  lineas: ILineaDetalle[];
};

type PorLocal = Array<LocalEntry>;
enum VistaPallets {
  ICONO = 'ICONO',
  TABLA = 'TABLA',
  ARBOL = 'ARBOL',
}
export function PalletsGenerator({ orden }: PalletsGeneratorProps) {
  const [vistaPallets, setVistaPallets] = useState<VistaPallets>(
    VistaPallets.ICONO
  );
  const [loading, setLoading] = useState(true);
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [error, setError] = useState('');
  const [pallets, setPallets] = useState<IPalletConsolidado[]>();

  useEffect(() => {
    setLoading(true);
    const url = `${process.env['NX_SERVER_URL']}/api/ordenes/${orden.id}/pallets-cons`;
    axios
      .get<IPalletConsolidado[]>(url)
      .then((response) => {
        setPallets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(JSON.stringify(error));
        setLoading(false);
      });
  }, [orden]);

  if (loading) return <Spin />;
  if (error) return <p>{error}</p>;
  if (!pallets) return <p>Error interno al recuperar los pallets</p>;

  if (pallets.length === 0 || mostrarGenerador) {
    return (
      <PalletsGeneratorImpl
        orden={orden}
        setPallets={(pallets) => {
          setPallets(pallets);
          setMostrarGenerador(false);
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1em' }}>
        <SelectorVistaPallets vista={vistaPallets} setVista={setVistaPallets} />
        <Button
          style={{ float: 'right' }}
          onClick={() => setMostrarGenerador(true)}
        >
          Generar de nuevo
        </Button>
      </div>

      {vistaPallets === VistaPallets.TABLA && <Pallets pallets={pallets} />}
      {vistaPallets === VistaPallets.ICONO && (
        <PalletsIcono pallets={pallets} />
      )}
    </div>
  );
}

type PalletsGeneratorImplProps = {
  orden: IOrdenCompra;
  setPallets: (pallets: IPalletConsolidado[]) => void;
};
function PalletsGeneratorImpl({
  orden,
  setPallets,
}: PalletsGeneratorImplProps) {
  const [nextHU, setNextHU] = useState('');
  const [generando, setGenerando] = useState(false);
  const [errorGenerando, setErrorGenerando] = useState('');
  // const [pallets, setPallets] = useState<IPallet[]>([]);
  const aprobadas = orden.lineas.filter(
    (linea) => linea.estado === EstadoLinea.Aprobada
  );
  const [loading, lineas] = useLocal(aprobadas);
  if (loading) return <p>Cargando...</p>;
  if (!lineas) return <p>Error..</p>;

  const INIT: PorLocal = [];
  const porLocal: PorLocal = lineas.reduce((acc, iter) => {
    const ele = acc.find((rec) => rec.local.id === iter.localId);
    if (ele) {
      ele.lineas.push(iter);
    } else {
      acc.push({ local: iter.local, lineas: [iter] });
    }
    return acc;
  }, INIT);
  const ordenadas = porLocal.sort((a, b) =>
    a.local.nombre.toLowerCase().localeCompare(b.local.nombre.toLowerCase())
  );

  const columns = [
    {
      title: 'Local',
      dataIndex: 'local',
      key: 'nombre',

      render: (local: ILocal) => local.nombre,
      sorter: (a: LocalEntry, b: LocalEntry) => {
        return a.local.nombre
          .toLocaleLowerCase()
          .localeCompare(b.local.nombre.toLocaleLowerCase());
      },
    },
    {
      title: 'Productos',
      dataIndex: 'lineas',
      align: 'right' as any,
      width: '5em',
      render: (lineas: Array<ILineaDetalle>) => lineas.length,
      sorter: (a: LocalEntry, b: LocalEntry) => {
        return a.lineas.length - b.lineas.length;
      },
    },
  ];

  function generarPallets() {
    setGenerando(true);
    axios
      .post<IPalletConsolidado[]>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/${orden.id}/gen-pallets`,
        {
          protoID: 1,
        }
      )
      .then((response) => {
        setPallets(response.data);
        setGenerando(false);
      })
      .catch((error) => {
        setErrorGenerando(error.message);
        setGenerando(false);
      });
  }

  if (errorGenerando) return <p>{errorGenerando}</p>;

  const numProductos = aprobadas.reduce((acc, iter) => {
    return acc + iter.cantidad;
  }, 0);
  return (
    <div className={styles['container']}>
      <p>
        Se generará la distribución en pallets por local para todos los
        productos aprobados.
      </p>
      <p>
        <b>{ordenadas.length}</b> locales, <b>{numProductos}</b> unidades.
      </p>
      {generando && <Spin />}

      {!generando && (
        <span>
          <Form layout="vertical">
            <Form.Item label="Próxima HU" name="tipoHU">
              <Radio.Group>
                <Radio value="horizontal">Automática</Radio>
                <br />
                <Radio value="vertical">Especificar</Radio>
                <Input placeholder="HU" />
              </Radio.Group>
            </Form.Item>

            <Button
              type="primary"
              style={{ marginBottom: '1em' }}
              onClick={generarPallets}
            >
              Comenzar
            </Button>
          </Form>
          <Table
            dataSource={ordenadas}
            columns={columns}
            pagination={{ pageSize: 10000 }}
          />
        </span>
      )}
    </div>
  );
}

export default PalletsGenerator;

type SelectorVistaPalletsProps = {
  vista: VistaPallets;
  setVista: (vista: VistaPallets) => void;
};
function SelectorVistaPallets({ vista, setVista }: SelectorVistaPalletsProps) {
  return (
    <Radio.Group value={vista} onChange={(e) => setVista(e.target.value)}>
      {Object.keys(VistaPallets).map((v) => (
        <Radio.Button value={v}>{capitalize(v)}</Radio.Button>
      ))}
    </Radio.Group>
  );
}

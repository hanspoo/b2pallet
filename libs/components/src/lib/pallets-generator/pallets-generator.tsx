import {
  EstadoLinea,
  ILineaDetalle,
  ILocal,
  IOrdenCompra,
  IPallet,
} from '@flash-ws/api-interfaces';

import { Button, Spin, Table } from 'antd';
import axios from 'axios';
import { useState } from 'react';
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

export function PalletsGenerator({ orden }: PalletsGeneratorProps) {
  const [generando, setGenerando] = useState(false);
  const [errorGenerando, setErrorGenerando] = useState('');
  const [pallets, setPallets] = useState<IPallet[]>([]);
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
      .post<IOrdenCompra>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/${orden.id}/gen-pallets`,
        {
          protoID: 1,
        }
      )
      .then((response) => {
        setPallets(response.data.pallets);
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
      {!generando && pallets && <PalletsTable pallets={pallets} />}
      {!generando && (
        <span>
          <Button
            type="primary"
            style={{ marginBottom: '1em' }}
            onClick={generarPallets}
          >
            Comenzar
          </Button>
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

function PalletsTable({ pallets }: { pallets: Array<IPallet> }) {
  return (
    <>
      {pallets.map((p) => (
        <li>{p.cajas.length}</li>
      ))}
    </>
  );
}

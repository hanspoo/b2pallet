import {
  Distribuir,
  ILineaDetalle,
  ILocal,
  IOrdenCompra,
  IPalletConsolidado,
  IProtoPallet,
  Ordenar,
  TipoHU,
} from '@flash-ws/api-interfaces';
import { capitalize } from '@flash-ws/shared';

import { Button, Radio, Spin } from 'antd';
import { useEffect, useState } from 'react';
import PalletsIcono from '../pallets-icono/pallets-icono';
import Pallets from '../pallets/pallets';
import { useHttpClient } from '../useHttpClient';
import { PalletsGeneratorImpl } from './PalletsGeneratorImpl';

/* eslint-disable-next-line */
export interface PalletsGeneratorProps {
  orden: IOrdenCompra;
}

export interface OpcionesGenPallets {
  distribuir: Distribuir;
  ordenar: Ordenar;
  tipoHU: TipoHU;
  nextHU: number;
  protoPallets: IProtoPallet[];
}
export type LocalEntry = {
  local: ILocal;
  lineas: ILineaDetalle[];
};

export type PorLocal = Array<LocalEntry>;
enum VistaPallets {
  ICONO = 'ICONO',
  TABLA = 'TABLA',
  // ARBOL = 'ARBOL',
}
export function PalletsGenerator({ orden }: PalletsGeneratorProps) {
  const httpClient = useHttpClient()
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
    httpClient
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
          setPallets(pallets || []);
          setMostrarGenerador(false);
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5em', marginTop: '1.5em' }}>
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

export type PalletsGeneratorImplProps = {
  orden: IOrdenCompra;
  setPallets: (pallets: IPalletConsolidado[]) => void;
};
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

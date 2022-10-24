import {
  BodyCambioEstadoProdConsolidada,
  CambiarEstadoBody,
  EstadoLinea,
} from '@flash-ws/api-interfaces';
import { OrdenCompra, Producto } from '@flash-ws/dao';
import { Button, Spin } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { colores, estados } from '../front-utils';
import { ILineaConsolidada } from './datos';

type PropsEstadoProducto = {
  actual: EstadoLinea;
  estado: EstadoLinea;
  ordenID: number;
  lineaID: number;
  editar: boolean;
  actualizar: (estado: EstadoLinea) => void;
};
export function EstadoUnitario({
  editar = true,
  estado,
  actualizar,
  lineaID,
  ordenID,
  actual,
}: PropsEstadoProducto) {
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const onCambiarEstado = () => {
    if (!estado)
      throw Error(
        'debe estar definido el estado a cambiar para llamar este método'
      );
    setActualizando(true);
    const postBody: CambiarEstadoBody = {
      ids: [lineaID],
      estado: estado,
    };
    axios
      .post<OrdenCompra>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/cambiar-estado/${ordenID}`,
        postBody
      )
      .then((response) => {
        console.log(response.data);
        setActualizando(false);
        actualizar(estado);
      })
      .catch((error) => {
        console.log(error);
        setActualizando(false);
      });
  };

  if (actualizando) return <Spin />;
  if (error) return <p>{error}</p>;

  if (!editar)
    return React.createElement(estados[estado], {
      style: { color: colores[estado] },
    });

  return (
    <Button
      shape="default"
      type={estado === actual ? 'primary' : 'default'}
      onClick={() => onCambiarEstado()}
      style={{ marginRight: '0.5em' }}
      icon={React.createElement(estados[estado])}
    />
  );
}

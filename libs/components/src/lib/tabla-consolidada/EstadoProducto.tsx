import {
  BodyCambioEstadoProdConsolidada,
  EstadoLinea,
} from '@flash-ws/api-interfaces';
import { Producto } from '@flash-ws/dao';
import { Button, Spin } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { estados, colores } from '../front-utils';
import { ILineaConsolidada } from './datos';

type PropsEstadoProducto = {
  actual: EstadoLinea;
  estado: EstadoLinea;
  producto: Producto;
  ordenID: number;
  editar: boolean;
  actualizar: (lineas: any) => void;
};
export function EstadoProducto({
  editar = true,
  estado,
  producto,
  actualizar,
  ordenID,
  actual,
}: PropsEstadoProducto) {
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const onCambiarEstado = () => {
    setActualizando(true);
    const postBody: BodyCambioEstadoProdConsolidada = {
      productoID: producto.id,
      estado: estado,
    };
    axios
      .post<Array<ILineaConsolidada>>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/cambiar-estado-consolidada/${ordenID}`,
        postBody
      )
      .then((response) => {
        setActualizando(false);
        actualizar(response.data);
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
      title={estado}
      type={estado === actual ? 'primary' : 'default'}
      onClick={() =>
        estado === EstadoLinea.Multiple
          ? console.log('no se puede clickear')
          : onCambiarEstado()
      }
      style={{ marginRight: '0.5em' }}
      icon={React.createElement(estados[estado])}
    />
  );
}

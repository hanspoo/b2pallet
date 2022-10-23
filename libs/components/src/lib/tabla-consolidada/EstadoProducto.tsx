import {
  QuestionOutlined,
  CheckOutlined,
  CloseOutlined,
  PauseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  BodyCambioEstadoProdConsolidada,
  CambiarEstadoBody,
  EstadoLinea,
} from '@flash-ws/api-interfaces';
import { OrdenCompra, Producto } from '@flash-ws/dao';
import { Button, Spin } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { ILineaConsolidada } from './datos';

const estados: Record<string, any> = {
  Nada: QuestionOutlined,
  Aprobada: CheckOutlined,
  Rechazada: CloseOutlined,
  Pendiente: PauseOutlined,
  Multiple: WarningOutlined,
};

type PropsEstadoProducto = {
  actual: EstadoLinea;
  estado: EstadoLinea;
  producto: Producto;
  ordenID: number;
  actualizar: (lineas: any) => void;
};
export function EstadoProducto({
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

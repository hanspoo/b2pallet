import React, { useState } from 'react';
import axios from 'axios';
import { Button, Select, Spin } from 'antd';
import {
  IArchivo,
  IOrdenCompra,
  IUnidadNegocio,
  SubirOrdenBody,
} from '@flash-ws/api-interfaces';
import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';
import { MostrarErrores } from './MostrarErrores';
import { AntUploader } from '../ant-uploader/ant-uploader';
import { actualizarOrden } from '@flash-ws/reductor';
import { useDispatch } from 'react-redux';

import Title from 'antd/lib/typography/Title';

const { Option } = Select;

const UploadOrden = () => {
  const [unidades, setunidades] = React.useState<IUnidadNegocio[]>();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios
      .get<IUnidadNegocio[]>(`${process.env['NX_SERVER_URL']}/api/unidades`)
      .then((response) => {
        setunidades(response.data);
        setLoading(false);
      })
      .catch((ex) => {
        const error = axios.isCancel(ex)
          ? 'Request Cancelled'
          : ex.code === 'ECONNABORTED'
          ? 'A timeout has occurred'
          : ex.response.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occurred';

        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spin />;
  if (error) return <p>Error: {error}</p>;
  if (!unidades) return <p>Estado inválido no hay unidades</p>;

  return <UploadOrdenReally unidades={unidades} />;
};
type UploadOrdenReallyArgs = {
  unidades: IUnidadNegocio[];
};

const UploadOrdenReally = ({ unidades }: UploadOrdenReallyArgs) => {
  const dispatch = useDispatch();
  const [archivo, setArchivo] = useState<IArchivo>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OrdenesResponseInvalid>();
  const [ordenes, setOrdenes] = useState<number[]>();
  const [unidad, setUnidad] = useState<number>();

  const handleSubmit = async (event: any) => {
    if (!unidad) throw Error('No está definida la unidad de negocio');
    if (!archivo) throw Error('No está definido el archivo');

    setLoading(true);
    event.preventDefault();
    const params: SubirOrdenBody = {
      idUnidad: unidad,
      idArchivo: archivo.id,
    };
    axios
      .post<IOrdenCompra>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/subir`,
        params
      )
      .then((response) => {
        const ordenes = response.data as any as Array<number>;
        setOrdenes(ordenes);
        setLoading(false);
      })
      .catch((error) => {
        const errorPayload = error.response.data as OrdenesResponseInvalid;
        setError(errorPayload);
        setLoading(false);
      });
  };

  if (loading) return <Spin />;
  if (error) {
    const { msg, ordenesDuplicadas, productosNoEncontrados } = error;

    return (
      <>
        <p>{msg}</p>
        <MostrarErrores
          title="Productos no encontrados"
          list={productosNoEncontrados || []}
        />
        <MostrarErrores
          title="Ordenes de compra duplicadas"
          list={ordenesDuplicadas || []}
        />
      </>
    );
  }
  if (ordenes) {
    if (ordenes.length===1)
    return <p>Se agregó una orden de compra</p>
    return <p>Se agregaron {ordenes.length} ordenes de compra.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Title level={3}>Subir ordenes de compra</Title>
      <div style={{ marginBottom: '1.5em' }}>
        <label style={{ display: 'block', marginBottom: '0.5em' }}>
          Unidad de negocio
        </label>

        <Select
          style={{ width: 240 }}
          value={unidad}
          onChange={setUnidad}
          showSearch
          placeholder="Seleccione la unidad de negocio"
        >
          {unidades.map((IUnidadNegocio) => (
            <Option value={IUnidadNegocio.id}>{IUnidadNegocio.nombre}</Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: '2em' }}>
        <label style={{ display: 'block', marginBottom: '0.5em' }}>
          Planilla excel del b2b
        </label>

        <AntUploader onFileSelected={setArchivo} />
      </div>

      <Button type="primary" htmlType="submit" disabled={!(unidad && archivo)}>
        Enviar
      </Button>
    </form>
  );
};

export { UploadOrden };

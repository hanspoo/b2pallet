import React, { useState } from 'react';
import axios from 'axios';
import { Button, Divider, Select, Spin } from 'antd';
import { UnidadNegocio } from '@flash-ws/dao';
import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';

const { Option } = Select;
type UploadResponse = {
  msg: string;
};

const UploadOrden = () => {
  const [unidades, setunidades] = React.useState<UnidadNegocio[]>();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios
      .get<UnidadNegocio[]>(`${process.env.NX_SERVER_URL}/api/unidades`)
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
  unidades: UnidadNegocio[];
};

const UploadOrdenReally = ({ unidades }: UploadOrdenReallyArgs) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OrdenesResponseInvalid>();
  const [data, setData] = useState<UploadResponse>();
  const [unidad, setUnidad] = useState<UnidadNegocio>();
  const [file, setFile] = React.useState('');
  const [invalidos, setInvalidos] = React.useState<Array<string>>();

  const handleSubmit = async (event: any) => {
    if (!unidad) throw Error('No está definida la orden');

    setLoading(true);
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unidad', unidad + '');
    axios({
      method: 'post',
      url: '/api/ordenes/masivo',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        const errorPayload = error.response.data as OrdenesResponseInvalid;
        setError(errorPayload);
        setLoading(false);
      });
  };

  const handleFileSelect = (event: any) => {
    setFile(event.target.files[0]);
  };

  if (loading) return <Spin />;
  if (error) {
    return (
      <>
        <p>{error.msg}</p>
        {error.invalidos.map((s) => (
          <p>{s}</p>
        ))}
      </>
    );
  }
  if (data) return <p>{data.msg}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '0.5em' }}>
        <label>UnidadNegocio</label>
        <div>
          <Select
            style={{ width: 240 }}
            value={unidad}
            onChange={setUnidad}
            showSearch
            placeholder="Seleccione la unidad de negocio"
          >
            {unidades.map((UnidadNegocio) => (
              <Option value={UnidadNegocio.id}>{UnidadNegocio.nombre}</Option>
            ))}
          </Select>
        </div>
      </div>

      <div style={{ marginBottom: '1em' }}>
        <label>Planilla Excel</label>

        <div>
          <input
            className="ant input"
            type="file"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <Button type="primary" htmlType="submit" disabled={!(unidad && file)}>
        Enviar
      </Button>
    </form>
  );
};

export { UploadOrden };

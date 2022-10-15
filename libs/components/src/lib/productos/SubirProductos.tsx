import { Button, message, Upload } from 'antd';

import { UploadOutlined } from '@ant-design/icons';

const SubirProductos = () => {
  const props = {
    name: 'file',
    action: `${process.env['NX_SERVER_URL']}/api/productos/masivo`,
    headers: {
      authorization: 'authorization-text',
    },

    onChange(info: any) {
      if (info.file.status !== 'uploading') {
      }

      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Actualizar desde excel</Button>
      </Upload>
    </>
  );
};

export { SubirProductos };

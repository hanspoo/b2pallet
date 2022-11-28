import {
  FilePdfOutlined,
  FileOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { IArchivo } from '@flash-ws/api-interfaces';
import { List, Avatar } from 'antd';
import React from 'react';
import { formatNumber } from '../front-utils';
import styles from './archivo-component.module.css';

/* eslint-disable-next-line */
export interface ArchivoComponentProps {
  archivo: IArchivo;
}

const icons: Record<string, any> = {
  'application/pdf': FilePdfOutlined,
  'application/vnd.ms-excel': FileExcelOutlined,
};
const defaultIcon = FileOutlined;

export function ArchivoComponent({ archivo }: ArchivoComponentProps) {
  const component = icons[archivo.mimetype] || defaultIcon;
  return (
    <List
      dataSource={[archivo]}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <List.Item.Meta
            avatar={React.createElement(component, {
              style: { fontSize: '36px' },
            })}
            title={archivo.originalname}
            description={formatNumber(item.size)}
          />
        </List.Item>
      )}
    />
  );
}

export default ArchivoComponent;

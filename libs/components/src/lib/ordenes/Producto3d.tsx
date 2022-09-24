import { Producto } from '@flash-ws/dao';

export function Producto3d({ p }: { p: Producto }) {
  let volumen = 1;
  const { largo, ancho, alto } = p.box;

  if (p) volumen = (largo * ancho * alto) / 1000000;

  return (
    <div
      title={p.nombre}
      className="caja"
      style={{
        backgroundColor: volumen === 1 ? 'red' : `rgb(0,${p.peso / 50},0)`,
        width: volumen,
        height: volumen,
      }}
    ></div>
  );
}

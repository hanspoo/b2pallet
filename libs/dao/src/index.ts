export * from './lib/dao';
export * from './lib/data-source';

export * from './lib/entity/local.entity';
export * from './lib/entity/linea-detalle.entity';
export * from './lib/entity/unidad-negocio.entity';
export * from './lib/entity/cliente.entity';
export * from './lib/entity/user.entity';
export * from './lib/entity/orden-compra.entity';
export * from './lib/entity/pedido.entity';

export * from './lib/entity/producto.entity';
export * from './lib/entity/box.entity';
export * from './lib/inicializarCencosud';

// Genera imports
// find ./lib/entity/ -type f |perl -ane 'print qq#export * from "$F[0]"\n#' |sed s/\.ts//

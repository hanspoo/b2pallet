import { render } from '@testing-library/react';

import LineasDetalle from './lineas-detalle';

describe('LineasDetalle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LineasDetalle />);
    expect(baseElement).toBeTruthy();
  });
});

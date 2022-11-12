import { render } from '@testing-library/react';

import ListaCajasPallet from './lista-cajas-pallet';

describe('ListaCajasPallet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ListaCajasPallet />);
    expect(baseElement).toBeTruthy();
  });
});

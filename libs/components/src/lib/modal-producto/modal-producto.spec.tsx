import { render } from '@testing-library/react';

import ModalProducto from './modal-producto';

describe('ModalProducto', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalProducto />);
    expect(baseElement).toBeTruthy();
  });
});

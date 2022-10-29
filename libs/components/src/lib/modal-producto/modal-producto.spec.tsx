import { render } from '@testing-library/react';

import ModalIProducto from './modal-producto';

describe('ModalIProducto', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalIProducto />);
    expect(baseElement).toBeTruthy();
  });
});

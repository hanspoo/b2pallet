import { render } from '@testing-library/react';

import Productos from './productos';

describe('Productos', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Productos />);
    expect(baseElement).toBeTruthy();
  });
});

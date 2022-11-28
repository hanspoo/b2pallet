import { render } from '@testing-library/react';

import ArchivoComponent from './archivo-component';

describe('ArchivoComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ArchivoComponent />);
    expect(baseElement).toBeTruthy();
  });
});

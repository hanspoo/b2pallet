import { render } from '@testing-library/react';

import Ordenes from './ordenes';

describe('Ordenes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Ordenes />);
    expect(baseElement).toBeTruthy();
  });
});

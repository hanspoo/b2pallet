import { render } from '@testing-library/react';

import AvanceEstado from './avance-estado';

describe('AvanceEstado', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AvanceEstado />);
    expect(baseElement).toBeTruthy();
  });
});

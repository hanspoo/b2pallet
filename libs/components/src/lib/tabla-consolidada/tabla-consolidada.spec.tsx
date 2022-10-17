import { render } from '@testing-library/react';

import TablaConsolidada from './tabla-consolidada';

describe('TablaConsolidada', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TablaConsolidada />);
    expect(baseElement).toBeTruthy();
  });
});

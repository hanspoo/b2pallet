import { render } from '@testing-library/react';

import OrdenesConsolidadas from './ordenes-consolidadas';

describe('OrdenesConsolidadas', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrdenesConsolidadas />);
    expect(baseElement).toBeTruthy();
  });
});

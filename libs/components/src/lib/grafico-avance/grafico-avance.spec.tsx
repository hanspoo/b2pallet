import { render } from '@testing-library/react';

import GraficoAvance from './grafico-avance';

describe('GraficoAvance', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GraficoAvance />);
    expect(baseElement).toBeTruthy();
  });
});

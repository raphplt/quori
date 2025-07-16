import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateProvider } from '../contexts/GenerateContext';
import TemplateSelector from '../components/TemplateSelector';
import { vi } from 'vitest';

vi.mock('../hooks/useAuthenticatedQuery', () => ({
  authenticatedFetcher: vi.fn().mockResolvedValue([
    { id: 1, name: 'Formel', description: 'A' },
    { id: 2, name: 'Tech', description: 'B' },
  ]),
}));

function Wrapper() {
  return (
    <GenerateProvider>
      <TemplateSelector />
    </GenerateProvider>
  );
}

describe('TemplateSelector', () => {
  it('selects template', async () => {
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Formel'));
    await userEvent.click(screen.getByText('Tech'));
    expect(screen.getByText('Tech').closest('button')).toHaveClass('border-primary');
  });
});

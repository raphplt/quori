import { render, screen } from '@testing-library/react';
import { LinkedInConnectButton } from '../components/LinkedInConnectButton';
import userEvent from '@testing-library/user-event';

describe('LinkedInConnectButton', () => {
  it('calls redirect when clicked', async () => {
    const original = window.location.href;
    delete (window as any).location;
    (window as any).location = { href: '' };
    render(<LinkedInConnectButton />);
    await userEvent.click(screen.getByRole('button'));
    expect(window.location.href).toContain('/auth/linkedin');
    (window as any).location = original as any;
  });
});

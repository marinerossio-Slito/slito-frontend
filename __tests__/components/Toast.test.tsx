import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast, type ToastType } from '@/components/Toast';

function ToastTrigger({ message, type }: { message: string; type?: ToastType }) {
  const { showToast } = useToast();

  return (
    <button type="button" onClick={() => showToast(message, type)}>
      Afficher
    </button>
  );
}

describe('ToastProvider / useToast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders its children', () => {
    render(
      <ToastProvider>
        <p>Contenu de la page</p>
      </ToastProvider>,
    );

    expect(screen.getByText('Contenu de la page')).toBeDefined();
  });

  it('shows an info toast by default with role="status"', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTrigger message="Information utile" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Afficher' }));

    const toast = screen.getByRole('status');
    expect(toast.textContent).toContain('Information utile');
    expect(toast.className).toContain('bg-warm-white');
  });

  it('shows a success toast with the success styling', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTrigger message="Tout est sauvegardé" type="success" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Afficher' }));

    const toast = screen.getByRole('status');
    expect(toast.textContent).toContain('Tout est sauvegardé');
    expect(toast.className).toContain('bg-emerald-50');
  });

  it('shows an error toast with the error styling', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTrigger message="Une erreur est survenue" type="error" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Afficher' }));

    const toast = screen.getByRole('status');
    expect(toast.textContent).toContain('Une erreur est survenue');
    expect(toast.className).toContain('bg-red-50');
  });

  it('dismisses a toast when its close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTrigger message="À fermer" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Afficher' }));
    expect(screen.getByRole('status').textContent).toContain('À fermer');

    await user.click(screen.getByRole('button', { name: 'Fermer la notification' }));

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('auto-dismisses a toast after the timeout', () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastTrigger message="Disparaît tout seul" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Afficher' }));
    expect(screen.getByRole('status').textContent).toContain('Disparaît tout seul');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('throws when used outside of a ToastProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/);

    consoleError.mockRestore();
  });
});

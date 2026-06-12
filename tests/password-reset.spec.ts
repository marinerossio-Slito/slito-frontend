import { test, expect } from '@playwright/test';

/**
 * Tests bout-en-bout pour le flux de réinitialisation de mot de passe.
 *
 * Comme `/connexion` et `/inscription` (cf. auth.spec.ts), ces pages sont des
 * Client Components purs et fonctionnent sans le serveur Symfony. Le test de
 * validation côté client (mots de passe différents) n'appelle d'ailleurs
 * jamais l'API : `PasswordResetConfirmForm` vérifie la correspondance avant
 * tout appel réseau.
 */

test.describe('Password reset request page (/mot-de-passe-oublie)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mot-de-passe-oublie');
  });

  test('shows the heading and the request form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Mot de passe oubli/i })).toBeVisible();
    await expect(page.getByLabel(/Adresse email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Envoyer le lien de réinitialisation/i })).toBeVisible();
  });

  test('shows a link back to the login page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Retour à la connexion/i })).toBeVisible();
  });
});

test.describe('Password reset confirmation page (/mot-de-passe-oublie/[token])', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mot-de-passe-oublie/test-token-123');
  });

  test('shows the heading and both password fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Nouveau mot de passe/i })).toBeVisible();
    await expect(page.getByLabel(/^Nouveau mot de passe/i)).toBeVisible();
    await expect(page.getByLabel(/Confirmer le mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Réinitialiser le mot de passe/i })).toBeVisible();
  });

  test('shows a client-side error when the two passwords do not match', async ({ page }) => {
    await page.getByLabel(/^Nouveau mot de passe/i).fill('motdepasse123');
    await page.getByLabel(/Confirmer le mot de passe/i).fill('autremotdepasse');
    await page.getByRole('button', { name: /Réinitialiser le mot de passe/i }).click();

    await expect(page.getByText('Les deux mots de passe ne correspondent pas.')).toBeVisible();
  });
});

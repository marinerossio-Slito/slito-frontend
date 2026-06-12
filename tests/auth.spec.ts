import { test, expect } from '@playwright/test';

/**
 * Tests bout-en-bout pour les pages d'authentification et la navigation.
 *
 * Ces pages sont des Client Components purs : elles n'appellent pas le
 * back-end au rendu initial. Elles fonctionnent donc sans le serveur Symfony.
 */

test.describe('Login page (/connexion)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connexion');
  });

  test('shows the login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Connexion/i })).toBeVisible();
    await expect(page.getByLabel(/Adresse email/i)).toBeVisible();
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Se connecter/i })).toBeVisible();
  });

  test('shows the "Mot de passe oublie" link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Mot de passe oubli/i })).toBeVisible();
  });

  test('shows the sign-up link', async ({ page }) => {
    // "Créer un compte" link at the bottom of the form (the footer also has
    // one, so scope the lookup to the main content to avoid ambiguity).
    await expect(page.getByRole('main').getByRole('link', { name: /Cr.er un compte/i })).toBeVisible();
  });

  test('focuses the email input on label click', async ({ page }) => {
    await page.getByLabel(/Adresse email/i).click();
    await expect(page.getByLabel(/Adresse email/i)).toBeFocused();
  });
});

test.describe('Registration page (/inscription)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inscription');
  });

  test('shows the registration heading and form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Cr.er un compte/i })).toBeVisible();
    await expect(page.getByLabel(/Adresse email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Cr.er mon compte/i })).toBeVisible();
  });

  test('shows the login link for existing users', async ({ page }) => {
    // "Déjà inscrit ? Se connecter" (the footer also has a "Se connecter"
    // link, so scope the lookup to the main content to avoid ambiguity).
    await expect(page.getByRole('main').getByRole('link', { name: /Se connecter/i })).toBeVisible();
  });
});

test.describe('Global navigation', () => {
  test('the Slito logo navigates to the home page', async ({ page }) => {
    await page.goto('/connexion');
    await page.getByRole('link', { name: 'Slito' }).click();
    await expect(page).toHaveURL('/');
  });

  test('shows a 404 page for unknown URLs', async ({ page }) => {
    await page.goto('/cette-page-nexiste-pas');
    // The h1 is "Page introuvable"; the aria-hidden <p> contains "404"
    await expect(page.getByRole('heading', { name: /Page introuvable/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Retour.+accueil/i })).toBeVisible();
  });
});

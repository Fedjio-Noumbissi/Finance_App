/**
 * Promotion automatique d'un compte administrateur.
 *
 * L'hebergeur ne dispose pas de la base locale : plutot que de modifier le
 * role a la main en SQL apres chaque deploiement, `ADMIN_EMAIL` designe le
 * compte qui recoit le role admin des sa premiere connexion. Les autres
 * comptes gardent le role par defaut, et un compte deja admin n'est jamais
 * retrograde.
 */
export function doitEtreAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!adminEmail || !email) {
    return false
  }

  return email.trim().toLowerCase() === adminEmail
}

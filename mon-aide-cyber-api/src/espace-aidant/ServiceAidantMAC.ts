import crypto from 'crypto';
import { EntrepotAidant } from './Aidant';
import { AidantDTO, ServiceAidant } from './ServiceAidant';

class ServiceAidantMAC implements ServiceAidant {
  constructor(private readonly entrepotAidant: EntrepotAidant) {}

  async rechercheParMail(mailAidant: string): Promise<AidantDTO | undefined> {
    return this.entrepotAidant
      .rechercheParEmail(mailAidant)
      .then((aidant) => ({
        identifiant: aidant.identifiant,
        email: aidant.email,
        nomUsage: this.formateLeNom(aidant.nomPrenom),
        ...(aidant.siret && { siret: aidant.siret }),
      }))
      .catch(() => undefined);
  }

  async parIdentifiant(
    identifiant: crypto.UUID
  ): Promise<AidantDTO | undefined> {
    return this.entrepotAidant
      .lis(identifiant)
      .then((aidant) => ({
        identifiant: aidant.identifiant,
        email: aidant.email,
        nomUsage: this.formateLeNom(aidant.nomPrenom),
        ...(aidant.siret && { siret: aidant.siret }),
      }))
      .catch(() => undefined);
  }

  private formateLeNom(nomPrenom: string): string {
    const [prenom, nom] = nomPrenom.split(' ');
    return `${prenom} ${nom ? `${nom[0]}.` : ''}`.trim();
  }
}

export const unServiceAidant = (
  entrepotAidant: EntrepotAidant
): ServiceAidant => new ServiceAidantMAC(entrepotAidant);

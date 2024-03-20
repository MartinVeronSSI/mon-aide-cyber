import { BusCommande, CapteurSaga, Saga } from '../domaine/commande';
import { Entrepots } from '../domaine/Entrepots';
import { BusEvenement } from '../domaine/BusEvenement';
import { FournisseurHorloge } from '../infrastructure/horloge/FournisseurHorloge';
import { CommandeRechercheAideParEmail } from '../aide/CapteurCommandeRechercheAideParEmail';

export type SagaDemandeValidationCGUAide = Saga & {
  cguValidees: boolean;
  email: string;
  departement: string;
  raisonSociale?: string;
};

export class CapteurSagaDemandeValidationCGUAide
  implements CapteurSaga<SagaDemandeValidationCGUAide, void>
{
  constructor(
    private readonly entrepots: Entrepots,
    private readonly busCommande: BusCommande,
    _busEvenement: BusEvenement
  ) {}

  async execute(saga: SagaDemandeValidationCGUAide): Promise<void> {
    const aide = await this.busCommande.publie({
      type: 'CommandeRechercheAideParEmail',
      email: saga.email,
    } as CommandeRechercheAideParEmail);

    if (aide) {
      return Promise.resolve();
    }

    return this.entrepots.aides().persiste({
      dateSignatureCGU: FournisseurHorloge.maintenant(),
      departement: saga.departement,
      email: saga.email,
      identifiant: crypto.randomUUID(),
      ...(saga.raisonSociale && { raisonSociale: saga.raisonSociale }),
    });
  }
}
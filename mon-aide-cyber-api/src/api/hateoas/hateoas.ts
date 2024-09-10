import { AidantAuthentifie } from '../../authentification/Aidant';
import crypto from 'crypto';

type Methode = 'DELETE' | 'GET' | 'POST' | 'PATCH';
export type LiensHATEOAS = Record<string, Options>;
export type ReponseHATEOAS = {
  liens: LiensHATEOAS;
};

type Options = { url: string; methode?: Methode; contentType?: string };

class ConstructeurActionsHATEOAS {
  private readonly actions: Map<string, Options> = new Map();

  lancerDiagnostic(): ConstructeurActionsHATEOAS {
    this.actions.set('lancer-diagnostic', {
      url: '/api/diagnostic',
      methode: 'POST',
    });
    this.afficherTableauDeBord();
    return this;
  }

  private afficherTableauDeBord() {
    this.actions.set('afficher-tableau-de-bord', {
      url: '/api/espace-aidant/tableau-de-bord',
      methode: 'GET',
    });
  }

  postAuthentification(
    aidantAuthentifie: AidantAuthentifie
  ): ConstructeurActionsHATEOAS {
    if (!aidantAuthentifie.dateSignatureCGU) {
      return this.creerEspaceAidant();
    }

    return this.lancerDiagnostic().afficherProfil();
  }

  afficherProfil(): ConstructeurActionsHATEOAS {
    this.actions.set('afficher-profil', {
      url: '/api/profil',
      methode: 'GET',
    });

    return this;
  }

  creerEspaceAidant(): ConstructeurActionsHATEOAS {
    this.actions.set('creer-espace-aidant', {
      url: '/api/espace-aidant/cree',
      methode: 'POST',
    });
    return this;
  }
  restituerDiagnostic(idDiagnostic: string): ConstructeurActionsHATEOAS {
    this.actions.set('restitution-pdf', {
      url: `/api/diagnostic/${idDiagnostic}/restitution`,
      methode: 'GET',
      contentType: 'application/pdf',
    });
    this.actions.set('restitution-json', {
      url: `/api/diagnostic/${idDiagnostic}/restitution`,
      methode: 'GET',
      contentType: 'application/json',
    });
    return this;
  }

  modifierDiagnostic(idDiagnostic: string): ConstructeurActionsHATEOAS {
    this.actions.set('modifier-diagnostic', {
      url: `/api/diagnostic/${idDiagnostic}`,
      methode: 'GET',
    });
    return this;
  }

  private seConnecter(): ConstructeurActionsHATEOAS {
    this.actions.set('se-connecter', { url: '/api/token', methode: 'POST' });
    return this;
  }

  modifierMotDePasse(): ConstructeurActionsHATEOAS {
    this.actions.set('modifier-mot-de-passe', {
      url: '/api/profil/modifier-mot-de-passe',
      methode: 'POST',
    });
    return this;
  }

  private seDeconnecter(): ConstructeurActionsHATEOAS {
    this.actions.set('se-deconnecter', {
      url: '/api/token',
      methode: 'DELETE',
    });
    return this;
  }

  affichageProfil(): ConstructeurActionsHATEOAS {
    return this.lancerDiagnostic().modifierMotDePasse().seDeconnecter();
  }

  demanderAide() {
    this.actions.set('demander-aide', {
      url: '/api/demandes/etre-aide',
      methode: 'POST',
    });
    return this;
  }

  actionsTableauDeBord(idDiagnostics: string[]): ConstructeurActionsHATEOAS {
    this.actions.set('lancer-diagnostic', {
      url: '/api/diagnostic',
      methode: 'POST',
    });
    idDiagnostics.forEach((idDiagnostic) =>
      this.afficherDiagnostic(idDiagnostic as crypto.UUID)
    );
    return this.afficherProfil().seDeconnecter();
  }

  actionsDiagnosticLance(
    idDiagnostic: crypto.UUID
  ): ConstructeurActionsHATEOAS {
    this.afficherDiagnostic(idDiagnostic);
    this.afficherTableauDeBord();
    return this;
  }

  private afficherDiagnostic(idDiagnostic: crypto.UUID) {
    this.actions.set(`afficher-diagnostic-${idDiagnostic}`, {
      url: `/api/diagnostic/${idDiagnostic}/restitution`,
      methode: 'GET',
    });
  }

  actionsAccesDiagnosticNonAutorise(): ConstructeurActionsHATEOAS {
    this.afficherTableauDeBord();
    return this.afficherProfil().seDeconnecter();
  }

  reponseDonneeAuDiagnostic(
    identifiantDiagnostic: crypto.UUID
  ): ConstructeurActionsHATEOAS {
    this.afficherDiagnostic(identifiantDiagnostic);
    return this;
  }

  actionsPubliques(): ConstructeurActionsHATEOAS {
    this.actions.set('demande-devenir-aidant', {
      url: '/api/demandes/devenir-aidant',
      methode: 'GET',
    });

    this.actions.set('demande-etre-aide', {
      url: '/api/demandes/etre-aide',
      methode: 'GET',
    });

    return this.seConnecter();
  }

  actionsDemandeDevenirAidant(): ConstructeurActionsHATEOAS {
    this.actions.set('envoyer-demande-devenir-aidant', {
      url: '/api/demandes/devenir-aidant',
      methode: 'POST',
    });
    return this;
  }

  actionsCreationCompte(): ConstructeurActionsHATEOAS {
    this.seConnecter();
    return this;
  }

  construis = (): ReponseHATEOAS => {
    return {
      liens: {
        ...(this.actions.size > 0 &&
          Array.from(this.actions).reduce(
            (accumulateur, [action, lien]) => ({
              ...accumulateur,
              [action]: lien,
            }),
            {}
          )),
      },
    };
  };
}

export const constructeurActionsHATEOAS = (): ConstructeurActionsHATEOAS =>
  new ConstructeurActionsHATEOAS();

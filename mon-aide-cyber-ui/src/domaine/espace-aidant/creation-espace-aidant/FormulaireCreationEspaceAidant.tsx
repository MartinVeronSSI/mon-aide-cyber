import { FormEvent, useCallback, useEffect, useReducer, useState } from 'react';
import {
  cguCliquees,
  creationEspaceAidantInvalidee,
  creationEspaceAidantTransmise,
  creationEspaceAidantValidee,
  initialiseReducteur,
  reducteurCreationEspaceAidant,
} from './reducteurCreationEspaceAidant.tsx';
import { useNavigationMAC } from '../../../fournisseurs/hooks.ts';
import { MoteurDeLiens, ROUTE_AIDANT } from '../../MoteurDeLiens.ts';
import { Lien, ReponseHATEOAS } from '../../Lien.ts';
import { constructeurParametresAPI } from '../../../fournisseurs/api/ConstructeurParametresAPI.ts';
import { CreationEspaceAidant } from '../EspaceAidant.ts';
import { ComposantModificationMotDePasse } from '../../../composants/mot-de-passe/ComposantModificationMotDePasse.tsx';
import { MACAPIType, useMACAPI } from '../../../fournisseurs/api/useMACAPI.ts';

type ProprietesComposantCreationEspaceAidant = {
  macAPI: MACAPIType;
};

export const ComposantCreationEspaceAidant = ({
  macAPI,
}: ProprietesComposantCreationEspaceAidant) => {
  const [etatCreationEspaceAidant, envoie] = useReducer(
    reducteurCreationEspaceAidant,
    initialiseReducteur()
  );
  const [boutonValiderClique, setBoutonValiderClique] = useState(false);
  const navigationMAC = useNavigationMAC();

  const creeEspaceAidant = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setBoutonValiderClique(true);
  }, []);

  useEffect(() => {
    new MoteurDeLiens(navigationMAC.etat).trouve(
      'creer-espace-aidant',
      (lien: Lien) => {
        if (
          etatCreationEspaceAidant.saisieValide() &&
          etatCreationEspaceAidant.creationEspaceAidantATransmettre
        ) {
          const parametresAPI =
            constructeurParametresAPI<CreationEspaceAidant>()
              .url(lien.url)
              .methode(lien.methode!)
              .corps({
                cguSignees: etatCreationEspaceAidant.cguSignees,
                motDePasse:
                  etatCreationEspaceAidant.motDePasse!.nouveauMotDePasse,
                motDePasseTemporaire:
                  etatCreationEspaceAidant.motDePasse!.ancienMotDePasse,
              })
              .construis();
          macAPI
            .execute<ReponseHATEOAS, ReponseHATEOAS, CreationEspaceAidant>(
              parametresAPI,
              async (json) => await json
            )
            .then((reponse) => {
              envoie(creationEspaceAidantTransmise());
              navigationMAC.navigue(
                `${ROUTE_AIDANT}/tableau-de-bord`,
                reponse.liens,
                ['creer-espace-aidant']
              );
            })
            .catch((erreur) => envoie(creationEspaceAidantInvalidee(erreur)));
        }
      },
      () =>
        navigationMAC.navigue(
          `${ROUTE_AIDANT}/tableau-de-bord`,
          navigationMAC.etat
        )
    );
  }, [navigationMAC, etatCreationEspaceAidant]);

  const surCGUSignees = useCallback(() => {
    envoie(cguCliquees());
  }, []);

  return (
    <form onSubmit={creeEspaceAidant}>
      <fieldset className="fr-fieldset section">
        <div>
          <div>
            <label className="fr-label">
              <h5>Création de votre espace Aidant</h5>
            </label>
          </div>
          <div className="bienvenue">
            <p>
              Bienvenue dans la communauté !
              <br />
              <br />
              Pour finaliser la création de votre espace Aidant, vous devez
              définir un nouveau mot de passe.
            </p>
          </div>
        </div>
        <div className="fr-fieldset__content">
          <ComposantModificationMotDePasse
            titreSaisieAncienMotDePasse="Saisissez votre mot de passe temporaire"
            messagesErreurs={{
              motsDePasseConfirmeDifferent:
                'La confirmation de votre mot de passe ne correspond pas au mot de passe saisi.',
              motsDePasseVides: 'Vous devez saisir vos mots de passe.',
              ancienMotDePasseIdentiqueAuNouveauMotDePasse:
                'Votre nouveau mot de passe doit être différent du mot de passe temporaire.',
            }}
            {...(boutonValiderClique && {
              surValidation: (modificationMotDePasse) => {
                envoie(creationEspaceAidantValidee(modificationMotDePasse));
                setBoutonValiderClique(false);
              },
            })}
          />
          <div className="fr-checkbox-group mac-radio-group">
            <input
              type="checkbox"
              id="cgu-aidant"
              name="cgu-aidant"
              onChange={surCGUSignees}
              checked={etatCreationEspaceAidant.cguSignees}
            />
            <label className="fr-label" htmlFor="cgu-aidant">
              J&apos;accepte les &nbsp;
              <b>
                <a href="/cgu">conditions générales d&apos;utilisation</a>
              </b>
              &nbsp; de MonAideCyber
            </label>
            {etatCreationEspaceAidant.erreur?.cguSignees?.texteExplicatif}
          </div>
          <div className="fr-grid-row fr-grid-row--right">
            <button
              type="submit"
              key="creation-espace-aidant"
              className="fr-btn bouton-mac bouton-mac-primaire"
            >
              Valider
            </button>
          </div>
        </div>
        <div className="fr-mt-2w">{etatCreationEspaceAidant.champsErreur}</div>
      </fieldset>
    </form>
  );
};

export const FormulaireCreationEspaceAidant = () => {
  return <ComposantCreationEspaceAidant macAPI={useMACAPI()} />;
};

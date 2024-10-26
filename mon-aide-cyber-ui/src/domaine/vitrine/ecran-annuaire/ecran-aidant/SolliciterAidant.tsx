import { useRecupereContexteNavigation } from '../../../../hooks/useRecupereContexteNavigation';
import { AidantAnnuaire } from '../AidantAnnuaire';
import { Confirmation } from '../../../../composants/gestion-demandes/etre-aide/Confirmation.tsx';
import { useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CorpsDemandeSolliciterAidant,
  ReponseDemandeEtreAide,
} from '../../../gestion-demandes/etre-aide/EtreAide.ts';
import { useMACAPI } from '../../../../fournisseurs/api/useMACAPI.ts';
import { MoteurDeLiens } from '../../../MoteurDeLiens.ts';
import { constructeurParametresAPI } from '../../../../fournisseurs/api/ConstructeurParametresAPI.ts';
import { useNavigationMAC } from '../../../../fournisseurs/hooks.ts';
import { FormulaireSolliciterAidant } from './FormulaireSolliciterAidant.tsx';

export const SolliciterAidant = ({
  aidant,
  nomDepartement,
}: {
  aidant: AidantAnnuaire;
  nomDepartement: string;
}) => {
  useRecupereContexteNavigation('demande-etre-aide');
  const navigationMAC = useNavigationMAC();
  const macAPI = useMACAPI();

  const { data: ressourceSolliciterAidant } = useQuery({
    queryKey: ['recupere-contexte-solliciter-aidant'],
    enabled: new MoteurDeLiens(navigationMAC.etat).existe('demande-etre-aide'),
    queryFn: () => {
      const action = new MoteurDeLiens(navigationMAC.etat).trouveEtRenvoie(
        'demande-etre-aide'
      );
      return macAPI.execute<ReponseDemandeEtreAide, ReponseDemandeEtreAide>(
        constructeurParametresAPI()
          .url(action.url)
          .methode(action.methode!)
          .construis(),
        (corps) => corps
      );
    },
  });

  useEffect(() => {
    if (ressourceSolliciterAidant?.liens) {
      navigationMAC.ajouteEtat(ressourceSolliciterAidant?.liens);
    }
  }, [ressourceSolliciterAidant]);

  const {
    mutate: soumettreFormulaire,
    isError,
    error,
    isSuccess,
    isPending,
  } = useMutation({
    mutationKey: ['solliciter-aidant'],
    mutationFn: (demandeSolliciterAidant: CorpsDemandeSolliciterAidant) => {
      const actionSoumettre = new MoteurDeLiens(
        navigationMAC.etat
      ).trouveEtRenvoie('demander-aide');

      return macAPI
        .execute<void, void, CorpsDemandeSolliciterAidant>(
          {
            url: actionSoumettre.url,
            methode: actionSoumettre.methode!,
            corps: {
              cguValidees: demandeSolliciterAidant.cguValidees,
              departement: demandeSolliciterAidant.departement,
              email: demandeSolliciterAidant.email,
              ...(demandeSolliciterAidant.raisonSociale && {
                raisonSociale: demandeSolliciterAidant.raisonSociale,
              }),
            },
          },
          (corps) => corps
        )
        .then((reponse) => reponse);
    },
  });

  const retourAccueil = useCallback(() => {
    navigationMAC.retourAccueil();
  }, [navigationMAC]);

  console.log(`<SolliciterAidant />`, { aidant });

  if (isPending) {
    return <div className="fr-grid-row fr-grid-row--center">Chargement</div>;
  }

  if (isError) {
    return (
      <div className="fr-grid-row fr-grid-row--center">{error.message}</div>
    );
  }

  if (isSuccess) {
    return (
      <div className="fr-grid-row fr-grid-row--center">
        <Confirmation onClick={() => retourAccueil()} />
      </div>
    );
  }

  return (
    <div className="fr-grid-row fr-grid-row--center">
      <FormulaireSolliciterAidant
        departement={nomDepartement}
        aidant={aidant}
        soumetFormulaire={soumettreFormulaire}
      />
      {/*<div>{retourEnvoiDemandeEtreAide}</div>*/}
    </div>
  );
};

import { CarteAidant } from '../CarteAidant';
import { TypographieH6 } from '../../../../../composants/communs/typographie/TypographieH6/TypographieH6';
import illustrationFAQFemme from '../../../../../../public/images/illustration-faq-femme.svg';
import Button from '../../../../../composants/atomes/Button/Button';
import { Link, useNavigate } from 'react-router-dom';
import { AutoCompletion } from '../../../../../composants/auto-completion/AutoCompletion';
import {
  Departement,
  estDepartement,
} from '../../../../gestion-demandes/departement';
import { useState } from 'react';
import { AidantAnnuaire } from '../../AidantAnnuaire.ts';
import { useListeAidants } from './useListeAidants.ts';
import { Pagination } from './pagination/Pagination.tsx';

const afficheUnPlurielSiMultiplesResultats = (tableau: unknown[]) => {
  return tableau && tableau.length > 1 ? 's' : '';
};

export type CartesAidant = {
  aidants: AidantAnnuaire[] | undefined;
  nombreAidants: number | undefined;
  enCoursDeChargement: boolean;
  enErreur: boolean;
  relanceLaRecherche: () => void;
  solliciteAidant: (aidant: AidantAnnuaire) => void;
};

export const CartesAidant = ({
  aidants,
  nombreAidants,
  enCoursDeChargement,
  enErreur,
  relanceLaRecherche,
  solliciteAidant,
}: CartesAidant) => {
  if (enCoursDeChargement) {
    return (
      <div className="cartes-aidants-messages">
        <TypographieH6>Chargement des Aidants...</TypographieH6>
      </div>
    );
  }

  if (enErreur) {
    return (
      <div className="cartes-aidants-messages">
        <img src={illustrationFAQFemme} alt="" />
        <p>Une erreur est survenue lors de la recherche d&apos;Aidants...</p>
        <Button type="button" onClick={() => relanceLaRecherche()}>
          Relancer la recherche d&apos;Aidants
        </Button>
      </div>
    );
  }

  if (!aidants || aidants?.length === 0) {
    return (
      <div className="cartes-aidants-messages">
        <img src={illustrationFAQFemme} alt="" />
        <p>
          Malheureusement, aucun résultat ne correspond à votre recherche.
          <br />
          Vous pouvez faire une nouvelle recherche dans un territoire proche du
          votre, <br /> ou bien effectuer une demande en ligne, à laquelle un
          aidant répondra !
        </p>
        <Link to="/beneficier-du-dispositif/etre-aide#formulaire-demande-aide">
          <Button type="button">Je fais une demande</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        Il y a actuellement <b>{nombreAidants}</b> Aidant
        {afficheUnPlurielSiMultiplesResultats(aidants)} ayant souhaité
        apparaître publiquement dans l&apos;annuaire de MonAideCyber.
      </p>
      <div className="cartes-aidants">
        {aidants?.map((aidant) => (
          <CarteAidant key={aidant.identifiant}>
            <i className="fr-icon-user-line"></i>
            <span>
              <b>{aidant.nomPrenom}</b>
            </span>
            <Button
              type="button"
              variant="link"
              style={{ display: 'flex', gap: '.5rem' }}
              onClick={() => solliciteAidant(aidant)}
            >
              <span>Solliciter une aide</span>
              <i className="fr-icon-arrow-right-line"></i>
            </Button>
          </CarteAidant>
        ))}
      </div>
    </div>
  );
};

type ProprietesListeAidantsPaginee = {
  aidants: AidantAnnuaire[] | undefined;
  nombreAidants: number | undefined;
  enCoursDeChargement: boolean;
  enErreur: boolean;
  relanceLaRecherche: () => void;
  solliciteAidant: (aidant: AidantAnnuaire) => void;
};
const ListeAidantsPaginee = (proprietes: ProprietesListeAidantsPaginee) => {
  const [aidantsCourant, setAidantsCourant] = useState<
    AidantAnnuaire[] | undefined
  >(proprietes.aidants);

  if (!proprietes.aidants) {
    return (
      <div className="liste-aidants">
        <div className="cartes-aidants-messages">
          <img src={illustrationFAQFemme} alt="" />
          <p>
            Pour trouver des Aidants cyber, veuillez tout d&apos;abord choisir
            le territoire concerné.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="liste-aidants">
      <span className="titre">Aidants trouvés</span>
      <CartesAidant
        aidants={aidantsCourant}
        nombreAidants={proprietes.nombreAidants}
        enCoursDeChargement={proprietes.enCoursDeChargement}
        enErreur={proprietes.enErreur}
        relanceLaRecherche={proprietes.relanceLaRecherche}
        solliciteAidant={proprietes.solliciteAidant}
      />
      <Pagination elements={proprietes.aidants} surClick={setAidantsCourant} />
    </div>
  );
};

export const ListeAidants = () => {
  const {
    aidants,
    nombreAidants,
    enCoursDeChargement,
    enErreur,
    relanceLaRecherche,
    referentielDepartements,
    departementARechercher,
    selectionneDepartement,
  } = useListeAidants();
  const navigate = useNavigate();

  const ouvreFormulaireEtreAide = (
    aidant: AidantAnnuaire,
    departement?: Departement
  ) => {
    if (!departement) return;

    navigate(
      `/beneficier-du-dispositif/annuaire/solliciter?aidant=${aidant.identifiant}&nomPrenom=${aidant.nomPrenom}&dpt=${departement.nom}`
    );
  };

  return (
    <div className="layout-annuaire">
      <div className="filtres">
        <span className="titre">Où est située votre entité ?</span>
        <div className="fr-input-group">
          <AutoCompletion<Departement>
            nom="departement"
            placeholder="Sélectionnez un territoire"
            valeurSaisie={departementARechercher || ({} as Departement)}
            suggestionsInitiales={referentielDepartements}
            mappeur={(departement) => {
              return estDepartement(departement)
                ? `${departement.code} - ${departement.nom}`
                : typeof departement === 'string'
                  ? departement
                  : '';
            }}
            surSelection={(departement) => {
              selectionneDepartement(departement);
            }}
            surSaisie={(departement) => {
              selectionneDepartement(
                estDepartement(departement)
                  ? departement
                  : referentielDepartements.find((x) => x.nom === departement)!
              );
            }}
            clefsFiltrage={['code', 'nom']}
          />
        </div>
      </div>
      <ListeAidantsPaginee
        aidants={aidants}
        nombreAidants={nombreAidants}
        enCoursDeChargement={enCoursDeChargement}
        enErreur={enErreur}
        relanceLaRecherche={relanceLaRecherche}
        solliciteAidant={(aidant) =>
          ouvreFormulaireEtreAide(aidant, departementARechercher)
        }
      />
    </div>
  );
};

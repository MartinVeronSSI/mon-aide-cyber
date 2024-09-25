import { ActionsPiedDePage } from '../../../composants/communs/ActionsPiedDePage';
import { FormulaireDeContact } from '../../../composants/communs/FormulaireDeContact/FormulaireDeContact';
import { ComposantDemandeEtreAide } from '../../../composants/gestion-demandes/etre-aide/ComposantDemandeEtreAide';
import useDefilementFluide from '../../../hooks/useDefilementFluide';
import { Temoignages } from '../ecran-devenir-aidant/composants/Temoignages';
import { Autodiagnostic } from './composants/Autodiagnostic';
import { FocusRestitution } from './composants/FocusRestitution';
import { FonctionnementDispositif } from './composants/FonctionnementDispositif';
import { HeroDemandeAide } from './composants/HeroDemandeAide';
import { QuiEstConcerne } from './composants/QuiEstConcerne';
import './ecran-beneficier-du-dispositif.scss';

export const EcranBeneficierDuDispositif = () => {
  useDefilementFluide();

  return (
    <main role="main" className="ecran-beneficier-du-dispositif">
      <HeroDemandeAide />
      <QuiEstConcerne />
      <FonctionnementDispositif />
      <FocusRestitution />
      <section id="formulaire-demande-aide" className="fond-clair-mac">
        <ComposantDemandeEtreAide />
      </section>
      <Temoignages
        verbatims={[
          {
            id: 1,
            auteur: 'Un bénéficiaire de Seine Maritime (76)',
            commentaire:
              'Cela m’a permis d’avoir une cartographie globale et notre positionnement en terme en cybersécurité.',
          },
          {
            id: 2,
            auteur: 'Un bénéficiaire de Dordogne (24)',
            commentaire: 'C’est une feuille de route, c’est ça qui me séduit !',
          },
        ]}
      />
      <Autodiagnostic />
      <ActionsPiedDePage className="fond-clair-mac fr-pt-4w" />
      <FormulaireDeContact />
    </main>
  );
};

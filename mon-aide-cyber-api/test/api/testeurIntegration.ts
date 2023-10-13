import serveur from '../../src/serveur';
import { AdaptateurReferentielDeTest } from '../adaptateurs/AdaptateurReferentielDeTest';
import { AdaptateurTranscripteurDeTest } from '../adaptateurs/adaptateurTranscripteur';
import { AdaptateurTableauDeRecommandationsDeTest } from '../adaptateurs/AdaptateurTableauDeRecommandationsDeTest';
import { AdaptateurPDF } from '../../src/adaptateurs/AdaptateurPDF';
import { Diagnostic } from '../../src/diagnostic/Diagnostic';
import { Express } from 'express';
import { fakerFR } from '@faker-js/faker';
import { EntrepotsMemoire } from '../infrastructure/entrepots/memoire/Entrepots';
import { BusEvenementDeTest } from '../infrastructure/bus/BusEvenementDeTest';

const PORT_ECOUTE = fakerFR.number.int({ min: 10000, max: 20000 });
const testeurIntegration = () => {
  let serveurDeTest: {
    app: Express;
    arreteEcoute: () => void;
    ecoute: (port: number, succes: () => void) => void;
  };
  const adaptateurReferentiel = new AdaptateurReferentielDeTest();
  const adaptateurTableauDeRecommandations =
    new AdaptateurTableauDeRecommandationsDeTest();
  const adaptateurTranscripteurDonnees = new AdaptateurTranscripteurDeTest();
  const entrepots = new EntrepotsMemoire();
  const busEvenement = new BusEvenementDeTest();
  const adaptateurPDF: AdaptateurPDF = {
    genereRecommandations: (__: Diagnostic) =>
      Promise.resolve(Buffer.from('PDF généré')),
  };
  const initialise = () => {
    serveurDeTest = serveur.creeServeur({
      adaptateurPDF,
      adaptateurReferentiel,
      adaptateurTranscripteurDonnees,
      adaptateurTableauDeRecommandations,
      entrepots,
      busEvenement,
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    serveurDeTest.ecoute(PORT_ECOUTE, () => {});
    return { portEcoute: PORT_ECOUTE, app: serveurDeTest.app };
  };

  const arrete = () => {
    serveurDeTest.arreteEcoute();
  };

  return {
    adaptateurReferentiel,
    arrete,
    entrepots,
    initialise,
    adaptateurPDF,
  };
};

export default testeurIntegration;

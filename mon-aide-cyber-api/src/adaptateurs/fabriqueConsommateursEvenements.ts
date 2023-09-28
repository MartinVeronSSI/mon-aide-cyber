import {
  diagnosticLance,
  diagnosticTermnine,
  reponseAjoutee,
} from '../journalisation/evenements';
import { EntrepotJournalisationPostgres } from '../infrastructure/entrepots/postgres/EntrepotJournalisationPostgres';
import configurationJournalisation from '../infrastructure/entrepots/postgres/configurationJournalisation';
import { ConsommateurEvenement, TypeEvenement } from '../domaine/BusEvenement';
import { EntrepotEvenementJournalMemoire } from '../infrastructure/entrepots/memoire/EntrepotMemoire';

const fabriqueEntrepotJournalisation = () => {
  return process.env.URL_JOURNALISATION_BASE_DONNEES
    ? new EntrepotJournalisationPostgres(configurationJournalisation)
    : new EntrepotEvenementJournalMemoire();
};

export const fabriqueConsommateursEvenements = () => {
  const entrepotJournalisation = fabriqueEntrepotJournalisation();

  return new Map<TypeEvenement, ConsommateurEvenement>([
    ['DIAGNOSTIC_TERMINE', diagnosticTermnine(entrepotJournalisation)],
    ['DIAGNOSTIC_LANCE', diagnosticLance(entrepotJournalisation)],
    ['REPONSE_AJOUTEE', reponseAjoutee(entrepotJournalisation)],
  ]);
};

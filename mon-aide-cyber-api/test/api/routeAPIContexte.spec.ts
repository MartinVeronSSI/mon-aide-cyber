import { afterEach, beforeEach, describe, expect } from 'vitest';
import testeurIntegration from './testeurIntegration';
import { Express } from 'express';
import { executeRequete } from './executeurRequete';
import { ReponseHATEOAS } from '../../src/api/hateoas/hateoas';
import { FauxGestionnaireDeJeton } from '../infrastructure/authentification/FauxGestionnaireDeJeton';

import { unUtilisateur } from '../constructeurs/constructeursAidantUtilisateur';
import { liensPublicsAttendus } from './hateoas/liensAttendus';

describe('Route contexte', () => {
  const testeurMAC = testeurIntegration();
  let donneesServeur: { portEcoute: number; app: Express };

  beforeEach(() => {
    donneesServeur = testeurMAC.initialise();
  });

  afterEach(() => {
    testeurMAC.arrete();
  });

  it('Retourne les actions publiques si le contexte n’est pas fourni', async () => {
    const reponse = await executeRequete(
      donneesServeur.app,
      'GET',
      `/api/contexte`,
      donneesServeur.portEcoute
    );

    expect(reponse.statusCode).toBe(200);
    expect(await reponse.json()).toStrictEqual<ReponseHATEOAS>({
      ...liensPublicsAttendus,
    });
  });

  it('Retourne les actions spécifiques au contexte fourni', async () => {
    const reponse = await executeRequete(
      donneesServeur.app,
      'GET',
      `/api/contexte?contexte=demande-devenir-aidant:finalise-creation-espace-aidant`,
      donneesServeur.portEcoute
    );

    expect(reponse.statusCode).toBe(200);
    expect(await reponse.json()).toStrictEqual<ReponseHATEOAS>({
      liens: {
        'finalise-creation-espace-aidant': {
          url: '/api/demandes/devenir-aidant/creation-espace-aidant',
          methode: 'POST',
        },
      },
    });
  });

  describe('Dans le cas d’un Aidant avec espace ayant une session', () => {
    const testeurMAC = testeurIntegration();
    let donneesServeur: { portEcoute: number; app: Express };

    beforeEach(async () => {
      const utilisateur = unUtilisateur().construis();
      testeurMAC.recuperateurDeCookies = () =>
        btoa(
          JSON.stringify({
            token: JSON.stringify({
              identifiant: utilisateur.identifiant,
            }),
          })
        );
      await testeurMAC.entrepots.utilisateurs().persiste(utilisateur);
      donneesServeur = testeurMAC.initialise();
    });

    it('Retourne le tableau de bord Aidant si il revient sur la page d’accueil de MAC', async () => {
      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        `/api/contexte`,
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toBe(200);
      expect(await reponse.json()).toStrictEqual<ReponseHATEOAS>({
        liens: {
          'afficher-tableau-de-bord': {
            url: '/api/espace-aidant/tableau-de-bord',
            methode: 'GET',
          },
        },
      });
    });

    it('Retourne le tableau de bord Aidant si il revient sur la de statistiques publique de MAC', async () => {
      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        `/api/contexte?contexte=afficher-statistiques`,
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toBe(200);
      expect(await reponse.json()).toStrictEqual<ReponseHATEOAS>({
        liens: {
          'afficher-tableau-de-bord': {
            url: '/api/espace-aidant/tableau-de-bord',
            methode: 'GET',
          },
          'afficher-statistiques': {
            url: '/statistiques',
            methode: 'GET',
          },
        },
      });
    });

    describe('Lorsqu’une erreur est levée', () => {
      beforeEach(() => {
        testeurMAC.gestionnaireDeJeton = new FauxGestionnaireDeJeton(true);
        donneesServeur = testeurMAC.initialise();
      });

      afterEach(() => {
        testeurMAC.arrete();
      });

      it('Retourne les liens publics', async () => {
        const reponse = await executeRequete(
          donneesServeur.app,
          'GET',
          `/api/contexte`,
          donneesServeur.portEcoute
        );

        expect(reponse.statusCode).toBe(200);
        expect(await reponse.json()).toStrictEqual<ReponseHATEOAS>({
          ...liensPublicsAttendus,
        });
      });
    });
  });

  describe('Dans le cas d’un Aidant sans espace ayant une session', () => {
    const testeurMAC = testeurIntegration();
    let donneesServeur: { portEcoute: number; app: Express };

    beforeEach(async () => {
      const utilisateurSansEspace = unUtilisateur()
        .sansCGUSignees()
        .construis();
      testeurMAC.recuperateurDeCookies = () =>
        btoa(
          JSON.stringify({
            token: JSON.stringify({
              identifiant: utilisateurSansEspace.identifiant,
            }),
          })
        );
      await testeurMAC.entrepots.utilisateurs().persiste(utilisateurSansEspace);
      donneesServeur = testeurMAC.initialise();
    });
    it('Retourne le lien vers la création de l’espace aidant si il s’agit d’une première connexion', async () => {
      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        `/api/contexte`,
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toBe(200);
      expect(await reponse.json()).toStrictEqual<ReponseHATEOAS>({
        liens: {
          'creer-espace-aidant': {
            url: '/api/espace-aidant/cree',
            methode: 'POST',
          },
        },
      });
    });
  });
});

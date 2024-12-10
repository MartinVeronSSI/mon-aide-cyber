import testeurIntegration from '../testeurIntegration';
import { Express } from 'express';
import { executeRequete } from '../executeurRequete';
import { unAidant } from '../../constructeurs/constructeursAidantUtilisateur';
import { desInformationsUtilisateur } from '../../constructeurs/constructeurProConnectInformationsUtilisateur';
import { fakerFR } from '@faker-js/faker';
import { ReponseHATEOASEnErreur } from '../../../src/api/hateoas/hateoas';

const enObjet = <T extends { [clef: string]: string }>(cookie: string): T =>
  cookie.split('; ').reduce((acc: T, v: string) => {
    const [cle, valeur] = v.split('=');
    return { ...acc, [cle]: valeur };
  }, {} as T);

describe('Le serveur MAC, sur les routes de connexion ProConnect', () => {
  const testeurMAC = testeurIntegration();
  let donneesServeur: { portEcoute: number; app: Express };

  beforeEach(() => {
    donneesServeur = testeurMAC.initialise();
  });

  afterEach(() => testeurMAC.arrete());

  describe('Lorsqu’une requête GET est reçue sur /pro-connect/connexion', () => {
    beforeEach(() => {
      testeurMAC.adaptateurProConnect.genereDemandeAutorisation = () =>
        Promise.resolve({
          nonce: 'coucou',
          url: new URL('http://mom-domaine'),
          state: 'etat',
        });
      donneesServeur = testeurMAC.initialise();
    });

    it('L’utilisateur est redirigé', async () => {
      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        '/pro-connect/connexion',
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toStrictEqual(302);
      const objet = enObjet<{ ProConnectInfo: string; [clef: string]: string }>(
        reponse.headers['set-cookie'] as string
      );
      expect(objet.ProConnectInfo).toStrictEqual(
        'j%3A%7B%22state%22%3A%22etat%22%2C%22nonce%22%3A%22coucou%22%7D'
      );
    });
  });

  describe('Lorsqu’une requête GET est reçue sur /pro-connect/apres-authentification', () => {
    beforeEach(async () => {
      const aidant = unAidant().construis();
      await testeurMAC.entrepots.aidants().persiste(aidant);
      testeurMAC.recuperateurDeCookies = () =>
        'j%3A%7B%22state%22%3A%22etat%22%2C%22nonce%22%3A%22coucou%22%7D';
      testeurMAC.adaptateurProConnect.recupereJeton = () =>
        Promise.resolve({
          idToken: fakerFR.string.alpha(10),
          accessToken: fakerFR.string.alpha(10),
        });
      testeurMAC.adaptateurProConnect.recupereInformationsUtilisateur = () =>
        Promise.resolve(
          desInformationsUtilisateur().pourUnAidant(aidant).construis()
        );
      testeurMAC.gestionnaireDeJeton.genereJeton = () => 'abc';
      donneesServeur = testeurMAC.initialise();
    });

    it('L’Aidant est redirigé vers le tableau de bord', async () => {
      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        '/pro-connect/apres-authentification',
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toStrictEqual(302);
      expect(reponse.headers['location']).toStrictEqual(
        '/aidant/tableau-de-bord'
      );
      const objet = enObjet<{ session: string; [clef: string]: string }>(
        (reponse.headers['set-cookie'] as string[])[1]
      );
      expect(
        JSON.parse(Buffer.from(objet.session, 'base64').toString()).token
      ).toStrictEqual('abc');
    });

    it('Si l’utilisateur n’est pas connu, on envoie un message disant qu’il n’a pas de compte', async () => {
      testeurMAC.adaptateurProConnect.recupereInformationsUtilisateur = () =>
        Promise.resolve(desInformationsUtilisateur().construis());

      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        '/pro-connect/apres-authentification',
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toStrictEqual(401);
      expect(await reponse.json()).toStrictEqual<ReponseHATEOASEnErreur>({
        message: 'Vous n’avez pas de compte enregistré sur MonAideCyber',
        liens: {},
      });
    });

    it('Si la présence du cookie ProConnectInfo n’est pas validée, on envoie un message d’erreur d’authentification', async () => {
      testeurMAC.recuperateurDeCookies = () => undefined;
      donneesServeur = testeurMAC.initialise();

      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        '/pro-connect/apres-authentification',
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toStrictEqual(401);
      expect(await reponse.json()).toStrictEqual<ReponseHATEOASEnErreur>({
        message: 'Erreur d’authentification',
        liens: {},
      });
    });

    it('Si une erreur est rencontrée lors de l’échange avec ProConnect, on envoie un message d’erreur d’authentification', async () => {
      testeurMAC.adaptateurProConnect.recupereInformationsUtilisateur = () => {
        throw new Error('Erreur avec ProConnect');
      };
      donneesServeur = testeurMAC.initialise();

      const reponse = await executeRequete(
        donneesServeur.app,
        'GET',
        '/pro-connect/apres-authentification',
        donneesServeur.portEcoute
      );

      expect(reponse.statusCode).toStrictEqual(401);
      expect(await reponse.json()).toStrictEqual<ReponseHATEOASEnErreur>({
        message: 'Erreur d’authentification',
        liens: {},
      });
    });
  });
});
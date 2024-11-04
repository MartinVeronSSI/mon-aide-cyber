import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { ConsignateurErreurs } from '../../adaptateurs/ConsignateurErreurs';

import { ErreurMAC } from '../../domaine/erreurMAC';
import { constructeurActionsHATEOAS } from '../hateoas/hateoas';
import { ErreurAccesRefuse } from '../../adaptateurs/AdaptateurDeVerificationDeSession';
import { AggregatNonTrouve } from '../../domaine/Aggregat';
import { ErreurValidationMotDePasse } from '../validateurs/motDePasse';
import { ErreurEnvoiEmail } from '../messagerie/Messagerie';
import { ErreurModificationPreferences } from '../aidant/routesAPIAidantPreferences';
import { ErreurModificationProfil } from '../aidant/routesAPIProfil';
import { ErreurCreationEspaceAidant } from '../../espace-aidant/Aidant';

const HTTP_MAUVAISE_REQUETE = 400;
const HTTP_NON_AUTORISE = 401;
const HTTP_ACCES_REFUSE = 403;
const HTTP_NON_TROUVE = 404;
const HTTP_NON_TRAITABLE = 422;
const HTTP_ERREUR_SERVEUR = 500;

const CORPS_REPONSE_ERREUR_NON_GEREE = {
  message: "MonAideCyber n'est pas en mesure de traiter votre demande.",
};

const construisReponse = (
  reponse: Response,
  codeHTTP: number,
  corpsReponse: { message: string }
) => {
  reponse.status(codeHTTP);
  reponse.json(corpsReponse);
};

const erreursGerees: Map<
  string,
  <T extends Error>(
    erreur: ErreurMAC<T>,
    requete: Request,
    consignateur: ConsignateurErreurs,
    reponse: Response
  ) => void
> = new Map([
  [
    'AggregatNonTrouve',
    (erreur: ErreurMAC<AggregatNonTrouve>, _, consignateur, reponse) => {
      consignateur.consigne(erreur);
      construisReponse(reponse, HTTP_NON_TROUVE, { message: erreur.message });
    },
  ],
  [
    'ErreurAuthentification',
    (erreur, requete, _consignateur, reponse) => {
      requete.body['motDePasse'] = '<MOT_DE_PASSE_OBFUSQUE/>';
      construisReponse(reponse, HTTP_NON_AUTORISE, { message: erreur.message });
    },
  ],
  [
    'ErreurAccesRefuse',
    (erreur: ErreurMAC<ErreurAccesRefuse>, _, _consignateur, reponse) => {
      construisReponse(reponse, HTTP_ACCES_REFUSE, {
        message: "L'accès à la ressource est interdit.",
        ...constructeurActionsHATEOAS()
          .pour(erreur.erreurOriginelle.informationsContexte)
          .construis(),
      });
    },
  ],
  [
    'ErreurCreationEspaceAidant',
    (
      erreur: ErreurMAC<ErreurCreationEspaceAidant>,
      requete,
      consignateur,
      reponse
    ) => {
      requete.body['motDePasse'] = '<MOT_DE_PASSE_OBFUSQUE/>';
      requete.body['motDePasseTemporaire'] = '<MOT_DE_PASSE_OBFUSQUE/>';
      consignateur.consigne(erreur);
      construisReponse(reponse, HTTP_NON_TRAITABLE, {
        message: erreur.message,
      });
    },
  ],
  [
    'ErreurValidationMotDePasse',
    (
      erreur: ErreurMAC<ErreurValidationMotDePasse>,
      requete,
      _consignateur,
      reponse
    ) => {
      requete.body['motDePasse'] = '<MOT_DE_PASSE_OBFUSQUE/>';
      requete.body['motDePasseTemporaire'] = '<MOT_DE_PASSE_OBFUSQUE/>';
      construisReponse(reponse, HTTP_NON_TRAITABLE, {
        message: erreur.message,
      });
    },
  ],
  [
    'ErreurEnvoiMail',
    (erreur: ErreurMAC<ErreurEnvoiEmail>, _, consignateur, reponse) => {
      consignateur.consigne(erreur);
      construisReponse(reponse, HTTP_ERREUR_SERVEUR, {
        message: erreur.message,
      });
    },
  ],
  [
    'ErreurDemandeAide',
    (erreur, _, consignateur, reponse) => {
      consignateur.consigne(erreur);
      construisReponse(reponse, HTTP_ERREUR_SERVEUR, {
        message: erreur.message,
      });
    },
  ],
  [
    'ErreurDemandeDevenirAidant',
    (erreur, _, _consignateur, reponse) => {
      construisReponse(reponse, HTTP_MAUVAISE_REQUETE, {
        message: erreur.message,
      });
    },
  ],
  [
    'ErreurModificationPreferences',
    (
      erreur: ErreurMAC<ErreurModificationPreferences>,
      _requete,
      _consignateur,
      reponse
    ) => {
      construisReponse(reponse, HTTP_NON_TRAITABLE, {
        message: erreur.message,
      });
    },
  ],
  [
    'ErreurModificationProfil',
    (
      erreur: ErreurMAC<ErreurModificationProfil>,
      _requete,
      consignateur,
      reponse
    ) => {
      consignateur.consigne(erreur);
      construisReponse(reponse, HTTP_NON_TRAITABLE, {
        message: erreur.message,
      });
    },
  ],
]);

export const gestionnaireErreurGeneralisee = (
  consignateurErreur: ConsignateurErreurs
) => {
  return (
    erreur: Error,
    requete: Request,
    reponse: Response,
    suite: NextFunction
  ) => {
    const construisReponseErreurServeur = () => {
      construisReponse(
        reponse,
        HTTP_ERREUR_SERVEUR,
        CORPS_REPONSE_ERREUR_NON_GEREE
      );
    };

    if (erreur) {
      if (requete.body) {
        Object.keys(requete.body)
          .filter((attribut) =>
            attribut.match(/mot[s]?[-]?de[-]?passe[- ]?|mot[s]?[-]?passe[- ]?/i)
          )
          .forEach(
            (attribut) => (requete.body[attribut] = '<MOT_DE_PASSE_OBFUSQUE/>')
          );
      }
      if (erreur instanceof ErreurMAC) {
        if (erreursGerees.has(erreur.erreurOriginelle.constructor.name)) {
          erreursGerees.get(erreur.erreurOriginelle.constructor.name)?.(
            erreur,
            requete,
            consignateurErreur,
            reponse
          );
        } else {
          construisReponseErreurServeur();
          suite(erreur);
        }
      } else {
        construisReponseErreurServeur();
        suite(erreur);
      }
    }
  };
};

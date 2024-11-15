import illustrationQuiEstConcerne from '/images/illustration-qui-est-concerne.svg';
import { TypographieH4 } from '../../../../composants/communs/typographie/TypographieH4/TypographieH4';

export const QuiEstConcerne = () => {
  return (
    <section className="qui-est-concerne-layout fr-container">
      <div className="flex justify-center">
        <img
          src={illustrationQuiEstConcerne}
          alt="Deux futurs Aidants MonAideCyber"
        />
      </div>
      <div>
        <TypographieH4>
          <b>Qui est concerné ?</b>
        </TypographieH4>
        <p>
          <b>Engagés sur la base du volontariat</b>, avec une appétence pour les
          enjeux de cybersécurité, les Aidants cyber sont formés et outillés par
          l’ANSSI pour mener à bien la démarche d’accompagnement. La{' '}
          <b>communauté des Aidants</b> inclue entre autres des représentants de
          services de l’État (Police, Gendarmerie, réservistes...), des
          collectivités, des associations (Campus Cyber, OPSN - Opérateurs
          Publics de Services Numériques...) des sociétés privées bénévoles, des
          personnes physiques bénévoles rattachées à des entités morales à but
          non lucratif ou des entreprises privées sans prestation commerciale.
          <br />A l&apos;inverse, le dispositif n&apos;est pas adapté aux
          entreprises mono-salariés et auto-entrepreneurs.
        </p>
      </div>
    </section>
  );
};

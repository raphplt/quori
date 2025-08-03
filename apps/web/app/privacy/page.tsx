import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-base leading-relaxed text-foreground">
      <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : 3 août 2025
      </p>

      <p>
        Bienvenue sur <strong>Quori</strong>. La présente politique de
        confidentialité a pour objectif de vous informer sur la manière dont
        nous collectons, utilisons, partageons et protégeons vos données
        personnelles dans le cadre de l’utilisation de notre site et de notre
        service.
      </p>

      <section>
        <h2 className="text-xl font-semibold">1. Qui sommes-nous ?</h2>
        <p>
          Quori est un service édité par <strong>Raphaël Plassart</strong>, dont
          le siège social est situé à Paris.
          <br />
          Contact :{" "}
          <a className="underline text-primary" href="mailto:hello@quori.dev">
            hello@quori.dev
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          2. Quelles données collectons-nous ?
        </h2>
        <h3 className="font-medium mt-4">Données fournies directement :</h3>
        <ul className="list-disc list-inside ml-4">
          <li>Nom d’utilisateur (GitHub, LinkedIn)</li>
          <li>Adresse e-mail</li>
          <li>Identifiants publics de vos comptes connectés</li>
          <li>Jetons d’authentification (access tokens, sécurisés)</li>
          <li>Feedbacks, messages ou contenus soumis</li>
        </ul>
        <h3 className="font-medium mt-4">
          Données collectées automatiquement :
        </h3>
        <ul className="list-disc list-inside ml-4">
          <li>Adresse IP, navigateur, système d’exploitation</li>
          <li>Données de navigation (pages visitées, erreurs…)</li>
          <li>Statistiques d’usage (via PostHog par exemple)</li>
        </ul>
        <h3 className="font-medium mt-4">Données issues de services tiers :</h3>
        <ul className="list-disc list-inside ml-4">
          <li>Données publiques de GitHub (commits, dépôts…)</li>
          <li>Données publiques LinkedIn si connecté</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          3. Pourquoi collectons-nous ces données ?
        </h2>
        <ul className="list-disc list-inside ml-4">
          <li>Fournir et améliorer nos services</li>
          <li>Générer automatiquement des contenus à partir de vos commits</li>
          <li>Permettre la publication de posts sur LinkedIn (si autorisé)</li>
          <li>Suivre l’utilisation et les performances de Quori</li>
          <li>Vous contacter en cas de besoin</li>
          <li>Garantir la sécurité de la plateforme</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. Sur quelle base légale ?</h2>
        <ul className="list-disc list-inside ml-4">
          <li>Consentement explicite (connexion à des comptes tiers)</li>
          <li>Exécution du contrat (accès au service)</li>
          <li>Intérêt légitime (amélioration, sécurité)</li>
          <li>Obligations légales</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          5. Qui a accès à vos données ?
        </h2>
        <p>
          Seules les personnes habilitées au sein de Quori peuvent accéder à vos
          données. Nous ne les vendons ni ne les louons. Des prestataires
          techniques peuvent y accéder (hébergement, analytics…) uniquement dans
          le cadre de leur mission et sous contrat conforme au RGPD.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          6. Où sont stockées vos données ?
        </h2>
        <p>
          En Europe, sur des serveurs sécurisés. Certaines données peuvent
          transiter via des services conformes RGPD tels que Vercel, Supabase,
          Cloudflare, ou PostHog.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          7. Combien de temps conservons-nous vos données ?
        </h2>
        <ul className="list-disc list-inside ml-4">
          <li>
            Données de compte : tant que le compte est actif ou sur demande
          </li>
          <li>Logs techniques : 12 mois maximum</li>
          <li>Statistiques anonymisées : durée illimitée</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">8. Quels sont vos droits ?</h2>
        <p>
          Vous disposez du droit d’accès, de rectification, de suppression,
          d’opposition, de limitation, de portabilité et de retrait du
          consentement à tout moment.
        </p>
        <p>
          Vous pouvez aussi contacter la CNIL :{" "}
          <a className="underline text-primary" href="https://www.cnil.fr">
            www.cnil.fr
          </a>
          .
        </p>
        <p>
          Pour exercer vos droits :{" "}
          <a className="underline text-primary" href="mailto:privacy@quori.dev">
            privacy@quori.dev
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">9. Sécurité</h2>
        <p>
          Nous protégeons vos données par des moyens techniques (chiffrement,
          authentification) et organisationnels appropriés.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">10. Cookies et traceurs</h2>
        <p>
          Des cookies sont utilisés à des fins fonctionnelles et statistiques.
          Vous pouvez les refuser via votre navigateur ou depuis un bandeau de
          consentement.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          11. Modification de la politique
        </h2>
        <p>
          Cette politique peut être modifiée à tout moment. En cas de changement
          majeur, vous serez notifié par e-mail ou lors de votre prochaine
          connexion.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;

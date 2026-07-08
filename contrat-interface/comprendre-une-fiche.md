# Comprendre une fiche de règle

Ce document explique, sans prérequis technique, ce qu'est une fiche du catalogue de règles
publiques : pourquoi elle est écrite dans ce format, ce que dit chacun de ses blocs, et ce que
le catalogue s'engage (ou non) à garantir quand il la publie. Il s'adresse aux administrations
productrices de règles et aux réutilisateurs, pas aux seuls développeurs.

## De quoi parle-t-on

Une **règle**, au sens du catalogue, est un calcul que l'administration effectue pour produire
une décision ou un montant : ai-je le droit de voter, quel est le montant de ma prime d'activité,
mon entreprise est-elle éligible au crédit d'impôt recherche. Ces règles existent déjà, codées
dans des logiciels publics. La **fiche** est leur carte d'identité publique : un fichier unique,
`metadata.jsonld`, qui dit ce que la règle calcule, sur quelle base légale, à partir de quelles
informations, et avec quel degré de confiance.

La fiche ne contient pas le code de la règle. Elle pointe vers lui, à une version précise, comme
une notice bibliographique pointe vers un livre.

## Pourquoi ce format, JSON-LD

Une fiche est un fichier JSON : le format de données le plus répandu du web, lisible par
n'importe quel langage de programmation, et raisonnablement lisible par un humain. Le « LD »
(*linked data*) ajoute une chose : chaque nom de champ est relié à une définition publique et
partagée au niveau européen.

Concrètement, le début de la fiche contient un bloc `@context` qui est une table de
correspondance : il déclare que le champ `title` de cette fiche veut dire `dct:title`, le champ
« titre » du vocabulaire Dublin Core utilisé par les bibliothèques et catalogues du monde entier ;
que `cv:hasCompetentAuthority` désigne « l'autorité compétente » au sens du vocabulaire européen
des services publics (CPSV-AP), celui que les Pays-Bas, l'Italie ou la Commission utilisent pour
décrire leurs démarches administratives.

L'intérêt est double, et aucun des deux n'est « faire du web sémantique pour le plaisir » :

- **Pour le réutilisateur pressé**, le `@context` aplatit tout : la fiche se lit et se consomme
  comme du JSON ordinaire (`title`, `description`...), sans aucun outillage spécialisé. C'est ce
  que fait le site du catalogue lui-même.
- **Pour l'interopérabilité**, les champs ont un sens défini ailleurs que chez nous. Un catalogue
  européen, un moteur de recherche ou l'équivalent néerlandais du catalogue
  (regels.overheid.nl) peuvent lire nos fiches sans qu'on ait à négocier un format commun champ
  par champ : la négociation a déjà eu lieu, dans les vocabulaires standards.

Le prix à payer est une discipline d'écriture (chaque champ doit être déclaré dans le
`@context`), et c'est le rôle de la validation automatique de la faire respecter.

## Une fiche, bloc par bloc

Prenons la fiche la plus simple du catalogue, le droit de vote, et lisons-la dans l'ordre.

```jsonc
"id": "https://regles.gouv.fr/algo/civique/droit-vote/v1",
"type": "cpsv:PublicService",
"dct:identifier": "civique.droit-vote.v1",
"title": "Droit de vote en France",
"dct:version": "1.0.0",
```

L'**identité**. Le `id` est l'identifiant pérenne de la règle : une adresse web qui sert de nom
propre, stable dans le temps (le `/v1` final désigne la lignée : une refonte incompatible
donnerait un `/v2`). Le `type` dit ce qu'est cet objet : un service public au sens du vocabulaire
européen. La `version` suit les évolutions à l'intérieur de la lignée, comme les versions d'un
logiciel.

```jsonc
"cv:hasCompetentAuthority": { "id": "...#organisation" },
```

L'**autorité compétente** : qui répond de cette règle. Le champ pointe vers un bloc décrit plus
bas dans la fiche (ici, le ministère de l'Intérieur). C'est le champ qui distingue une règle
publiée d'un simple bout de code : quelqu'un la porte.

```jsonc
"cv:hasLegalResource": [
  { "id": "https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/",
    "title": "Code électoral",
    "dct:coverage": "Art. L.2 à L.7, L.O. 227-1" },
```

La **base légale**. Chaque texte est pointé par son adresse Légifrance, et `dct:coverage` précise
les articles concernés. La règle ne flotte pas : elle implémente des articles identifiables, et
on peut aller les lire.

```jsonc
"cpsv:hasInput": [
  { "dct:identifier": "age",
    "title": "Âge",
    "cprmv:definition": "Âge de la personne en années révolues (Art. L.3 : doit être ≥ 18).",
    "cprmv:type": "xsd:integer",
    "schema:valueRequired": true },
```

Les **entrées** : les informations dont la règle a besoin pour calculer. Chacune porte un
identifiant technique, un libellé, une **définition juridique sourcée** (pas « l'âge » en
général : l'âge au sens de l'article L.3), un type (nombre entier, oui/non...) et son caractère
obligatoire ou optionnel. C'est la partie de la fiche qui rend un simulateur constructible sans
lire le code.

Dans les fiches les plus complètes, chaque entrée est aussi classée selon sa **nature de
frontière** : fait simplement déclaré par l'usager, donnée attestée par une administration (le
revenu fiscal de référence, que la DGFiP peut servir directement), ou sortie d'une autre règle.
On y revient plus bas, car c'est le cœur de ce qu'un badge de confiance couvre réellement.

```jsonc
"cpsv:produces": [
  { "dct:identifier": "value", "title": "Éligibilité au droit de vote", ... },
  { "dct:identifier": "metadata.conditions",
    "title": "Détail des conditions évaluées", ... }
```

Les **sorties**. La première est le résultat. La seconde mérite l'attention : c'est une **sortie
d'explicabilité**, la trace de chaque condition évaluée (nationalité, âge, capacité civique...).
Utile pour expliquer un refus à un usager, exigence qui revient dans toutes les règles du
catalogue.

Suivent les blocs de contexte : le **canal d'accès** (comment on exécute la règle : un package
Python installable, une API, un dépôt de règles), et le **code source** épinglé à une révision
précise du dépôt, pas à « la dernière version » : ce que la fiche décrit ne bouge pas sous vos
pieds.

## Ce que la fiche promet, et ce qu'elle ne promet pas

Le profil de métadonnées suit une règle stricte d'honnêteté : **un champ manquant est un champ
omis, jamais une valeur inventée**. Si une fiche n'affiche pas de cas de tests, c'est qu'il n'y
en a pas de publiés. La liste des écarts entre une fiche et le profil complet est publique
(rapport de conformité généré à chaque synchronisation).

Ce que la fiche promet :

- une identité pérenne, une autorité qui répond, une base légale article par article ;
- des entrées définies juridiquement, avec leur nature (déclarée, attestée, calculée) ;
- un pointeur vers le code et les tests, à version fixée.

Ce qu'elle ne promet volontairement pas :

- **un format universel de situations de test**. Décrire « une famille avec deux enfants dont les
  revenus ont changé en cours d'année » exige le modèle du moteur de calcul (ses entités, ses
  périodes). Le catalogue référence les tests dans leur format natif, qui fait foi, et norme
  seulement leur enveloppe : qui a validé ce cas, quand, sur quel texte ;
- **une traduction automatique entre moteurs**. Les correspondances entre notions administratives
  (le « couple » de la CAF n'est pas celui de la DGFiP) sont recensées quand elles existent et
  tournent en production, jamais rédigées sur papier par le catalogue ;
- **une garantie sur l'amont des données**. C'est l'objet des régimes de certification.

## Les trois régimes de certification

Toutes les règles ne peuvent pas être garanties de la même façon, et le catalogue préfère trois
promesses tenables à une promesse uniforme intenable.

**Le régime frontière** s'applique aux règles bien délimitées : une autorité claire, peu de
dépendances (le droit de vote, une aide sectorielle). L'analogie exacte est le **rescrit
fiscal** : quand l'administration vous répond par rescrit, elle s'engage sur la réponse donnée
*aux faits que vous avez déclarés*, pas sur la véracité de vos déclarations. Ici, de même,
l'administration certifie : « à telle version, pour telles entrées déclarées, la règle produit
tels résultats ». Les cas de tests publiés sont la matérialisation de cet engagement, comme la
collection des réponses types.

**Le régime implémentation** s'applique au cœur socio-fiscal (prime d'activité, RSA...), où le
calcul dépend d'une chaîne de paramètres partagés (SMIC, bases ressources, définitions de
revenus) dont personne n'est propriétaire en entier. Pensez à un **logiciel de paie certifié** :
personne ne certifie « le calcul du bulletin de paie » dans l'absolu, on certifie que tel
logiciel, à telle version, passe telle batterie de tests. La fiche dit donc honnêtement : « la
prime d'activité *telle que calculée par openfisca-france* à tel instantané », et ce qui est
certifiable est le couple suite de tests + version.

**Le régime référencement** est l'entrée de gamme assumée : la règle existe, voici qui la porte
et où elle est écrite, sans code ni tests publiés. Une **fiche d'annuaire**, en somme. C'est le
même choix que schema.data.gouv.fr avec ses schémas en mode « documentation seule » : accueillir
l'hétérogène sans faire semblant de tout garantir.

Le régime figure dans la fiche (`rdgf:certificationRegime`), et la nature de frontière de chaque
entrée dit précisément ce que couvre un éventuel badge : certifier le calcul du droit de vote ne
certifie pas que la personne est réellement inscrite sur les listes électorales. Le badge couvre
le calcul, la frontière dit où s'arrête sa responsabilité. C'est moins spectaculaire qu'un
« certifié » sans réserve ; c'est surtout tenable, et c'est la condition pour qu'un réutilisateur
exigeant (un service public en ligne qui refuse d'afficher un montant faux) puisse s'appuyer sur
le catalogue.

## Pour aller plus loin

- Le profil complet des fiches, champ par champ : [profil-metadonnees.md](profil-metadonnees.md)
- Deux fiches d'exemple au profil complet, sur des cas réels : [propositions/](propositions/)
- La documentation lisible générée depuis chaque fiche : `documentation.md` à côté de chaque
  `metadata.jsonld` (produite par `scripts/generate-fiche-doc.mjs`)

# Scarlett

## Description

Suppression des messages datant de plus de x jours sur un canal slack.

--> [Specifications](https://pewter-word-081.notion.site/Scarlett-774b2b66bd094b949c3e07240d7751a8)


## Contraintes d'utilisation

Pour que l'application fonctionne il faut que scarlett soit ajoutée au canal à traiter.  
Sans quoi le canal apparaitra comme inexistant.  

![image](https://user-images.githubusercontent.com/58939550/163546409-f23db2dd-60d1-428e-a20e-a77f39830003.png)


## Création du token slack

### Types de token

Il existe [deux types de token](https://api.slack.com/authentication/token-types#granular_bot) que l'on peut donner à notre bot.
  - Les "bot token" commençant par `xoxb-` permettant d'agir en tant que bot (limité sur certaines actions d'administration)
  - Les "user token" commençant par `xoxp-` permettatn d'agir en tant qu'un utilisateur donné (limité aux droits de l'utilisateur, il est donc possible de ne pas être limité sur les fonctionnalités d'administration avec les bons droits)

Afin de pouvoir supprimer des messages (postés par d'autres utilisateurs que le bot) il nous faudra utiliser un "user token" pour avoir des droits d'administration, l'utilisateur dont on utilise le token doit être administrateur sur le slack afin de pouvoir supprimer des messages d'autrui.

### Assignation des scopes

Classiquement, un "user token" se récupère grâce à une authentification oauth qui nous permet de laisser l'utilisateur s'authentifier puis de récupérer le token généré par slack. 
Heureusement, il est possible de générer un token pour l'utilisateur qui a installé l'application (le bot) directement depuis l'interface d'administration de l'appli slack.

Pour se faire il faut penser à assigner des [scopes](https://api.slack.com/legacy/oauth-scopes) au token que l'on va créer.
Les scopes permettent de donner des droits spécifiques afin que notre bot puisse exécuter certaines actions.

### Génération du token

Pour générer le token il vous faudra : 
  - Accéder à la page de l'application (depuis le compte de l'utilisateur qui l'a créé, pas depuis le workspace slack)
  - Accéder à la section "OAuth & Permissions"
  - Accéder à la partie "User Token Scopes"
  - Ajouter les scopes suivants : `channels:history,channels:read,chat:write,groups:history,groups:read` (à savoir que j'ai utilisé ceux ci mais que je ne suis pas sûr que tous soient nécessaires, ne pas hésiter à en omettre s'ils ne s'avèrent pas utiles)

### Récupération du token

Une fois toutes ces choses faites, vous pouvez récupérer le "user token" dans la partie "OAuth Tokens for Your Workspace" en haut de la page "OAuth & Permissions".
Le token est à renseigner dans la valeur de la variable `SLACK_USER_TOKEN` dans le fichier `.env`.


## Configuration

| Nom                     |              Description          |                  Plage de valeur                  |
|-------------------------|---------------------------------|:--------------------------------------------------|
SLACK_USER_TOKEN          | User token récupéré depuis slack  | xoxp-XXXXXXXX                                     |
MAX_DURATION              | Nombre de jours avant aujourd'hui | environ 20 à 200                                  |
RATE_LIMIT_PAUSE_DURATION | Nombre de millisecondes de pause pour laisser souffler slack |   entre 1000 et 5000   |


## Todo

- [x] Fix deletion -> https://api.slack.com/authentication/token-types#granular_bot
- [x] Process a channels array -> [channelsId.json](channelsId.json)
- [x] Check if channel exists -> https://api.slack.com/methods/conversations.info
- [x] Gestion de la limitation slack (WIP) -> https://api.slack.com/docs/rate-limits
- [x] Do not delete pinned messages -> pinned_to, pinned_info, https://api.slack.com/events/message#stars
- [x] Check if threads are deleted -> https://api.slack.com/methods/conversations.replies/test
- [x] Refaire la condtion de check unpinned car trop bordélique.
- [x] Use sentry (WIP)


### Optimisations

- [ ] Utiliser un tableau d'id de messages à supprimer pour tout parser qu'une seule fois e éviter les problèmes de récursivité lors du traitement des threads.
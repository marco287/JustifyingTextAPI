# JustifyingTextAPI
JustifyingTextAPI est une API qui justifie par série de 80 caractères un texte qui lui est passé en paramètre.

Pour tester l'API il faut:
-Installer Postman qui est une plateforme de collaboration pour le développement des API.
-Créer une base de données SQL
-Créer une table nommée user avec deux champs id et email.
-Insérer un user dans la base de donnée 
-Installer l'environnement NodeJS
-Aller dans Postman, dans un nouvel onglet GET et taper l'URL localhost:3000/api/token
-Dans Params, il faut ajouter "email" dans le champ KEY et la valeur de l'email dans la base de donnée dans le champ VALUE.
-En réponse on a un token qui permet de justifier le texte
-Dans un nouvel onglet POST, taper l'URL localhost:3000/api/justify
-Dans Headers, il faut ajouter "authorization" comme clé et insérer le token généré dans l'onglet GET.
-Dans le Body, selectioner le bouton radio Raw et insérer le texte à justifier.

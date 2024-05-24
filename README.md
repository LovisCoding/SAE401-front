<div align="center">
	<h1>ScoNotes</h1>
	<img src="./src/assets/img/Logo_ScoNotes.png" alt="Logo de ScoNotes" width="200"/>
</div>

## Description
ScoNotes est une extension du logiciel ScoDoc, conçue pour organiser, filtrer et trier les données de manière efficace. Cette application offre une interface simplifiée, adaptée aux besoins des enseignants de tous niveaux, et permet de générer des exportations personnalisées.

## Fonctionnalités
- **Organisation des données** : Possibilité d’organiser, filtrer et trier les données.
- **Interface simplifiée** : Conçue pour être intuitive et facile à utiliser par les enseignants.
- **Importation de fichiers** : Importation de fichiers au format xlsx.
- **Visualisation des données** : Affichage et modification des données avec des changements en cascade via des triggers.
- **Exportation** : Exportation des données sous format PDF pour les avis de poursuite d’étude et xlsx pour les procès-verbaux.
- **Sécurité** : Enregistrement sécurisé des logins, encryptage des mots de passe, et utilisation de tokens pour maintenir une connexion sécurisée.

## Installation
1. **Clonez dans un premier temps le côté serveur de l'application**

	```sh
	git clone git@github.com:LovisCoding/SAE401-back.git
	```

2. **Clonez ensuite le côté client de l'application**

	```sh
	git clone git@github.com:LovisCoding/SAE401-front.git
	```

3. **Installez les dépendances du côté client**

	```sh
	cd SAE401-front
	npm install
	```

4. **Installez les dépendances du côté serveur**

	Allez suivre le README.md du côté serveur accessible [ici](https://github.com/LovisCoding/SAE401-back/blob/main/README.md)

5. **Configurez votre base de données PSQL**

	- Assurez-vous que la base de données est configurée et accessible.
	- Modifiez le fichier de configuration avec les informations de votre base de données.

6. **Lancez le serveur**

	```sh
	cd SAE401-back
	php api start
	```

7. **Lancez l'application**

	```sh
	cd SAE401-front
	npm start
	```

## Utilisation

### Connexion

- Accédez à la page de connexion et entrez vos identifiants.
- Les administrateurs peuvent enregistrer de nouveaux logins et gérer les utilisateurs.

### Importation de fichiers

- Importez des fichiers xlsx via la page d'importation.
- Utilisez l'API de ScoDoc pour des importations futures.

### Visualisation et modification

- Visualisez et modifiez les données importées.
- Utilisez des triggers pour gérer les modifications en cascade.

### Exportation

- Exportez les données en PDF pour les avis de poursuite d’étude ou en xlsx pour les procès-verbaux.
- Sélectionnez un semestre ou un étudiant spécifique pour des exportations ciblées.

### Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript
- **Backend** : PHP
- **Base de données** : SQL
# ParaTech — Gestion Technique de Matériel Parachutiste

## Problem Statement
Application de bureau (web app destinée à être encapsulée en .exe Windows via Electron/Tauri) pour la GESTION TECHNIQUE de matériel parachutiste. Interface blanche/bleue, hors-ligne, données locales (localStorage), aucune notion de personne/perception. Français.

## Architecture
- **Frontend only** — React 19 + Tailwind + shadcn/ui + Sonner + Lucide icons
- **Stockage** : localStorage sous clé `paratech.db.v1` (JSON unique)
- **Aucun backend utilisé** pour les données. FastAPI/Mongo présents mais inutilisés.
- **Routing** : react-router-dom (Home / nouveau / parachute/:id / archives / maintenance / parametres / imprimer)

## Data model (localStorage)
```
{
  version, settings: { reservePackValidityMonths=12, warningDays=30, parachuteTypes[], voileTypes[], secoursTypes[], aadTypes[] },
  parachutes: [{ id, type, reference, status, archived, observations, createdAt,
    sac{serialNumber,manufacturingDate,observations},
    voilePrincipale{type,serialNumber,manufacturingDate,totalJumps,jumpsSinceCone,lastConeChangeDate,observations,coneHistory[]},
    voileSecours{type,serialNumber,manufacturingDate,lastPackDate,validityDate,observations,packHistory[]},
    appareilSecurite{type,brand,model,serialNumber,manufacturingDate,expiryDate,observations},
    maintenance[], reparation[], history[] }]
}
```

## Implemented (Feb 2026)
- Page d'accueil = liste des parachutes en longs rectangles horizontaux (aucun compteur global)
- Chaque rectangle : SAC / VOILE PRINCIPALE / VOILE DE SECOURS / APPAREIL DE SÉCURITÉ + badges validité 🟢🟠🔴 auto
- Recherche instantanée (n° série sac/VP/VS/AAD + type)
- Filtres : Statut (En service, En maintenance, En réparation, Prochaine péremption, Expirés) + Type (BOI/TANDEM/Autre, dynamique)
- Bouton "+ Ajouter" → formulaire complet (Parachute, Sac, Voile P., Voile S., AAD, Observations) avec DatePicker shadcn
- Fiche détaillée : 4 cartes cliquables (Sheet) : Sac, Voile P., Voile S., AAD
- Voile principale : compteur total + compteur depuis dernier changement de cône (distincts), bouton +1 saut, modifier sauts, nouveau changement de cône (reset compteur cône, total inchangé), historique cône
- Voile secours : nouveau pliage (validité auto = pack + settings.reservePackValidityMonths), historique
- AAD : observations + badge validité auto
- Maintenance / Réparation : ajout entrées avec date, motif, observation, date remise en service ; statut du parachute mis à jour ; historique
- Statut général (EN SERVICE / EN MAINTENANCE / EN RÉPARATION / INDISPONIBLE / EXPIRÉ / ARCHIVÉ)
- Archivage / désarchivage
- Historique technique (création, modification, saut, cône, pliage, maintenance, réparation, statut, archivage) — aucune mention de personne
- Impression A4 : fiche parachute complète + listes filtrées (via /imprimer/liste/:filter)
- Sauvegarde/Restauration : export JSON téléchargeable + import JSON (avec confirmation)
- Réinitialiser avec données exemple (3 parachutes seed : BOI Mirage G4, TDM Sigma, BOI Vector 3)
- Paramètres : durée validité pliage (mois), seuil péremption proche (jours), types éditables

## Backlog / P1
- Encapsulation Electron/Tauri (guide à fournir séparément)
- Impression par section (fiche voile principale seule, fiche secours seule…) — actuellement fiche complète
- Rappels visuels dashboard (bandeau top des matériels critiques)
- Compteur "+5 sauts" rapide
- Filtre "Archivés" accessible depuis liste principale (actuellement page dédiée)

## Next tasks
- Testing E2E
- Documentation build/packaging Electron


## 2026-06 — Correction affichage sauts
- Page principale : Harnais (nom, N° série), Voile principale (nom, N° série, nombre de sauts), Voile de secours (nom, N° série, badge), Appareil de sécurité (nom/modèle, N° série, validité/péremption, badge).
- Fiche Appareil de sécurité : ajout du champ `appareilSecurite.totalJumps`, affiché et modifiable (setAadJumps dans storage.js), + champ dans le formulaire ajout/modif et fiche imprimable.
- Reste à faire : vérifier import fichier à imprimer (AppHeader), supprimer ArchivesPage orpheline, sauvegarde/restauration, guide .exe.
- 2026-06 : menus déroulants Type remplacés par zones de texte libres (parachute, harnais, appareil), libellés 'Nom'.
- 2026-06 : palette de 10 couleurs par type de parachute dans Paramètres (settings.parachuteTypeColors, lib/typeColors.js), appliquée aux bulles type (page principale + fiche).
- 2026-06 : section 'Types de harnais' supprimée des paramètres.
- 2026-06 : suppression Types AAD des paramètres ; AAD = un seul champ Nom/Modèle ; voile de secours : compteurs pliages (packCount, +1 auto à chaque pliage) et ouvertures (openingCount), modifiables dans la fiche.
- 2026-06 : bouton Modifier global retiré de la fiche parachute ; bouton Modifier + formulaire inline (SectionEditor) dans chaque fiche Harnais / VP / VS / AAD.
- 2026-06 : option 'Imprimer un fichier' retirée du menu déroulant.
- 2026-06 : libellé 'Depuis dernier changement de cône' → 'Cône actuel' (ajout saut incrémente total + cône actuel).
- 2026-06 : feuilles PDF personnalisées par parachute (IndexedDB, lib/sheets.js, composant SheetsSettings dans Paramètres) ; Imprimer affiche uniquement la feuille si présente, sinon la fiche générée.
- 2026-06 : préparation Electron (electron/main.js, scripts electron:*, HashRouter, homepage '.'), guide /app/GUIDE_MAC.md.

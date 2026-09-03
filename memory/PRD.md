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

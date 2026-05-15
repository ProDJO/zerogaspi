# 🗺️ Zerogaspi — Roadmap

Document de pilotage du projet. Listes des étapes et features.

---

## ✅ Done

- [x] Backend : Auth (JWT), Users, Products (CRUD + image), Reservations
- [x] Frontend : structure React + Vite
- [x] Frontend : Login, liste produits, réservations, dashboard admin V1
- [x] Étape A : React Router + AuthContext + 4 pages structurées

## 🎯 In progress

- [ ] Étape A : merge PR + cleanup branches

## ⏳ Up next (priorité haute — fondations)

- [ ] Étape B : persistance du token dans localStorage
- [ ] Étape C : page Register (inscription utilisateur — rôles client / vendeur)

## 📋 Backlog (cahier des charges)

### Rôles utilisateurs
- [ ] Étape D : Rôle Vendeur (dashboard, publier produit, voir commandes, suivi ventes)
- [ ] Étape E : Rôle Livreur (consulter livraisons, accepter, mettre à jour statut)

### Fonctionnalités métier
- [ ] Étape F : Paiement (simulation conforme au cahier des charges)
- [ ] Étape G : Évaluations vendeurs + commentaires
- [ ] Étape G' : Signalements + traitement par admin
- [ ] QR Code de retrait (cf. cahier des charges §18.1.1)
- [ ] Règle d'annulation 60 min (cf. cahier des charges)

### Dashboard Admin avancé
- [ ] Étape H — Statistiques :
  - [ ] Vue d'ensemble (KPIs : users, produits, réservations, CA)
  - [ ] Graphique évolution réservations sur 30 jours
  - [ ] Top 10 produits les plus réservés
  - [ ] Répartition utilisateurs par rôle (camembert)
  - [ ] Top clients les plus actifs
  - [ ] Derniers inscrits
  - [ ] Alertes (signalements en attente, vendeurs à valider)
- [ ] Validation des vendeurs par l'admin
- [ ] Gestion des utilisateurs (suspendre, supprimer)

### Qualité & Production
- [ ] Étape I : Design system (Tailwind CSS, responsive, palette anti-gaspi)
- [ ] Étape J : Sécurité avancée (JWT_SECRET en .env, refresh token, HTTPS)
- [ ] Étape K : Tests (unitaires backend, intégration)
- [ ] Étape L : Déploiement (frontend Vercel/Netlify, backend Render/Railway, DB Supabase/Neon)
- [ ] Notifications (email + in-app)
- [ ] Recherche et filtres produits (par catégorie, par localisation)

---

## 📝 Notes & décisions

- 2026-05-15 : Choix de **localStorage** pour la persistance JWT (et non cookies httpOnly) — acceptable pour MVP, à revoir en Étape J.
- 2026-05-15 : Design repoussé à la Phase 2 (après features) pour ne pas se disperser.
- 2026-05-15 : Idée des graphiques admin notée — sera implémentée à l'Étape H, quand on aura assez de vraies données pour qu'ils soient significatifs.
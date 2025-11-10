#!/usr/bin/env pwsh
# Script de reset complet de la base de données et redémarrage du serveur

Write-Host "🔄 Arrêt de tous les conteneurs et suppression des volumes..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "`n🐘 Démarrage de PostgreSQL..." -ForegroundColor Cyan
docker-compose up -d db

Write-Host "`n⏳ Attente de 10 secondes pour que PostgreSQL soit prêt..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "`n✅ Vérification de la base de données..." -ForegroundColor Green
docker exec batala_vitrine_db psql -U postgres -d batala_vitrine -c "SELECT COUNT(*) as nb_blocks FROM blocks;" 2>$null

Write-Host "`n✅ Test du mot de passe admin..." -ForegroundColor Green
node scripts/test-password.js

Write-Host "`n🚀 Base de données prête!" -ForegroundColor Green
Write-Host "`nVous pouvez maintenant démarrer le serveur avec:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Cyan

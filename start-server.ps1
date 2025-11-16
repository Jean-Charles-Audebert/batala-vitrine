# Script pour lancer le serveur dans un terminal séparé
Write-Host "Lancement du serveur dans un terminal séparé..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"
Write-Host "Serveur lancé ! Attendez 3 secondes pour qu'il démarre..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "✅ Serveur prêt sur http://localhost:3000" -ForegroundColor Green

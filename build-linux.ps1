# EVIDENRA Professional - Linux Build Script
# Dieses Script muss als Administrator ausgef�hrt werden

Write-Host "EVIDENRA Professional - Linux Build" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Pr�fe ob das Script als Administrator l�uft
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Dieses Script ben�tigt Administrator-Rechte!" -ForegroundColor Red
    Write-Host "Starte Script mit erh�hten Rechten..." -ForegroundColor Yellow

    # Starte das Script neu mit Administrator-Rechten
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "Script l�uft mit Administrator-Rechten" -ForegroundColor Green
Write-Host ""

# Wechsle ins Projekt-Verzeichnis
$projectPath = Split-Path -Parent $PSCommandPath
Set-Location $projectPath

Write-Host "Projektverzeichnis: $projectPath" -ForegroundColor Cyan
Write-Host ""

# F�hre den Linux Build aus
Write-Host "Starte Linux Build..." -ForegroundColor Yellow
Write-Host ""

try {
    npm run dist:linux

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "Build erfolgreich abgeschlossen!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Die Linux AppImage finden Sie hier:" -ForegroundColor Cyan
        Write-Host "$projectPath\release\EVIDENRA-Professional-Linux.AppImage" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
        Write-Host "Exit Code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "Fehler beim Build:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Dr�cken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

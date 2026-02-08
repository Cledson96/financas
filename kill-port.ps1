param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "Procurando processo na porta $Port..." -ForegroundColor Cyan

$connection = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"

if (-not $connection) {
    Write-Host "Nenhum processo encontrado na porta $Port" -ForegroundColor Red
    exit 0
}

$line = $connection -split "\s+"
$procId = $line[$line.Length - 1]
$processName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName

Write-Host "Processo encontrado: $processName (PID: $procId)" -ForegroundColor Yellow
Write-Host "Encerrando..." -ForegroundColor Cyan

try {
    Stop-Process -Id $procId -Force
    Write-Host "Processo encerrado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
}

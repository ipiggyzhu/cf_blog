# Download tororo (white cat) model files
$baseUrl = "https://raw.githubusercontent.com/iCharlesZ/vscode-live2d-models/master/model-library/tororo"

Write-Host "Downloading tororo (white cat) model files..."

# Download tororo files
$files = @(
    "moc/tororo.moc",
    "moc/tororo.2048/texture_00.png", 
    "tororo.pose.json",
    "mtn/00_idle.mtn",
    "mtn/01.mtn",
    "mtn/02.mtn",
    "mtn/03.mtn",
    "mtn/04.mtn",
    "mtn/05.mtn",
    "mtn/06.mtn",
    "mtn/07.mtn",
    "mtn/08.mtn"
)

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $localPath = "docs/public/live2d/models/black-cat/$file"
    $localDir = Split-Path $localPath -Parent
    
    if (!(Test-Path $localDir)) {
        New-Item -ItemType Directory -Path $localDir -Force | Out-Null
    }
    
    try {
        Write-Host "Downloading: $file"
        Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
        Write-Host "Success: $file"
    }
    catch {
        Write-Host "Failed: $file" -ForegroundColor Red
    }
}

Write-Host "Tororo model download completed!"

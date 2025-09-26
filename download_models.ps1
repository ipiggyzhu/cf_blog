# Download Live2D model files
$baseUrl = "https://raw.githubusercontent.com/iCharlesZ/vscode-live2d-models/master/model-library"

Write-Host "Downloading HK416-1-destroy model files..."

# Download HK416-1-destroy files
$files = @(
    "model.moc",
    "model.1024/texture_00.png",
    "motions/daiji_idle_02.mtn",
    "motions/broken_1.mtn",
    "motions/broken_2.mtn",
    "motions/broken_3.mtn",
    "motions/broken_4.mtn",
    "motions/broken_5.mtn",
    "physics.json"
)

$hk416Base = "$baseUrl/girls-frontline/HK416-1/destroy"
foreach ($file in $files) {
    $url = "$hk416Base/$file"
    $localPath = "docs/public/live2d/models/HK416-1-destroy/$file"
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

Write-Host "Download completed!"

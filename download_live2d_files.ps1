# Live2D模型文件下载脚本
$baseUrl = "https://raw.githubusercontent.com/iCharlesZ/vscode-live2d-models/master/model-library"

# HK416-1-destroy模型文件
$hk416DestroyBase = "$baseUrl/girls-frontline/HK416-1/destroy"
$hk416DestroyFiles = @(
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

Write-Host "Downloading HK416-1-destroy model files..."
foreach ($file in $hk416DestroyFiles) {
    $url = "$hk416DestroyBase/$file"
    $localPath = "docs/public/live2d/models/HK416-1-destroy/$file"
    $localDir = Split-Path $localPath -Parent
    
    if (!(Test-Path $localDir)) {
        New-Item -ItemType Directory -Path $localDir -Force | Out-Null
    }
    
    try {
        Write-Host "  下载: $file"
        Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
        Write-Host "  成功: $file"
    }
    catch {
        Write-Host "  失败: $file - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 白猫(tororo)模型文件
$tororoBase = "$baseUrl/tororo"
$tororoFiles = @(
    "tororo.moc",
    "tororo.1024/texture_00.png",
    "motions/idle_01.mtn",
    "motions/idle_02.mtn",
    "motions/idle_03.mtn"
)

Write-Host "`n下载白猫(tororo)模型文件..."
foreach ($file in $tororoFiles) {
    $url = "$tororoBase/$file"
    $localPath = "docs/public/live2d/models/black-cat/$file"
    $localDir = Split-Path $localPath -Parent
    
    if (!(Test-Path $localDir)) {
        New-Item -ItemType Directory -Path $localDir -Force | Out-Null
    }
    
    try {
        Write-Host "  下载: $file"
        Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
        Write-Host "  成功: $file"
    }
    catch {
        Write-Host "  失败: $file - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nLive2D模型文件下载完成！"

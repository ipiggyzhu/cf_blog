@echo off
echo 正在创建Live2D模型目录...

mkdir "docs\public\live2d\models\black-cat" 2>nul
mkdir "docs\public\live2d\models\HK416-1-destroy" 2>nul
mkdir "docs\public\live2d\models\senko" 2>nul
mkdir "docs\public\live2d\models\HK416" 2>nul

echo 开始下载Live2D模型文件...

echo 下载黑猫模型...
curl -L "https://model.hacxy.cn/cat-black/model.json" -o "docs\public\live2d\models\black-cat\model.json"
curl -L "https://model.hacxy.cn/cat-black/texture_00.png" -o "docs\public\live2d\models\black-cat\texture_00.png"

echo 下载HK416-1-destroy模型...
curl -L "https://raw.githubusercontent.com/iCharlesZ/vscode-live2d-models/master/model-library/girls-frontline/HK416-1/destroy/model.json" -o "docs\public\live2d\models\HK416-1-destroy\model.json"

echo 下载senko模型...
curl -L "https://model.hacxy.cn/Senko_Normals/senko.model3.json" -o "docs\public\live2d\models\senko\senko.model3.json"

echo 下载HK416模型...
curl -L "https://model.hacxy.cn/HK416-1-normal/model.json" -o "docs\public\live2d\models\HK416\model.json"

echo Live2D模型下载完成！
pause

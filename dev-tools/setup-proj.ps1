param (
    [switch] $Build = $false
)
$CurrDir = $PWD
$ProjDir = (Get-Item $PSScriptRoot).Parent.Parent.Parent.FullName

function CheckPackages {
    Write-Host "Check pnpm" -ForegroundColor Green
    npm list -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Install pnpm" -ForegroundColor Green
        npm i -g pnpm
    }
}

function BuildLibrary {
    Set-Location "C:\Workspace"

    Write-Host "Check tmp folder" -ForegroundColor Green
    if (-not (Test-Path "tmp")) {
        Write-Host "Create tmp folder" -ForegroundColor Green
        New-Item "tmp" -ItemType Directory
    }
    Set-Location "tmp"

    Write-Host "Check pixi-spine-tmp repo" -ForegroundColor Green
    if (Test-Path "pixi-spine-tmp") {
        Write-Host "Delete existing pixi-spine-tmp repo" -ForegroundColor Green
        Remove-Item "pixi-spine-tmp" -Recurse -Force
    }

    Write-Host "Clone pixi-spine-tmp repo from github" -ForegroundColor Green
    git clone --depth=1 https://github.com/hmpthz/pixi-spine-tmp.git
    if ($LASTEXITCODE -ne 0) { throw "Error" }
    Set-Location "pixi-spine-tmp"

    Write-Host "Check @microsoft/rush" -ForegroundColor Green
    npm list -g @microsoft/rush
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Install @microsoft/rush" -ForegroundColor Green
        npm i -g @microsoft/rush
    }

    Write-Host "Run `"rush update`"" -ForegroundColor Green
    rush update
    if ($LASTEXITCODE -ne 0) { throw "Error" }
    Write-Host "Run `"npm install`"" -ForegroundColor Green
    npm i
    if ($LASTEXITCODE -ne 0) { throw "Error" }
    Write-Host "Run `"npm run build`"" -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error" }
}

function SetupProject {
    Set-Location $ProjDir
    Write-Host "Run `"pnpm install`"" -ForegroundColor Green
    pnpm i
    if ($LASTEXITCODE -ne 0) { throw "Error" }
}

try {
    CheckPackages
    if ($Build) {
        BuildLibrary
    }
    SetupProject
}
catch {
    Write-Host "Project setup failed!" -ForegroundColor Red
}
finally {
    Set-Location $CurrDir
}

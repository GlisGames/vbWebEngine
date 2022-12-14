param (
    [switch] $Build = $false,
    [switch] $Reinstall = $false
)
$CurrDir = $PWD
$ProjDir = (Get-Item $PSScriptRoot).Parent.Parent.Parent.FullName

function CheckNodeVersion {
    $Result = node -v
    $Result = $Result.SubString(1).Split(".")
    $Major = [int]$Result[0]
    $Minor = [int]$Result[1]
    Write-Host ("Node.js Major version:{0}; Minor version:{1}" -f $Major, $Minor) -ForegroundColor Green
    if ($Major -ne 16 -or $Minor -ne 17) {
        throw "Please nstall Node.js v16.17.xx!"
    }
}

function CheckPackages {
    Write-Host "Check git" -ForegroundColor Green
    git --version
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
        New-Item "tmp" -ItemType Directory -ErrorAction Stop
    }
    Set-Location "tmp"

    Write-Host "Check pixi-spine-tmp repo" -ForegroundColor Green
    if (Test-Path "pixi-spine-tmp") {
        Write-Host "Delete existing pixi-spine-tmp repo" -ForegroundColor Green
        Remove-Item "pixi-spine-tmp" -Recurse -Force -ErrorAction Stop
    }

    Write-Host "Clone pixi-spine-tmp repo from github" -ForegroundColor Green
    git clone --depth=1 https://github.com/hmpthz/pixi-spine-tmp.git
    if ($LASTEXITCODE -ne 0) { throw "Error running `"git clone`"" }
    Set-Location "pixi-spine-tmp"

    Write-Host "Check @microsoft/rush" -ForegroundColor Green
    npm list -g @microsoft/rush
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Install @microsoft/rush" -ForegroundColor Green
        npm i -g @microsoft/rush
    }

    Write-Host "Run `"rush update`"" -ForegroundColor Green
    rush update
    if ($LASTEXITCODE -ne 0) { throw "Error running `"rush update`"" }
    Write-Host "Run `"npm run build`"" -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error running `"npm run build`"" }
}

function SetupProject {
    Set-Location $ProjDir

    if ($Build -or $Reinstall) {
        Write-Host "Check node_modules and pnpm-lock.yaml" -ForegroundColor Green
        if (Test-Path "node_modules") {
            Write-Host "Delete existing node_modules" -ForegroundColor Green
            Remove-Item "node_modules" -Recurse -Force -ErrorAction Stop
        }
        if (Test-Path "pnpm-lock.yaml") {
            Remove-Item "pnpm-lock.yaml" -Recurse -Force -ErrorAction Stop
        }
    }

    Write-Host "Run `"pnpm install`"" -ForegroundColor Green
    pnpm i
    if ($LASTEXITCODE -ne 0) { throw "Error running `"pnpm install`"" }

    Write-Host "Run `"pnpm run type-check`"" -ForegroundColor Green
    pnpm run type-check
    if ($LASTEXITCODE -ne 0) { throw "Type check failed!" }
}

try {
    CheckNodeVersion
    CheckPackages
    if ($Build) {
        BuildLibrary
    }
    SetupProject
    Write-Host "Project setup succeeded!" -ForegroundColor Green
}
catch {
    Write-Host $PSItem.Exception.Message -ForegroundColor Red
    Write-Host "Project setup failed!" -ForegroundColor Red
}
finally {
    Set-Location $CurrDir
}

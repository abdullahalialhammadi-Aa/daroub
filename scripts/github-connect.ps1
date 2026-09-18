# Connects this checkout to GitHub and pushes main.
# Usage (PowerShell, from the project folder):  .\scripts\github-connect.ps1
# Idempotent: signs in only when needed, adds the remote only when missing, then pushes.
$ErrorActionPreference = 'Stop'
$repo = 'ifritliwa/daroub'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) { $gh = (Get-Command gh -ErrorAction SilentlyContinue).Source }
if (-not $gh) { Write-Host 'Installing GitHub CLI...'; winget install --id GitHub.cli -e --silent --accept-source-agreements --accept-package-agreements | Out-Null; $gh = 'C:\Program Files\GitHub CLI\gh.exe' }
Set-Location (Split-Path $PSScriptRoot -Parent)

# 1. Sign in (device flow: a code is shown, approve it in the browser). The workflow scope lets CI files be pushed.
& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) { & $gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key --scopes 'repo,workflow' }
$scopes = (& $gh auth status 2>&1 | Out-String)
if ($scopes -notmatch 'workflow') { & $gh auth refresh --hostname github.com --scopes workflow }

# 2. Route git credentials through the CLI and make sure the remote exists.
& $gh auth setup-git
if (-not (git remote 2>$null | Select-String -Quiet '^origin$')) { git remote add origin "https://github.com/$repo.git" }

# 3. Push the current branch and show the latest CI run.
git push -u origin HEAD
& $gh run list --limit 1
Write-Host "Connected: https://github.com/$repo"

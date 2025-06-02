<#
  .SYNOPSIS
    Install textlint, markdownlint, and cspell for writers, and copy config files

  .DESCRIPTION
    - Installs common textlint rules, markdownlint-cli2, and cspell
    - Copies .textlintrc.yaml, .markdownlint.yaml, .textlint/, .vscode/ from specified templates directory

  .NOTES
    @Version  1.4.1
    @Author   atsushifx <https://github.com/atsushifx>
    @Since    2025-02-07
    @License  MIT https://opensource.org/licenses/MIT
#>
# Script settings (comment)
#region Functions

# Script Parameters
Param (
    [switch]$Global = $false,
    [string]$TemplateDir = "./templates",
    [string]$DestinationDir = "."
)

# settings
Set-StrictMode -Version Latest

<#
    .SYNOPSIS
    Install linter & checker packages using pnpm

    .DESCRIPTION
    Installs packages like textlint, markdownlint-cli2, cspell with rules.
#>
function Install-LinterAndCheckers {
    <#
      .PARAMETER DestinationDir
        Directory where pnpm install will be executed (for local installs)
    #>
    param (
        [switch]$Global = $false,
        [string]$TemplateDir = "./templates",
        [string]$DestinationDir = "."
    )

    if (-not $Global) {
        Push-Location $DestinationDir
    }

    $packagesWithComments = @(
        # textlint & rules
        "textlint",
        "textlint-filter-rule-allowlist",
        "textlint-filter-rule-comments",
        "textlint-rule-preset-ja-technical-writing",
        "textlint-rule-preset-ja-spacing",
        "textlint-rule-ja-no-orthographic-variants",
        "@textlint-ja/textlint-rule-no-synonyms",
        "sudachi-synonyms-dictionary",
        "@textlint-ja/textlint-rule-morpheme-match",
        "textlint-rule-ja-hiraku",
        "textlint-rule-no-mixed-zenkaku-and-hankaku-alphabet",
        "textlint-rule-common-misspellings",
        "@proofdict/textlint-rule-proofdict",
        "textlint-rule-prh",

        # markdown lint
        "markdownlint-cli2",

        # spell checker
        "cspell"
    )

    $packages = $packagesWithComments | Where-Object { $_ -notmatch "^\s*#" }
    $flag = if ($Global) { "--global" } else { "--save-dev" }
    $command = "pnpm add $flag " + ($packages -join " ")
    Write-Host "📦 Installing linter & checker packages in: $DestinationDir"
    Invoke-Expression $command

    if (-not $Global) {
        Pop-Location
    }

    Write-Host "✅ Packages installed."
}

<#
    .SYNOPSIS
     Copy configuration files for linter and checker tools

    .PARAMETER TemplateDir
    The source directory where the config templates are stored.

    .PARAMETER DestinationDir
    The target directory to copy the config files into.
#>
function Copy-LinterAndCheckerConfigs {
    param (
        [string]$TemplateDir = "./templates",
        [string]$DestinationDir = "."
    )

    Write-Host "📂 Copying configuration files from: $TemplateDir to $DestinationDir"

    $configs = @(
        ".textlintrc.yaml",
        ".markdownlint.yaml",
        ".textlint",
        ".vscode"
    )

    foreach ($item in $configs) {
        $src = Join-Path $TemplateDir $item
        $dst = Join-Path $DestinationDir $item

        if (Test-Path $src) {
            if (-not (Test-Path $dst)) {
                if ((Get-Item $src).PSIsContainer) {
                    Write-Host "📁 Copying directory via RoboCopy: $item"
                    robocopy $src $dst /E /XC /XN /XO /NFL /NDL /NJH /NJS | Out-Null
                    Write-Host "✅ Directory copied: $item"
                }
                else {
                    Copy-Item $src -Destination $dst
                    Write-Host "📝 Copied file: $item"
                }
            }
            else {
                Write-Host "🔁 Skipped (already exists): $item"
            }
        }
        else {
            Write-Host "⚠️ Not found in templates: $item"
        }
    }
}

<#
    .SYNOPSIS
    Main routine for installing tools and copying configs

    .DESCRIPTION
    Calls both Install-LinterAndCheckers and Copy-LinterAndCheckerConfigs with shared parameters.

    .PARAMETER Global
    Whether to install packages globally or locally.

    .PARAMETER TemplateDir
    Source directory for configuration files.
#>
function local:main {
    param (
        [switch]$Global = $false,
        [string]$TemplateDir = "./templates",
        [string]$DestinationDir = "."
    )

    Install-LinterAndCheckers -Global:$Global -TemplateDir:$TemplateDir -DestinationDir:$DestinationDir
    Copy-LinterAndCheckerConfigs -TemplateDir:$TemplateDir -DestinationDir:$DestinationDir
}

# call with parameters
main -Global:$Global -TemplateDir:$TemplateDir -DestinationDir:$DestinationDir

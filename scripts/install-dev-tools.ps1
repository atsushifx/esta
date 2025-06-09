<#
.SYNOPSIS
    開発支援ツールとコミットフック (lefthook) を一括インストールするスクリプト

.DESCRIPTION
    このスクリプトは、Scoop と pnpm を使用して、
    開発ワークフローをサポートする複数のツールを一括インストールします。
    pnpm では --global オプションを使用し、プロジェクトによらずに使用できるようにします。

.NOTES
    @Version  1.3.1
    @Since    2025-04-18
    @Author   atsushifx <https://github.com/atsushifx>
    @License  MIT <https://opensource.org/licenses/MIT>
#>

#region Parameters
Param (
    [switch]$Global = $false,
    [string]$DestinationDir = "."
)
#endregion

#region StrictMode and Settings
Set-StrictMode -Version Latest
#endregion

#region Functions

function Install-ScoopTools {
    Write-Host "📦 Installing tools via Scoop..."

    $tools = @(
        # Git hook
        "lefthook",

        # コードフォーマッター
        "dprint",

        # 機密情報チェック
        "gitleaks",
    )

    foreach ($tool in $tools) {
        if ($tool -notmatch "^\s*#") {
            Write-Host "🔧 Installing: $tool"
            scoop install $tool
        }
    }

    Write-Host "✅ Scoop tools installed."
}

<#
.SYNOPSIS
    pnpmで開発用パッケージをインストールする

.PARAMETER Global
    パッケージをグローバルにインストールするかどうか

.PARAMETER DestinationDir
    ローカルインストール時にインストール先とするディレクトリ
#>
function Install-PnpmDevTools {
    param (
        [switch]$Global = $false,
        [string]$DestinationDir = "."
    )

    $devPackagesRaw = @(
        # コミットメッセージ検証
        "commitlint",
        "@commitlint/cli",
        "@commitlint/config-conventional",
        "@commitlint/types",

        # 機密チェック
        "secretlint",
        "@secretlint/secretlint-rule-preset-recommend",

        # スペルチェック
        "cspell"
    )

    $devPackages = $devPackagesRaw | Where-Object { $_ -notmatch "^\s*#" }

    $flag = if ($Global) { "--global" } else { "--save-dev" }
    $command = "pnpm add $flag " + ($devPackages -join " ")

    if (-not $Global) {
        Write-Host "📁 Switching to: $DestinationDir"
        Push-Location $DestinationDir
    }

    Write-Host "📦 Installing development tools using pnpm ($flag)"
    Invoke-Expression $command

    if (-not $Global) {
        Pop-Location
    }

    Write-Host "✅ pnpm packages installed."
}

<#
.SYNOPSIS
    スクリプトのメインエントリーポイント

.DESCRIPTION
    Scoopとpnpmを使って必要なツールを一括でインストールします。
#>
function local:main {
    param (
        [switch]$Global = $false,
        [string]$DestinationDir = "."
    )

    Install-ScoopTools
    Install-PnpmDevTools -Global:$Global -DestinationDir:$DestinationDir
}

#endregion

# 実行エントリーポイント
main -Global:$Global -DestinationDir:$DestinationDir

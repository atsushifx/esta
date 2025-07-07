# src: scripts/common/CommonFunctions.ps1
# @(#) : common function library
#
# Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT


function commandExists {
    param (
        [string]$command
    )

    try {
        & $command --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

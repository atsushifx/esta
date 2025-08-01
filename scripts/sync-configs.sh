#!/usr/bin/env bash
## src: ./scripts/sync-configs.sh
# @(#) : Sync shared config files into target directory (by type)
#
# Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# Description <<
#   Sync shared config files to sub repository root.
#
# Usage:
#   ./scripts/sync-configs.sh <target_dir> <config_type> [--dry-run]
#   config_type: secretlint | package |all
#
#<<

set -euCo pipefail

##  Constants
readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)"
readonly CONFIG_DIR="${REPO_ROOT}/base/configs"
readonly SCRIPT_SYNC="${REPO_ROOT}/scripts/sync-package-scripts.ts"

## Global Flags
FLAG_DRY_RUN=false

##  Functions

# copy config files to target directory/target files
copy_config() {
  local src_file="$1"
  local dest_file="$2"
  local target_dir="$3"

  if $FLAG_DRY_RUN; then
    echo "  💡 (dry-run) Would copy: ${src_file} → ${dest_file}"
  else
    cp "${CONFIG_DIR}/${src_file}" "${target_dir}/${dest_file}"
    echo "  ✅ ${dest_file} ← ${src_file}"
  fi
}

# copy config files by config files map
copy_config_files() {
  local -n ref_config_files=$1
  local target_dir="$2"

  for mapping in "${ref_config_files[@]}"; do
    IFS=':' read -r src dest <<< "$mapping"
    copy_config "$src" "$dest" "$target_dir"
  done
}

# sync config files calling by config type
sync_config_type() {
  local config_type="$1"
  local target_dir="$2"
  local config_files

  case "$config_type" in
    secretlint)
      config_files=("secretlint.config.base.yaml:configs/secretlint.config.yaml")
      copy_config_files config_files "$target_dir"
      ;;
    package)
      echo "🔧 [package.json:scripts]"
      DRY_RUN=""
      $FLAG_DRY_RUN && DRY_RUN="--dry-run"
      pnpm exec tsx "$SCRIPT_SYNC" "$target_dir" "$REPO_ROOT" "$DRY_RUN"
      ;;

    *)
      echo "❌ Unknown config_type: $config_type"
      echo "   Must be one of: secretlint | all"
      return 1
      ;;
  esac
}

## functions from options

# show usage from the top of this script
print_usage() {
  sed -n 's/^# \{0,1\}//p; /^<<$/q' "$0"
}

## Main Routine
main() {
  local target_dir="${1:-}"
  local config_type="${2:-}"
  local third_arg="${3:-}"

  # 💡 引数がない・または --help/-h のとき usage を出力して終了
  if [[ -z "$target_dir" || -z "$config_type" || "$target_dir" == "--help" || "$target_dir" == "-h" ]]; then
 	  print_usage
    exit 0
  fi

  if [[ "$third_arg" == "--dry-run" ]]; then
    FLAG_DRY_RUN=true
  fi

  if [[ ! -d "$target_dir" ]]; then
    echo "❌ Target directory does not exist: $target_dir"
    exit 1
  fi

  echo "📦 Syncing configs ${CONFIG_DIR} to: $target_dir"
  $FLAG_DRY_RUN && echo "🚫 Dry run mode is active. No files will be written."


  if [[ "$config_type" == "all" ]]; then
    local config_types=( "secretlint" "package")
    for type in "${config_types[@]}"; do
      echo "🔧 [$type]"
      sync_config_type "$type" "$target_dir" || exit 1
    done
  else
    sync_config_type "$config_type" "$target_dir" || exit 1
  fi

  echo "🎉 Sync complete!"
}

main "$@"

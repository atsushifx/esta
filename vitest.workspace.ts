import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./shared/configs/vitest.config.base.ts",
  "./shared/common/configs/vitest.config.unit.ts",
  "./shared/common/configs/vitest.config.ci.ts",
  "./packages/@ag-utils/get-platform/configs/vitest.config.unit.ts",
  "./packages/@ag-utils/get-platform/configs/vitest.config.ci.ts",
  "./packages/@aglabo-actions/tool-installer/configs/vitest.config.unit.ts",
  "./packages/@aglabo-actions/tool-installer/configs/vitest.config.ci.ts"
])

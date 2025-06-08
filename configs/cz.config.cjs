// src: configs/cz.config.cjs
// @(#) : commitizen configuration for this workspace
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint-disable @typescript-eslint/no-require-imports */
// 基本設定
const { baseCzConfig } = require('../shared/configs/cz.config.base.cjs');

// 設定
module.exports = {
  ...baseCzConfig,

  // 任意の拡張（ﾌﾟvﾛ詐ﾞWｪFｸNﾄg固有）

  prompt: {
    ...baseCzConfig.prompt,
    alias: {
      ...baseCzConfig.prompt.alias,
    },
    messages: {
      ...baseCzConfig.prompt.messages,
      subject: 'この変更の要約を短く（72文字以内）入力してください:',
    },
  },
};

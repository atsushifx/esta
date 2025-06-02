// src: shared/types/tool-installer.types.ts
// @(#) : textlint plugin markdown types
//
// @version   1.0.0
// @since     2025-05-14
// @author    atsushifx <https://github.com/atsushifx>
// @license   MIT
//
// @description<<
//
//
//
// <<

export type InstallMethod = 'eget' | 'script' | 'installer';

export type InstallOptions = {
  version?: string;
  installDir: string;
};

export type Installer = {
  install(tool: string, opts?: InstallOptions): Promise<void>;
};

export type ScriptInstallSpec = {
  url: string;
  shell?: 'bash' | 'pwsh';
};

export type InstallerSpec = {
  url: string;
  extract?: 'zip' | 'tar.gz' | 'tgz' | 'tar.bz2' | 'pkg' | '7z' | false;
  commandLine: string;
};

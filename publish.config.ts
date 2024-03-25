const configs = {
  /** Obsidian's Vault root
   * default: vault
   */
  vault_root: 'vault',
  /** 静态资源输出的目录
   *
   * default:vault
   * 完整路径： public/static/{target_root}
   *
   * 每次编译操作都会copy vault里面的静态资源到这个文件夹中；
   * 建议放在static下的一个单独目录，有重大版本更新的时候直接删掉即可 */
  target_root: 'vault',
}

export default configs

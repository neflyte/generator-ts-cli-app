"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  /**
   * Determines if the supplied string is a "repo reference" by looking for
   * the existence of a single forward slash character.
   * @param repo {string} The possible repo reference to check
   * @returns {boolean} True if the supplied string contains a single forward slash character; false otherwise
   * @private
   */
  _isRepoRef(repo) {
    const firstForwardSlashIndex = repo.indexOf("/");
    if (firstForwardSlashIndex > -1) {
      const lastForwardSlashIndex = repo.lastIndexOf("/");
      if (lastForwardSlashIndex === firstForwardSlashIndex) {
        return true;
      }
    }

    return false;
  }

  async prompting() {
    this.log(
      yosay(
        `Welcome to the tiptop ${chalk.red("TypeScript CLI app")} generator!`,
      ),
    );
    /** @type {Record<string,string|number|boolean>} */
    this.props = await this.prompt([
      {
        type: "input",
        name: "appname",
        message: "Your app name (e.g. mycliapp)",
        default: "mycliapp",
      },
      {
        type: "input",
        name: "appnamePascalCase",
        message: "Your app name in PascalCase (e.g. MyCLIApp)",
        default: "MyCLIApp",
      },
      {
        type: "input",
        name: "repourl",
        message: "Repository URL (e.g. neflyte/mycliapp or mycliapp)",
        default: "mycliapp",
      },
    ]);
    // If repourl contains a single forward slash then prepend github.com/ to it
    const repourl = String(this.props.repourl);
    if (this._isRepoRef(repourl)) {
      this.props.repourl = `github.com/${repourl}`;
    }
  }

  async writing() {
    // Set up the template context
    /** @type {Record<string,string>} */
    const templateCtx = {
      appname: this.props.appname,
      appnamePascalCase: this.props.appnamePascalCase,
      repourl: this.props.repourl,
    };

    // Set up the list of templated files
    /** @type {Record<string,string>} */
    const templateFileMap = {
      "src/index.ts": "src/index.ts",
      "src/lib/Logger.ts": "src/lib/Logger.ts",
      "package.json": "package.json",
      "README.md": "README.md",
    };

    // Set up the list of non-templated files
    /** @type {Record<string,string>} */
    const fileMap = {
      ".editorconfig": ".editorconfig",
      ".eslintrc.js": ".eslintrc.js",
      ".gitignore": ".gitignore",
      ".prettierrc": ".prettierrc",
      "CHANGELOG.md": "CHANGELOG.md",
      "tsconfig.json": "tsconfig.json",
    };

    // Copy non-templated files
    for (const [src, dest] of Object.entries(fileMap)) {
      this.fs.copy(this.templatePath(src), this.destinationPath(dest));
    }

    // Copy templated files
    for (const [src, dest] of Object.entries(templateFileMap)) {
      this.fs.copyTpl(
        this.templatePath(src),
        this.destinationPath(dest),
        templateCtx,
      );
    }
  }
};

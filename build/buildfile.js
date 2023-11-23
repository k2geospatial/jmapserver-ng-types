/**
 * @author : Laurent Mignonat
 * @copyright (c) 2004-2019 K2 Geospatial, Inc. All Rights Reserved.
 */
const { join } = require("path")
const fs = require("fs")
const { argv } = require("process")
const execSync = require("child_process").execSync

if (fs.existsSync(join(__dirname, "env-config.js"))) {
  // we'll use variables defined in this file instead of the ones defined by sys. env.
  const toCheckVariables = ["NODE_ENV", "BUILD_DIR", "COPY_DIR", "SOURCE_DIRS"]
  const envConfig = require(join(__dirname, "env-config.js"))

  toCheckVariables.forEach(variable => {
    if (envConfig.hasOwnProperty(variable)) {
      process.env[variable] = envConfig[variable]
      console.log(`"env-config.js" defined "${variable}" as "${process.env[variable]}"`)
    }
  })
  console.log("")
}

// __dirname is the directory witch contains the buildfile.js file
const ROOT_DIR = join(__dirname, "..")
const DOC_ROOT_DIR = join(__dirname, "../docs")
const SRC_DIR = join(ROOT_DIR, "/public")
const packageJSON = JSON.parse(fs.readFileSync(join(__dirname, "../package.json")))
const newNpmVersion = packageJSON.version
const DOC_LATEST_DIR = join(ROOT_DIR, "./docs/latest")
const DOC_DIR = process.env.DOC_DIR ? join(ROOT_DIR, process.env.DOC_DIR) : join(DOC_ROOT_DIR, `v${newNpmVersion}`)
const SOURCE_DIRS = process.env.SOURCE_DIRS ? process.env.SOURCE_DIRS : "jmapserver-ng"

console.log("Directories :")
console.log(`  Doc dir  => ${DOC_ROOT_DIR}`)
console.log(`  Src dir => ${SRC_DIR}`)

processTasks()

async function processTasks() {
  if (argv.length < 3) {
    console.log(`\x1b[91m missing arguments. Usage: npm run <command> [option]  \x1b[0m`)
    process.exit()
  }
  const taskName = argv[2].toLowerCase()
  let tasks

  switch (taskName) {
    case "doc-test":
      await generateTypedoc()
      break

    case "copy":
      await copyTypesToOtherProjects()
      break

    case "copy-latest":
      await copyCurrentDocToLatestFolder()
      break

    case "commit-doc":
      tasks = [generateTypedoc, copyCurrentDocToLatestFolder, commit]
      for (const task of tasks) {
        if ((await task()) === 1) {
          console.log("******** EXECUTION STOPPED **********")
          break
        }
      }
      break

    case "publish":
      tasks = [generateTypedoc, copyCurrentDocToLatestFolder, commit, publishNpm]
      for (const task of tasks) {
        if ((await task()) === 1) {
          console.log("******** EXECUTION STOPPED **********")
          break
        }
      }
      break

    default:
      console.error(`unrecognized command "${taskName}"`)
      break
  }
}

// https://typedoc.org/api/
// see the following for typescript language level compatibility: https://typedoc.org/guides/installation/#requirements
function generateTypedoc() {
  console.log("************* TYPEDOC *****************")
  console.log()
  console.log(`DOC : generating doc in directory "${DOC_DIR}"`)
  console.log(`DOC : file://${DOC_DIR}/index.html`)

  execSync(
    `cat ${join(__dirname, "../public/*.ts")}   ${join(
      __dirname,
      "../node_modules/jmapserver-ng-core-types/public/core.d.ts"
    )} ${join(__dirname, "../node_modules/jmapserver-ng-core-types/public/jmap/*ts")}  > ${join(
      __dirname,
      "./JMap.d.ts"
    )}`,
    {
      cwd: join(__dirname, ".")
    }
  )

  execSync(
    `npx typedoc \\
    --readme ${join(__dirname, "./public-doc-readme.md")} \\
    --basePath ${join(__dirname, "../public")} \\
    --excludeExternals true \\
    --excludePrivate true \\
    --tsconfig ${join(__dirname, "./tsconfig.json")} \\
    --out ${DOC_DIR} \\
    --name "JMap Server NG Types" \\
    --hideGenerator true \\
    --version false \\
    --disableSources true \\
    --entryPoints ${join(__dirname, "./JMap.d.ts")} \\
    --entryPointStrategy expand \\
    --navigation.fullTree true \\
    --treatWarningsAsErrors true \\
    --treatValidationWarningsAsErrors true
    `,
    { cwd: join(__dirname, "."), stdio: "inherit" }
  )

  execSync(`rm ${(join(__dirname), "./JMap.d.ts")}`, { cwd: join(__dirname, ".") })
}

function copyTypesToOtherProjects() {
  console.log("************* COPY TYPES *****************")
  console.log()
  if (!process.env.COPY_DIR) {
    throw Error("Missing COPY_DIR env variable. Ex : set COPY_DIR='/Users/jdoe/Desktop/'")
  }
  const sourceDirs = SOURCE_DIRS.split(",").map(s => s.trim())
  for (const sourceDir of sourceDirs) {
    console.info(`Copy ng types files in "${join(process.env.COPY_DIR, `${sourceDir}`)}"`)

    fs.cpSync(
      join(ROOT_DIR, "public/"),
      join(process.env.COPY_DIR, `${sourceDir}/node_modules/jmapserver-ng-types/public/`),
      { recursive: true, force: true }
    )
    fs.cpSync(
      join(ROOT_DIR, "index.ts"),
      join(process.env.COPY_DIR, `${sourceDir}/node_modules/jmapserver-ng-types/index.ts`),
      { recursive: true, force: true }
    )
    fs.cpSync(
      join(ROOT_DIR, "all-enums.ts"),
      join(process.env.COPY_DIR, `${sourceDir}/node_modules/jmapserver-ng-types/all-enums.ts`),
      { recursive: true, force: true }
    )
  }
}

function copyCurrentDocToLatestFolder() {
  console.log("************* COPY CURRENT DOC TO LATEST FOLDER *****************")
  console.log()
  fs.cpSync(join(DOC_DIR, "/"), join(DOC_LATEST_DIR, "/"), { recursive: true, force: true })
}

function commit() {
  console.log("************* COMMIT DOC *****************")
  console.log()
  execSync(`git add .`, { cwd: ROOT_DIR })
  console.log(`GIT : all documentation files staged for commit`)
  const commitMessage = `Publish version '${newNpmVersion}' of documentation`
  execSync(`git commit -m "${commitMessage}"`, { cwd: ROOT_DIR })
  console.log(`GIT : commit done (message="${commitMessage}")`)
  execSync(`git push`, { cwd: ROOT_DIR })
  console.log(`Git : all documentation files has been committed and pushed on origin`)
}

function publishNpm() {
  console.log("************* PUBLISH *****************")
  console.log()
  execSync(`npm publish`, { cwd: ROOT_DIR })
  console.log(`NPM : version="${newNpmVersion}" has been published`)
}

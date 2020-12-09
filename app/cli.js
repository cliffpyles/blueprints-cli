#!/usr/bin/env node

const pkg = require('../package')
const path = require('path')
const cli = require('commander')
const App = require('./app')
const getMetadata = require('./utils/get-metadata')
const getTemplateData = require('./utils/get-template-data')
const generate = require('./actions/generate')
const {
  CURRENT_PATH,
  CURRENT_DIRNAME,
  PROJECT_BLUEPRINTS_PATH,
  GLOBAL_BLUEPRINTS_PATH,
} = require('./config')

const app = new App({
  globalPath: GLOBAL_BLUEPRINTS_PATH,
  projectPath: PROJECT_BLUEPRINTS_PATH,
})

cli.version(pkg.version)

cli
  .command('generate <blueprint> <blueprintInstance>')
  .option('-d, --dest <destination>', 'Which directory to place the files')
  .alias('g')
  .description('Generate files with a blueprint')
  .action(generate)

cli
  .command('list [namespace]')
  .alias('ls')
  .description('List all available blueprints')
  .action(async function list(namespace = '') {
    const blueprints = await app.getAllBlueprints(namespace)

    console.log(`--- Global Blueprints ---`)
    if (blueprints.global && blueprints.global.length) {
      blueprints.global.forEach((blueprint) => {
        console.log(`${blueprint.name} - ${blueprint.location}`)
      })
    } else {
      console.log(`no global blueprints found`)
    }

    console.log(`\n--- Project Blueprints ---`)
    if (blueprints.project && blueprints.project.length) {
      blueprints.project.forEach((blueprint) => {
        console.log(`${blueprint.name} - ${blueprint.location}`)
      })
    } else {
      console.log(`no project blueprints found`)
    }
  })

cli
  .command('new <blueprint>')
  .option('-g, --global', 'Creates the blueprint globally', false)
  .description('Create a generic blueprint')
  .action((blueprint, options) => {
    app.createBlueprint(blueprint, options)
  })

cli
  .command('init [blueprint]')
  .option('-g, --global', 'Creates the blueprint globally')
  .description('Create blueprint with contents of current directory')
  .action(function initialize(blueprint, options) {
    const blueprintName = blueprint || CURRENT_DIRNAME
    const isGlobal = options.global || false
    const source = CURRENT_PATH
    const globalLocation = path.resolve(GLOBAL_BLUEPRINTS_PATH, blueprintName)
    const projectLocation = path.resolve(PROJECT_BLUEPRINTS_PATH, blueprintName)
    const location = isGlobal ? globalLocation : projectLocation

    app
      .initializeBlueprint(blueprintName, { source, location })
      .then((blueprint) => {
        console.log(`${blueprint.name} was created at: ${blueprint.location}`)
      })
      .catch((err) => {
        throw err
      })
  })

cli
  .command('remove <blueprint>')
  .alias('rm')
  .option('-g, --global', 'Removes the global blueprint')
  .description('Removes a blueprint')
  .action(function remove(blueprint, options) {
    const blueprintName = blueprint
    const isGlobal = options.global || false
    const globalLocation = path.resolve(GLOBAL_BLUEPRINTS_PATH, blueprintName)
    const projectLocation = path.resolve(PROJECT_BLUEPRINTS_PATH, blueprintName)
    const location = isGlobal ? globalLocation : projectLocation

    app
      .removeBlueprint(blueprintName, { location })
      .then((blueprint) => {
        console.log(`${blueprint.name} was removed from: ${blueprint.location}`)
      })
      .catch((err) => {
        throw err
      })
  })

cli.on('--help', () => {
  console.log('')
  console.group(
    'Pipes:\n',
    'ClassFormat (ex. ComponentName)\n',
    'DashedFormat (ex. component-name)\n',
    'CamelCaseFormat (ex. componentName)\n',
    'PascalCaseFormat (ex. ComponentName)\n',
    'SlugFormat (ex. component-name)\n',
    'ConstantFormat (ex. COMPONENT_NAME)\n'
  )
})

cli.parse(process.argv)

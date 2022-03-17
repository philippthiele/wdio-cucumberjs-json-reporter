"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CucumberJsJsonReporter = void 0;
const constants_1 = require("./constants");
const reporter_1 = __importDefault(require("@wdio/reporter"));
const fs_extra_1 = require("fs-extra");
const metadata_1 = require("./metadata");
const utils_1 = __importDefault(require("./utils"));
const logger_1 = __importDefault(require("@wdio/logger"));
const path_1 = require("path");
const log = (0, logger_1.default)('wdio-multiple-cucumber-html-reporter');
class CucumberJsJsonReporter extends reporter_1.default {
    constructor(options) {
        super(options);
        this.options = options;
        this.options = options;
        if (!this.options.jsonFolder) {
            this.options.jsonFolder = constants_1.DEFAULT_JSON_FOLDER;
            log.info(`The 'jsonFolder' was not set, it has been set to the default '${constants_1.DEFAULT_JSON_FOLDER}'`);
        }
        if (!this.options.language) {
            this.options.language = constants_1.DEFAULT_LANGUAGE;
            log.info(`The 'language' was not set, it has been set to the default '${constants_1.DEFAULT_LANGUAGE}'`);
        }
        if (this.options.reportFilePerRetry === undefined) {
            this.options.reportFilePerRetry = constants_1.DEFAULT_REPORT_FILE_PER_RETRY;
            log.info(`The 'reportFilePerRetry' was not set, it has been set to the default '${constants_1.DEFAULT_REPORT_FILE_PER_RETRY.toString()}'`);
        }
        this.instanceMetadata = null;
        this.report = {};
        this.registerListeners();
        this.metadataClassObject = new metadata_1.Metadata();
        this.utilsObject = new utils_1.default();
    }
    static attach(data, type = constants_1.TEXT_PLAIN) {
        process.emit('wdioCucumberJsReporter:attachment', { data, type });
    }
    registerListeners() {
        process.on('wdioCucumberJsReporter:attachment', this.cucumberJsAttachment.bind(this));
    }
    onRunnerStart(runnerData) {
        if (!this.instanceMetadata) {
            this.instanceMetadata = this.metadataClassObject.determineMetadata(runnerData);
        }
    }
    onSuiteStart(payload) {
        if (!this.report.feature) {
            this.report.feature = this.getFeatureDataObject(payload);
        }
        if (!this.report.feature.metadata) {
            this.report.feature = { ...this.report.feature, metadata: { ...this.instanceMetadata } };
        }
        if (typeof this.report.feature.elements !== 'undefined' && payload.parent) {
            this.report.feature.elements.push(this.getScenarioDataObject(payload, this.report.feature.id));
        }
    }
    onHookStart(payload) {
        if (this.options.disableHooks) {
            return;
        }
        const currentSteps = this.getCurrentScenario().steps;
        payload.state = constants_1.PASSED;
        payload.keyword = this.utilsObject.containsSteps(currentSteps, this.options.language) ? constants_1.AFTER : constants_1.BEFORE;
        this.addStepData(payload);
    }
    onHookEnd(payload) {
        if (this.options.disableHooks) {
            return;
        }
        payload.state = payload.error ? payload.state : constants_1.PASSED;
        return this.updateStepStatus(payload);
    }
    onTestStart(payload) {
        this.addStepData(payload);
    }
    onTestPass(payload) {
        this.updateStepStatus(payload);
    }
    onTestFail(payload) {
        this.updateStepStatus(payload);
    }
    onTestSkip(payload) {
        this.updateStepStatus(payload);
    }
    onRunnerEnd() {
        const uniqueId = String(Date.now() + Math.random()).replace('.', '');
        const filename = this.options.reportFilePerRetry ? `${this.report.feature.id}_${uniqueId}.json` : `${this.report.feature.id}.json`;
        const jsonFolder = (0, path_1.resolve)(process.cwd(), this.options.jsonFolder);
        const jsonFile = (0, path_1.resolve)(jsonFolder, filename);
        const json = [this.report.feature];
        const output = (0, fs_extra_1.existsSync)(jsonFile) ? json.concat((0, fs_extra_1.readJsonSync)(jsonFile)) : json;
        (0, fs_extra_1.outputJsonSync)(jsonFile, output);
    }
    getFeatureDataObject(featureData) {
        const featureName = featureData.title;
        return {
            keyword: constants_1.FEATURE,
            type: featureData.type,
            description: (featureData.description || ''),
            line: featureData.uid && featureData.uid.includes(':')
                ? parseInt(featureData.uid.split(':')[1], 10)
                : null,
            name: featureName,
            uri: featureData.file || 'Can not be determined',
            tags: featureData.tags || [],
            elements: [],
            id: featureName.replace(/[\\/?%*:|"<> ]/g, '-').toLowerCase(),
        };
    }
    getScenarioDataObject(scenarioData, id) {
        const scenarioName = scenarioData.title;
        return {
            keyword: constants_1.SCENARIO,
            type: scenarioData.type,
            description: (scenarioData.description || ''),
            name: scenarioName,
            tags: scenarioData.tags || [],
            id: `${id};${scenarioData.title.replace(/ /g, '-').toLowerCase()}`,
            steps: [],
        };
    }
    getStepDataObject(stepData) {
        const keyword = (stepData === null || stepData === void 0 ? void 0 : stepData.keyword)
            || this.utilsObject.keywordStartsWith(stepData.title, this.options.language)
            || '';
        const title = (stepData.title.split(keyword).pop() || stepData.title || '').trim();
        return {
            arguments: stepData.argument ? [stepData.argument] : [],
            keyword,
            name: title,
            result: {
                status: stepData.state || '',
                duration: (stepData._duration || 0) * 1000000,
                ...this.utilsObject.getFailedMessage(stepData)
            },
            line: null,
            match: {
                location: 'can not be determined with webdriver.io'
            }
        };
    }
    getCurrentScenario() {
        return this.report.feature.elements[this.report.feature.elements.length - 1];
    }
    getCurrentStep() {
        const currentScenario = this.getCurrentScenario();
        return currentScenario.steps[currentScenario.steps.length - 1];
    }
    addStepData(test) {
        this.getCurrentScenario().steps.push(this.getStepDataObject(test));
    }
    updateStepStatus(test) {
        const currentSteps = this.getCurrentScenario().steps;
        const currentStepsLength = currentSteps.length;
        const stepData = this.getStepDataObject(test);
        currentSteps[currentStepsLength - 1] = { ...this.getCurrentStep(), ...stepData };
    }
    cucumberJsAttachment(attachment) {
        const currentStep = this.getCurrentStep();
        const embeddings = {
            data: attachment === null || attachment === void 0 ? void 0 : attachment.data,
            mime_type: attachment.type,
        };
        if (!currentStep.embeddings) {
            currentStep.embeddings = [embeddings];
        }
        else {
            currentStep.embeddings.push(embeddings);
        }
    }
}
exports.CucumberJsJsonReporter = CucumberJsJsonReporter;
exports.default = CucumberJsJsonReporter;
//# sourceMappingURL=reporter.js.map
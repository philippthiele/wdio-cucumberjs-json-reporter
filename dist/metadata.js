"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
const constants_1 = require("./constants");
class Metadata {
    determineMetadata(data) {
        var _a, _b, _c, _d;
        let instanceData;
        const currentCapabilities = data.capabilities;
        const optsCaps = browser.options.capabilities;
        const currentConfigCapabilities = data === null || data === void 0 ? void 0 : data.capabilities;
        const w3cCaps = Object.prototype.hasOwnProperty.call(data.config.capabilities, 'cjson:metadata')
            ? data.config.capabilities['cjson:metadata']
            : (_b = (_a = browser.options) === null || _a === void 0 ? void 0 : _a.requestedCapabilities) === null || _b === void 0 ? void 0 : _b.cjson_metadata;
        const metadata = ((_c = currentConfigCapabilities) === null || _c === void 0 ? void 0 : _c.cjson_metadata)
            || w3cCaps
            || ((_d = optsCaps) === null || _d === void 0 ? void 0 : _d.cjson_metadata)
            || {};
        if ((currentConfigCapabilities === null || currentConfigCapabilities === void 0 ? void 0 : currentConfigCapabilities.app) || (metadata === null || metadata === void 0 ? void 0 : metadata.app)) {
            instanceData = this.determineAppData(currentConfigCapabilities, metadata);
        }
        else {
            instanceData = this.determineBrowserData(currentCapabilities, currentConfigCapabilities, metadata);
        }
        return {
            ...instanceData,
            device: this.determineDeviceName(metadata, currentConfigCapabilities),
            platform: {
                name: this.determinePlatformName(metadata, currentCapabilities),
                version: this.determinePlatformVersion(metadata, currentCapabilities),
            },
        };
    }
    determineDeviceName(metadata, currentConfigCapabilities) {
        return ((metadata === null || metadata === void 0 ? void 0 : metadata.device) || (currentConfigCapabilities === null || currentConfigCapabilities === void 0 ? void 0 : currentConfigCapabilities.deviceName) || `Device name ${constants_1.NOT_KNOWN}`);
    }
    determinePlatformName(metadata, currentCapabilities) {
        var _a, _b;
        const currentPlatformName = (currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.platformName)
            ? (currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.platformName.includes('mac'))
                ? 'osx'
                : currentCapabilities.platformName.includes('windows')
                    ? 'windows'
                    : currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.platformName
            : `Platform name ${constants_1.NOT_KNOWN}`;
        return (metadata.platform && ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.platform) === null || _a === void 0 ? void 0 : _a.name))
            ? (_b = metadata.platform) === null || _b === void 0 ? void 0 : _b.name
            : currentPlatformName;
    }
    determinePlatformVersion(metadata, currentCapabilities) {
        var _a;
        if (metadata && metadata.platform && ((_a = metadata.platform) === null || _a === void 0 ? void 0 : _a.version)) {
            return metadata.platform.version;
        }
        if (currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.platformVersion) {
            return currentCapabilities.platformVersion;
        }
        return `Version ${constants_1.NOT_KNOWN}`;
    }
    determineAppData(currentConfigCapabilities, metadata) {
        var _a, _b;
        const metaAppName = ((metadata === null || metadata === void 0 ? void 0 : metadata.app) && ((_a = metadata.app) === null || _a === void 0 ? void 0 : _a.name)) ? (_b = metadata === null || metadata === void 0 ? void 0 : metadata.app) === null || _b === void 0 ? void 0 : _b.name : 'No metadata.app.name available';
        const metaAppVersion = ((metadata === null || metadata === void 0 ? void 0 : metadata.app) && metadata.app.version) ? metadata.app.version : 'No metadata.app.version available';
        const appPath = currentConfigCapabilities.app || metaAppName;
        const appName = appPath.substring(appPath.replace('\\', '/').lastIndexOf('/')).replace('/', '');
        return {
            app: {
                name: appName,
                version: metaAppVersion,
            },
        };
    }
    determineBrowserData(currentCapabilities, currentConfigCapabilities, metadata) {
        var _a, _b, _c, _d;
        const browserName = (currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.browserName)
            || (currentConfigCapabilities === null || currentConfigCapabilities === void 0 ? void 0 : currentConfigCapabilities.browserName)
            || ((metadata && (metadata === null || metadata === void 0 ? void 0 : metadata.browser) && ((_a = metadata.browser) === null || _a === void 0 ? void 0 : _a.name)) ? (_b = metadata === null || metadata === void 0 ? void 0 : metadata.browser) === null || _b === void 0 ? void 0 : _b.name : 'No metadata.browser.name available');
        const browserVersion = (currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.version)
            || (currentCapabilities === null || currentCapabilities === void 0 ? void 0 : currentCapabilities.browserVersion)
            || (currentConfigCapabilities === null || currentConfigCapabilities === void 0 ? void 0 : currentConfigCapabilities.browserVersion)
            || ((metadata && (metadata === null || metadata === void 0 ? void 0 : metadata.browser) && ((_c = metadata === null || metadata === void 0 ? void 0 : metadata.browser) === null || _c === void 0 ? void 0 : _c.version)) ? (_d = metadata === null || metadata === void 0 ? void 0 : metadata.browser) === null || _d === void 0 ? void 0 : _d.version : 'No metadata.browser.version available');
        return {
            browser: {
                name: browserName,
                version: browserVersion,
            }
        };
    }
}
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map
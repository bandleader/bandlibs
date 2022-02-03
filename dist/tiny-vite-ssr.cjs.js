'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serverRenderer = require('vue/server-renderer');
var Vite = require('vite');
var fs = require('fs');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var Vite__namespace = /*#__PURE__*/_interopNamespace(Vite);
var fs__namespace = /*#__PURE__*/_interopNamespace(fs);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

module.exports = require('./lib/express');

var Express = /*#__PURE__*/Object.freeze({
    __proto__: null
});

function devMiddleware(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var app, viteServer;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = Express();
                    return [4 /*yield*/, Vite__namespace.createServer({
                            server: { middlewareMode: "ssr" }
                        })];
                case 1:
                    viteServer = _a.sent();
                    app.use(viteServer.middlewares);
                    app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    if (!!looksLikeHtmlRequest(req)) return [3 /*break*/, 1];
                                    _a = next();
                                    return [3 /*break*/, 3];
                                case 1:
                                    _c = (_b = res).send;
                                    return [4 /*yield*/, indexHtml(viteServer, req.originalUrl, fs__namespace.readFileSync(opts.pathToIndexHtml, { encoding: "utf8" }), opts.pathToMainJsEntrypoint)];
                                case 2:
                                    _a = _c.apply(_b, [_d.sent()]);
                                    _d.label = 3;
                                case 3: return [2 /*return*/, _a];
                            }
                        });
                    }); });
                    return [2 /*return*/, app];
            }
        });
    });
}
function looksLikeHtmlRequest(req) {
    return req.method === "GET" && !(/\.[A-Za-z]+$/.test(req.originalUrl));
}

function indexHtml(vite, url, indexHtmlText, pathToEntryServer) {
    return __awaiter(this, void 0, void 0, function () {
        var out, appModule, appObject, renderResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vite.transformIndexHtml(url, indexHtmlText)];
                case 1:
                    out = _a.sent();
                    return [4 /*yield*/, vite.ssrLoadModule(pathToEntryServer)];
                case 2:
                    appModule = _a.sent();
                    appObject = appModule.createApp();
                    return [4 /*yield*/, renderVueAppOnServer(appObject, url)];
                case 3:
                    renderResult = _a.sent();
                    out = out.replace("<!--ssr-outlet-->", renderResult.html);
                    out = out.replace("</head>", renderResult.headEndContent + '</head>');
                    out = out.replace("</body>", renderResult.bodyEndContent + '</body>');
                    return [2 /*return*/, out];
            }
        });
    });
}
function renderVueAppOnServer(appObj, url) {
    return __awaiter(this, void 0, void 0, function () {
        var ssrContext, html;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!appObj.router) return [3 /*break*/, 2];
                    appObj.router.push(url);
                    return [4 /*yield*/, appObj.router.isReady()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    ssrContext = { headEndContent: [], bodyEndContent: [] };
                    return [4 /*yield*/, serverRenderer.renderToString(appObj.app, ssrContext)];
                case 3:
                    html = _b.sent();
                    _a = { html: html };
                    return [4 /*yield*/, collectSlot(ssrContext.headEndContent)];
                case 4:
                    _a.headEndContent = _b.sent();
                    return [4 /*yield*/, collectSlot(ssrContext.bodyEndContent)];
                case 5: return [2 /*return*/, (_a.bodyEndContent = _b.sent(), _a)];
            }
        });
    });
}
function collectSlot(slot) {
    return __awaiter(this, void 0, void 0, function () {
        var all;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!slot || !slot.length)
                        return [2 /*return*/, ""];
                    return [4 /*yield*/, Promise.all(slot)];
                case 1:
                    all = _a.sent();
                    return [2 /*return*/, all.join("\n")];
            }
        });
    });
}

exports.devMiddleware = devMiddleware;
exports.indexHtml = indexHtml;

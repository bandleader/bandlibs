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

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function middleware(callback) {
    var _this = this;
    return function (req, resp) { return __awaiter(_this, void 0, void 0, function () {
        var param, method, context, backend, args, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    param = function (key) { var _a, _b; return ((_a = req.query) === null || _a === void 0 ? void 0 : _a[key]) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b[key]); };
                    method = param('method');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    context = { req: req };
                    backend = callback(context);
                    if (!(typeof backend[method] !== 'function')) return [3 /*break*/, 2];
                    // throw `Method '${method}' does not exist. Methods are: ${Object.keys(backend)}`
                    throw "Method '".concat(method, "' does not exist");
                case 2:
                    args = JSON.parse(param('args'));
                    return [4 /*yield*/, backend[method].apply(context, args)];
                case 3:
                    result = _a.sent();
                    resp.json({ result: result });
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.error("Error in RPC action '".concat(method, "':"), err_1);
                    resp.json({ err: err_1 });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
}
function client(endpoint) {
    if (endpoint === void 0) { endpoint = "/api"; }
    var single = function (method) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var questionOrAmp = endpoint.includes('?') ? '&' : '?';
        var result = fetch(endpoint + questionOrAmp, { method: "POST", body: new URLSearchParams({ method: method, args: JSON.stringify(args) }) });
        var jsonResult = result.then(function (x) { return x.json(); });
        return jsonResult.then(function (json) {
            if (json.err) {
                console.error("RPC: Server returned error:", json.err);
                throw "Server returned error: " + JSON.stringify(json.err);
            }
            return json.result;
        });
    };
    var proxy = function () { return new Proxy({}, {
        get: function (targ, prop) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return single.apply(void 0, __spreadArray([prop], __read(args), false));
            };
        }
    }); };
    return { single: single, proxy: proxy };
}
// const exampleBackend = {
//     foo: async (b: string) => 12
// }
// const test = client<typeof exampleBackend>().single("foo",'1')

export { client, middleware };

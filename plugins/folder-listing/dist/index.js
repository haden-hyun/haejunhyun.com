import path from 'path';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name3 in all)
    __defProp(target, name3, { get: all[name3], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// node_modules/inline-style-parser/cjs/index.js
var require_cjs4 = __commonJS({
  "node_modules/inline-style-parser/cjs/index.js"(exports, module) {
    var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
    var NEWLINE_REGEX = /\n/g;
    var WHITESPACE_REGEX = /^\s*/;
    var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
    var COLON_REGEX = /^:\s*/;
    var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
    var SEMICOLON_REGEX = /^[;\s]*/;
    var TRIM_REGEX = /^\s+|\s+$/g;
    var NEWLINE = "\n";
    var FORWARD_SLASH = "/";
    var ASTERISK = "*";
    var EMPTY_STRING = "";
    var TYPE_COMMENT = "comment";
    var TYPE_DECLARATION = "declaration";
    function index3(style, options) {
      if (typeof style !== "string") {
        throw new TypeError("First argument must be a string");
      }
      if (!style) return [];
      options = options || {};
      var lineno = 1;
      var column = 1;
      function updatePosition(str) {
        var lines = str.match(NEWLINE_REGEX);
        if (lines) lineno += lines.length;
        var i2 = str.lastIndexOf(NEWLINE);
        column = ~i2 ? str.length - i2 : column + str.length;
      }
      function position4() {
        var start2 = { line: lineno, column };
        return function(node) {
          node.position = new Position(start2);
          whitespace3();
          return node;
        };
      }
      function Position(start2) {
        this.start = start2;
        this.end = { line: lineno, column };
        this.source = options.source;
      }
      Position.prototype.content = style;
      function error(msg) {
        var err = new Error(
          options.source + ":" + lineno + ":" + column + ": " + msg
        );
        err.reason = msg;
        err.filename = options.source;
        err.line = lineno;
        err.column = column;
        err.source = style;
        if (options.silent) ;
        else {
          throw err;
        }
      }
      function match(re3) {
        var m2 = re3.exec(style);
        if (!m2) return;
        var str = m2[0];
        updatePosition(str);
        style = style.slice(str.length);
        return m2;
      }
      function whitespace3() {
        match(WHITESPACE_REGEX);
      }
      function comments(rules) {
        var c2;
        rules = rules || [];
        while (c2 = comment()) {
          if (c2 !== false) {
            rules.push(c2);
          }
        }
        return rules;
      }
      function comment() {
        var pos = position4();
        if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
        var i2 = 2;
        while (EMPTY_STRING != style.charAt(i2) && (ASTERISK != style.charAt(i2) || FORWARD_SLASH != style.charAt(i2 + 1))) {
          ++i2;
        }
        i2 += 2;
        if (EMPTY_STRING === style.charAt(i2 - 1)) {
          return error("End of comment missing");
        }
        var str = style.slice(2, i2 - 2);
        column += 2;
        updatePosition(str);
        style = style.slice(i2);
        column += 2;
        return pos({
          type: TYPE_COMMENT,
          comment: str
        });
      }
      function declaration() {
        var pos = position4();
        var prop = match(PROPERTY_REGEX);
        if (!prop) return;
        comment();
        if (!match(COLON_REGEX)) return error("property missing ':'");
        var val = match(VALUE_REGEX);
        var ret = pos({
          type: TYPE_DECLARATION,
          property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
          value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
        });
        match(SEMICOLON_REGEX);
        return ret;
      }
      function declarations() {
        var decls = [];
        comments(decls);
        var decl;
        while (decl = declaration()) {
          if (decl !== false) {
            decls.push(decl);
            comments(decls);
          }
        }
        return decls;
      }
      whitespace3();
      return declarations();
    }
    function trim(str) {
      return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
    }
    module.exports = index3;
  }
});

// node_modules/style-to-object/cjs/index.js
var require_cjs5 = __commonJS({
  "node_modules/style-to-object/cjs/index.js"(exports) {
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StyleToObject;
    var inline_style_parser_1 = __importDefault(require_cjs4());
    function StyleToObject(style, iterator) {
      let styleObject = null;
      if (!style || typeof style !== "string") {
        return styleObject;
      }
      const declarations = (0, inline_style_parser_1.default)(style);
      const hasIterator = typeof iterator === "function";
      declarations.forEach((declaration) => {
        if (declaration.type !== "declaration") {
          return;
        }
        const { property, value } = declaration;
        if (hasIterator) {
          iterator(property, value, declaration);
        } else if (value) {
          styleObject = styleObject || {};
          styleObject[property] = value;
        }
      });
      return styleObject;
    }
  }
});

// node_modules/style-to-js/cjs/utilities.js
var require_utilities2 = __commonJS({
  "node_modules/style-to-js/cjs/utilities.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.camelCase = void 0;
    var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
    var HYPHEN_REGEX = /-([a-z])/g;
    var NO_HYPHEN_REGEX = /^[^-]+$/;
    var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
    var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
    var skipCamelCase = function(property) {
      return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
    };
    var capitalize = function(match, character) {
      return character.toUpperCase();
    };
    var trimHyphen = function(match, prefix) {
      return "".concat(prefix, "-");
    };
    var camelCase = function(property, options) {
      if (options === void 0) {
        options = {};
      }
      if (skipCamelCase(property)) {
        return property;
      }
      property = property.toLowerCase();
      if (options.reactCompat) {
        property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
      } else {
        property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
      }
      return property.replace(HYPHEN_REGEX, capitalize);
    };
    exports.camelCase = camelCase;
  }
});

// node_modules/style-to-js/cjs/index.js
var require_cjs6 = __commonJS({
  "node_modules/style-to-js/cjs/index.js"(exports, module) {
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var style_to_object_1 = __importDefault(require_cjs5());
    var utilities_1 = require_utilities2();
    function StyleToJS(style, options) {
      var output = {};
      if (!style || typeof style !== "string") {
        return output;
      }
      (0, style_to_object_1.default)(style, function(property, value) {
        if (property && value) {
          output[(0, utilities_1.camelCase)(property, options)] = value;
        }
      });
      return output;
    }
    StyleToJS.default = StyleToJS;
    module.exports = StyleToJS;
  }
});
var __create2 = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf2 = Object.getPrototypeOf;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __commonJS2 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export2 = (target, all) => {
  for (var name22 in all)
    __defProp2(target, name22, { get: all[name22], enumerable: true });
};
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp2(target, "default", { value: mod, enumerable: true }),
  mod
));
var require_cjs = __commonJS2({
  "node_modules/inline-style-parser/cjs/index.js"(exports$1, module) {
    var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
    var NEWLINE_REGEX = /\n/g;
    var WHITESPACE_REGEX = /^\s*/;
    var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
    var COLON_REGEX = /^:\s*/;
    var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
    var SEMICOLON_REGEX = /^[;\s]*/;
    var TRIM_REGEX = /^\s+|\s+$/g;
    var NEWLINE = "\n";
    var FORWARD_SLASH = "/";
    var ASTERISK = "*";
    var EMPTY_STRING = "";
    var TYPE_COMMENT = "comment";
    var TYPE_DECLARATION = "declaration";
    function index22(style, options) {
      if (typeof style !== "string") {
        throw new TypeError("First argument must be a string");
      }
      if (!style) return [];
      options = options || {};
      var lineno = 1;
      var column = 1;
      function updatePosition(str) {
        var lines = str.match(NEWLINE_REGEX);
        if (lines) lineno += lines.length;
        var i2 = str.lastIndexOf(NEWLINE);
        column = ~i2 ? str.length - i2 : column + str.length;
      }
      function position32() {
        var start2 = { line: lineno, column };
        return function(node) {
          node.position = new Position(start2);
          whitespace22();
          return node;
        };
      }
      function Position(start2) {
        this.start = start2;
        this.end = { line: lineno, column };
        this.source = options.source;
      }
      Position.prototype.content = style;
      function error(msg) {
        var err = new Error(
          options.source + ":" + lineno + ":" + column + ": " + msg
        );
        err.reason = msg;
        err.filename = options.source;
        err.line = lineno;
        err.column = column;
        err.source = style;
        if (options.silent) ;
        else {
          throw err;
        }
      }
      function match(re22) {
        var m2 = re22.exec(style);
        if (!m2) return;
        var str = m2[0];
        updatePosition(str);
        style = style.slice(str.length);
        return m2;
      }
      function whitespace22() {
        match(WHITESPACE_REGEX);
      }
      function comments(rules) {
        var c2;
        rules = rules || [];
        while (c2 = comment()) {
          if (c2 !== false) {
            rules.push(c2);
          }
        }
        return rules;
      }
      function comment() {
        var pos = position32();
        if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
        var i2 = 2;
        while (EMPTY_STRING != style.charAt(i2) && (ASTERISK != style.charAt(i2) || FORWARD_SLASH != style.charAt(i2 + 1))) {
          ++i2;
        }
        i2 += 2;
        if (EMPTY_STRING === style.charAt(i2 - 1)) {
          return error("End of comment missing");
        }
        var str = style.slice(2, i2 - 2);
        column += 2;
        updatePosition(str);
        style = style.slice(i2);
        column += 2;
        return pos({
          type: TYPE_COMMENT,
          comment: str
        });
      }
      function declaration() {
        var pos = position32();
        var prop = match(PROPERTY_REGEX);
        if (!prop) return;
        comment();
        if (!match(COLON_REGEX)) return error("property missing ':'");
        var val = match(VALUE_REGEX);
        var ret = pos({
          type: TYPE_DECLARATION,
          property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
          value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
        });
        match(SEMICOLON_REGEX);
        return ret;
      }
      function declarations() {
        var decls = [];
        comments(decls);
        var decl;
        while (decl = declaration()) {
          if (decl !== false) {
            decls.push(decl);
            comments(decls);
          }
        }
        return decls;
      }
      whitespace22();
      return declarations();
    }
    function trim(str) {
      return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
    }
    module.exports = index22;
  }
});
var require_cjs2 = __commonJS2({
  "node_modules/style-to-object/cjs/index.js"(exports$1) {
    var __importDefault = exports$1 && exports$1.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.default = StyleToObject;
    var inline_style_parser_1 = __importDefault(require_cjs());
    function StyleToObject(style, iterator) {
      let styleObject = null;
      if (!style || typeof style !== "string") {
        return styleObject;
      }
      const declarations = (0, inline_style_parser_1.default)(style);
      const hasIterator = typeof iterator === "function";
      declarations.forEach((declaration) => {
        if (declaration.type !== "declaration") {
          return;
        }
        const { property, value } = declaration;
        if (hasIterator) {
          iterator(property, value, declaration);
        } else if (value) {
          styleObject = styleObject || {};
          styleObject[property] = value;
        }
      });
      return styleObject;
    }
  }
});
var require_utilities = __commonJS2({
  "node_modules/style-to-js/cjs/utilities.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.camelCase = void 0;
    var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
    var HYPHEN_REGEX = /-([a-z])/g;
    var NO_HYPHEN_REGEX = /^[^-]+$/;
    var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
    var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
    var skipCamelCase = function(property) {
      return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
    };
    var capitalize = function(match, character) {
      return character.toUpperCase();
    };
    var trimHyphen = function(match, prefix) {
      return "".concat(prefix, "-");
    };
    var camelCase = function(property, options) {
      if (options === void 0) {
        options = {};
      }
      if (skipCamelCase(property)) {
        return property;
      }
      property = property.toLowerCase();
      if (options.reactCompat) {
        property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
      } else {
        property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
      }
      return property.replace(HYPHEN_REGEX, capitalize);
    };
    exports$1.camelCase = camelCase;
  }
});
var require_cjs3 = __commonJS2({
  "node_modules/style-to-js/cjs/index.js"(exports$1, module) {
    var __importDefault = exports$1 && exports$1.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var style_to_object_1 = __importDefault(require_cjs2());
    var utilities_1 = require_utilities();
    function StyleToJS(style, options) {
      var output = {};
      if (!style || typeof style !== "string") {
        return output;
      }
      (0, style_to_object_1.default)(style, function(property, value) {
        if (property && value) {
          output[(0, utilities_1.camelCase)(property, options)] = value;
        }
      });
      return output;
    }
    StyleToJS.default = StyleToJS;
    module.exports = StyleToJS;
  }
});
function getDate(data) {
  const defaultDateType = data.defaultDateType;
  if (!defaultDateType) {
    return void 0;
  }
  const dates = data.dates;
  return dates?.[defaultDateType];
}
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  if (endsWith(s2, suffix)) {
    s2 = s2.slice(0, -suffix.length);
  }
  return s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) {
    s2 = s2.substring(1);
  }
  if (!onlyStripPrefix && s2.endsWith("/")) {
    s2 = s2.slice(0, -1);
  }
  return s2;
}
function isFolderPath(fplike) {
  return fplike.endsWith("/") || endsWith(fplike, "index") || endsWith(fplike, "index.md") || endsWith(fplike, "index.html");
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x22) => x22 !== "").slice(0, -1).map((_2) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const res = joinSegments(pathToRoot(current), simplifySlug(target));
  return res;
}
var n;
var l;
var u;
var w = [];
function k(l22, u32, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u32) "key" == o2 ? i2 = u32[o2] : "ref" == o2 ? r2 = u32[o2] : e2[o2] = u32[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l22 && null != l22.defaultProps) for (o2 in l22.defaultProps) void 0 === e2[o2] && (e2[o2] = l22.defaultProps[o2]);
  return x(l22, e2, i2, r2, null);
}
function x(n22, t2, i2, r2, o2) {
  var e2 = { type: n22, props: t2, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u : o2, __i: -1, __u: 0 };
  return null != l.vnode && l.vnode(e2), e2;
}
function S(n22) {
  return n22.children;
}
n = w.slice, l = { __e: function(n22, l22, u32, t2) {
  for (var i2, r2, o2; l22 = l22.__; ) if ((i2 = l22.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n22)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n22, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n22 = l3;
  }
  throw n22;
} }, u = 0, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);
var f2 = 0;
function u2(e2, t2, n22, o2, i2, u32) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l22 = { type: e2, props: p2, key: n22, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u32 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l22), l22;
}
function byDateAndAlphabeticalFolderFirst(_cfg) {
  return (f1, f22) => {
    const f1IsFolder = isFolderPath(f1.slug ?? "");
    const f2IsFolder = isFolderPath(f22.slug ?? "");
    if (f1IsFolder && !f2IsFolder) return -1;
    if (!f1IsFolder && f2IsFolder) return 1;
    if (f1.dates && f22.dates) {
      return (getDate(f22)?.getTime() ?? 0) - (getDate(f1)?.getTime() ?? 0);
    } else if (f1.dates && !f22.dates) {
      return -1;
    } else if (!f1.dates && f22.dates) {
      return 1;
    }
    const f1Title = f1.frontmatter?.title?.toLowerCase() ?? "";
    const f2Title = f22.frontmatter?.title?.toLowerCase() ?? "";
    return f1Title.localeCompare(f2Title);
  };
}
function DateDisplay({ date, locale }) {
  return /* @__PURE__ */ u2("time", { dateTime: date.toISOString(), children: date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }) });
}
var PageList = ({
  cfg,
  fileData,
  allFiles,
  limit,
  sort
}) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst();
  let list = [...allFiles].sort(sorter);
  if (limit) {
    list = list.slice(0, limit);
  }
  const fileSlug = fileData?.slug;
  return /* @__PURE__ */ u2("ul", { class: "section-ul", children: list.map((page) => {
    const title = page.frontmatter?.title;
    const tags = page.frontmatter?.tags ?? [];
    return /* @__PURE__ */ u2("li", { class: "section-li", children: /* @__PURE__ */ u2("div", { class: "section", children: [
      /* @__PURE__ */ u2("p", { class: "meta", children: page.dates && getDate(page) && /* @__PURE__ */ u2(
        DateDisplay,
        {
          date: getDate(page),
          locale: cfg?.locale ?? "en-US"
        }
      ) }),
      /* @__PURE__ */ u2("div", { class: "desc", children: /* @__PURE__ */ u2("h3", { children: /* @__PURE__ */ u2(
        "a",
        {
          href: resolveRelative(fileSlug ?? "", page.slug),
          class: "internal",
          children: title
        }
      ) }) }),
      /* @__PURE__ */ u2("ul", { class: "tags", children: tags.map((tag) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2(
        "a",
        {
          class: "internal tag-link",
          href: resolveRelative(
            fileSlug ?? "",
            `tags/${tag}`
          ),
          children: tag
        }
      ) })) })
    ] }) });
  }) });
};
PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}
`;
function stringify(values, options) {
  const settings = {};
  const input = values[values.length - 1] === "" ? [...values, ""] : values;
  return input.join(
    (settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")
  ).trim();
}
function ok() {
}
var nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var emptyOptions = {};
function name(name22, options) {
  const settings = emptyOptions;
  const re22 = settings.jsx ? nameReJsx : nameRe;
  return re22.test(name22);
}
var re = /[ \t\n\f\r]/g;
function whitespace(thing) {
  return typeof thing === "object" ? thing.type === "text" ? empty(thing.value) : false : empty(thing);
}
function empty(value) {
  return value.replace(re, "") === "";
}
var Schema = class {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(property, normal, space) {
    this.normal = normal;
    this.property = property;
    if (space) {
      this.space = space;
    }
  }
};
Schema.prototype.normal = {};
Schema.prototype.property = {};
Schema.prototype.space = void 0;
function merge(definitions, space) {
  const property = {};
  const normal = {};
  for (const definition of definitions) {
    Object.assign(property, definition.property);
    Object.assign(normal, definition.normal);
  }
  return new Schema(property, normal, space);
}
function normalize(value) {
  return value.toLowerCase();
}
var Info = class {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(property, attribute) {
    this.attribute = attribute;
    this.property = property;
  }
};
Info.prototype.attribute = "";
Info.prototype.booleanish = false;
Info.prototype.boolean = false;
Info.prototype.commaOrSpaceSeparated = false;
Info.prototype.commaSeparated = false;
Info.prototype.defined = false;
Info.prototype.mustUseProperty = false;
Info.prototype.number = false;
Info.prototype.overloadedBoolean = false;
Info.prototype.property = "";
Info.prototype.spaceSeparated = false;
Info.prototype.space = void 0;
var types_exports = {};
__export2(types_exports, {
  boolean: () => boolean,
  booleanish: () => booleanish,
  commaOrSpaceSeparated: () => commaOrSpaceSeparated,
  commaSeparated: () => commaSeparated,
  number: () => number,
  overloadedBoolean: () => overloadedBoolean,
  spaceSeparated: () => spaceSeparated
});
var powers = 0;
var boolean = increment();
var booleanish = increment();
var overloadedBoolean = increment();
var number = increment();
var spaceSeparated = increment();
var commaSeparated = increment();
var commaOrSpaceSeparated = increment();
function increment() {
  return 2 ** ++powers;
}
var checks = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(types_exports)
);
var DefinedInfo = class extends Info {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(property, attribute, mask, space) {
    let index22 = -1;
    super(property, attribute);
    mark(this, "space", space);
    if (typeof mask === "number") {
      while (++index22 < checks.length) {
        const check = checks[index22];
        mark(this, checks[index22], (mask & types_exports[check]) === types_exports[check]);
      }
    }
  }
};
DefinedInfo.prototype.defined = true;
function mark(values, key, value) {
  if (value) {
    values[key] = value;
  }
}
function create(definition) {
  const properties = {};
  const normals = {};
  for (const [property, value] of Object.entries(definition.properties)) {
    const info = new DefinedInfo(
      property,
      definition.transform(definition.attributes || {}, property),
      value,
      definition.space
    );
    if (definition.mustUseProperty && definition.mustUseProperty.includes(property)) {
      info.mustUseProperty = true;
    }
    properties[property] = info;
    normals[normalize(property)] = property;
    normals[normalize(info.attribute)] = property;
  }
  return new Schema(properties, normals, definition.space);
}
var aria = create({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  },
  transform(_2, property) {
    return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
  }
});
function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute;
}
function caseInsensitiveTransform(attributes, property) {
  return caseSensitiveTransform(attributes, property.toLowerCase());
}
var html = create({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated,
    acceptCharset: spaceSeparated,
    accessKey: spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: spaceSeparated,
    autoFocus: boolean,
    autoPlay: boolean,
    blocking: spaceSeparated,
    capture: null,
    charSet: null,
    checked: boolean,
    cite: null,
    className: spaceSeparated,
    cols: number,
    colSpan: null,
    content: null,
    contentEditable: booleanish,
    controls: boolean,
    controlsList: spaceSeparated,
    coords: number | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: booleanish,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: spaceSeparated,
    height: number,
    hidden: overloadedBoolean,
    high: number,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated,
    httpEquiv: spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: boolean,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: spaceSeparated,
    itemRef: spaceSeparated,
    itemScope: boolean,
    itemType: spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: boolean,
    low: number,
    manifest: null,
    max: null,
    maxLength: number,
    media: null,
    method: null,
    min: null,
    minLength: number,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean,
    optimum: number,
    pattern: null,
    ping: spaceSeparated,
    placeholder: null,
    playsInline: boolean,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: spaceSeparated,
    required: boolean,
    reversed: boolean,
    rows: number,
    rowSpan: number,
    sandbox: spaceSeparated,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shadowRootClonable: boolean,
    shadowRootDelegatesFocus: boolean,
    shadowRootMode: null,
    shape: null,
    size: number,
    sizes: null,
    slot: null,
    span: number,
    spellCheck: booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: number,
    step: null,
    style: null,
    tabIndex: number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: booleanish,
    width: number,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: spaceSeparated,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: number,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: number,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: boolean,
    // Lists. Use CSS to reduce space between items instead
    declare: boolean,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: number,
    // `<img>` and `<object>`
    leftMargin: number,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: number,
    // `<body>`
    marginWidth: number,
    // `<body>`
    noResize: boolean,
    // `<frame>`
    noHref: boolean,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: number,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: booleanish,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: number,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: number,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: boolean,
    disableRemotePlayback: boolean,
    prefix: null,
    property: null,
    results: number,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: caseInsensitiveTransform
});
var svg = create({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: commaOrSpaceSeparated,
    accentHeight: number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number,
    amplitude: number,
    arabicForm: null,
    ascent: number,
    attributeName: null,
    attributeType: null,
    azimuth: number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number,
    by: null,
    calcMode: null,
    capHeight: number,
    className: spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number,
    diffuseConstant: number,
    direction: null,
    display: null,
    dur: null,
    divisor: number,
    dominantBaseline: null,
    download: boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated,
    g2: commaSeparated,
    glyphName: commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number,
    horizOriginX: number,
    horizOriginY: number,
    id: null,
    ideographic: number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number,
    k: number,
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    kernelMatrix: commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number,
    overlineThickness: number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number,
    pointsAtY: number,
    pointsAtZ: number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated,
    rev: commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated,
    requiredFeatures: commaOrSpaceSeparated,
    requiredFonts: commaOrSpaceSeparated,
    requiredFormats: commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number,
    specularExponent: number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number,
    strikethroughThickness: number,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number,
    strokeOpacity: number,
    strokeWidth: null,
    style: null,
    surfaceScale: number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated,
    tabIndex: number,
    tableValues: null,
    target: null,
    targetX: number,
    targetY: number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: number,
    underlineThickness: number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number,
    values: null,
    vAlphabetic: number,
    vMathematical: number,
    vectorEffect: null,
    vHanging: number,
    vIdeographic: number,
    version: null,
    vertAdvY: number,
    vertOriginX: number,
    vertOriginY: number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: caseSensitiveTransform
});
var xlink = create({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(_2, property) {
    return "xlink:" + property.slice(5).toLowerCase();
  }
});
var xmlns = create({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: caseInsensitiveTransform
});
var xml = create({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(_2, property) {
    return "xml:" + property.slice(3).toLowerCase();
  }
});
var hastToReact = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
};
var cap = /[A-Z]/g;
var dash = /-[a-z]/g;
var valid = /^data[-\w.:]+$/i;
function find(schema, value) {
  const normal = normalize(value);
  let property = value;
  let Type = Info;
  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]];
  }
  if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
    if (value.charAt(4) === "-") {
      const rest = value.slice(5).replace(dash, camelcase);
      property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      const rest = value.slice(4);
      if (!dash.test(rest)) {
        let dashes = rest.replace(cap, kebab);
        if (dashes.charAt(0) !== "-") {
          dashes = "-" + dashes;
        }
        value = "data" + dashes;
      }
    }
    Type = DefinedInfo;
  }
  return new Type(property, value);
}
function kebab($0) {
  return "-" + $0.toLowerCase();
}
function camelcase($0) {
  return $0.charAt(1).toUpperCase();
}
var html2 = merge([aria, html, xlink, xmlns, xml], "html");
var svg2 = merge([aria, svg, xlink, xmlns, xml], "svg");
function stringify2(values) {
  return values.join(" ").trim();
}
var import_style_to_js = __toESM2(require_cjs3());
var pointStart = point("start");
function point(type) {
  return point32;
  function point32(node) {
    const point42 = node && node.position && node.position[type] || {};
    if (typeof point42.line === "number" && point42.line > 0 && typeof point42.column === "number" && point42.column > 0) {
      return {
        line: point42.line,
        column: point42.column,
        offset: typeof point42.offset === "number" && point42.offset > -1 ? point42.offset : void 0
      };
    }
  }
}
function stringifyPosition(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position2(value.position);
  }
  if ("start" in value || "end" in value) {
    return position2(value);
  }
  if ("line" in value || "column" in value) {
    return point2(value);
  }
  return "";
}
function point2(point32) {
  return index(point32 && point32.line) + ":" + index(point32 && point32.column);
}
function position2(pos) {
  return point2(pos && pos.start) + "-" + point2(pos && pos.end);
}
function index(value) {
  return value && typeof value === "number" ? value : 1;
}
var VFileMessage = class extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(causeOrReason, optionsOrParentOrPlace, origin) {
    super();
    if (typeof optionsOrParentOrPlace === "string") {
      origin = optionsOrParentOrPlace;
      optionsOrParentOrPlace = void 0;
    }
    let reason = "";
    let options = {};
    let legacyCause = false;
    if (optionsOrParentOrPlace) {
      if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("type" in optionsOrParentOrPlace) {
        options = {
          ancestors: [optionsOrParentOrPlace],
          place: optionsOrParentOrPlace.position
        };
      } else {
        options = { ...optionsOrParentOrPlace };
      }
    }
    if (typeof causeOrReason === "string") {
      reason = causeOrReason;
    } else if (!options.cause && causeOrReason) {
      legacyCause = true;
      reason = causeOrReason.message;
      options.cause = causeOrReason;
    }
    if (!options.ruleId && !options.source && typeof origin === "string") {
      const index22 = origin.indexOf(":");
      if (index22 === -1) {
        options.ruleId = origin;
      } else {
        options.source = origin.slice(0, index22);
        options.ruleId = origin.slice(index22 + 1);
      }
    }
    if (!options.place && options.ancestors && options.ancestors) {
      const parent = options.ancestors[options.ancestors.length - 1];
      if (parent) {
        options.place = parent.position;
      }
    }
    const start2 = options.place && "start" in options.place ? options.place.start : options.place;
    this.ancestors = options.ancestors || void 0;
    this.cause = options.cause || void 0;
    this.column = start2 ? start2.column : void 0;
    this.fatal = void 0;
    this.file = "";
    this.message = reason;
    this.line = start2 ? start2.line : void 0;
    this.name = stringifyPosition(options.place) || "1:1";
    this.place = options.place || void 0;
    this.reason = this.message;
    this.ruleId = options.ruleId || void 0;
    this.source = options.source || void 0;
    this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
    this.actual = void 0;
    this.expected = void 0;
    this.note = void 0;
    this.url = void 0;
  }
};
VFileMessage.prototype.file = "";
VFileMessage.prototype.name = "";
VFileMessage.prototype.reason = "";
VFileMessage.prototype.message = "";
VFileMessage.prototype.stack = "";
VFileMessage.prototype.column = void 0;
VFileMessage.prototype.line = void 0;
VFileMessage.prototype.ancestors = void 0;
VFileMessage.prototype.cause = void 0;
VFileMessage.prototype.fatal = void 0;
VFileMessage.prototype.place = void 0;
VFileMessage.prototype.ruleId = void 0;
VFileMessage.prototype.source = void 0;
var own2 = {}.hasOwnProperty;
var emptyMap = /* @__PURE__ */ new Map();
var cap2 = /[A-Z]/g;
var tableElements = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]);
var tableCellElement = /* @__PURE__ */ new Set(["td", "th"]);
var docs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function toJsxRuntime(tree, options) {
  if (!options || options.Fragment === void 0) {
    throw new TypeError("Expected `Fragment` in options");
  }
  const filePath = options.filePath || void 0;
  let create22;
  if (options.development) {
    if (typeof options.jsxDEV !== "function") {
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    }
    create22 = developmentCreate(filePath, options.jsxDEV);
  } else {
    if (typeof options.jsx !== "function") {
      throw new TypeError("Expected `jsx` in production options");
    }
    if (typeof options.jsxs !== "function") {
      throw new TypeError("Expected `jsxs` in production options");
    }
    create22 = productionCreate(filePath, options.jsx, options.jsxs);
  }
  const state = {
    Fragment: options.Fragment,
    ancestors: [],
    components: options.components || {},
    create: create22,
    elementAttributeNameCase: options.elementAttributeNameCase || "react",
    evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
    filePath,
    ignoreInvalidStyle: options.ignoreInvalidStyle || false,
    passKeys: options.passKeys !== false,
    passNode: options.passNode || false,
    schema: options.space === "svg" ? svg2 : html2,
    stylePropertyNameCase: options.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: options.tableCellAlignToStyle !== false
  };
  const result = one(state, tree, void 0);
  if (result && typeof result !== "string") {
    return result;
  }
  return state.create(
    tree,
    state.Fragment,
    { children: result || void 0 },
    void 0
  );
}
function one(state, node, key) {
  if (node.type === "element") {
    return element(state, node, key);
  }
  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    return mdxExpression(state, node);
  }
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    return mdxJsxElement(state, node, key);
  }
  if (node.type === "mdxjsEsm") {
    return mdxEsm(state, node);
  }
  if (node.type === "root") {
    return root(state, node, key);
  }
  if (node.type === "text") {
    return text(state, node);
  }
}
function element(state, node, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
    schema = svg2;
    state.schema = schema;
  }
  state.ancestors.push(node);
  const type = findComponentFromName(state, node.tagName, false);
  const props = createElementProps(state, node);
  let children = createChildren(state, node);
  if (tableElements.has(node.tagName)) {
    children = children.filter(function(child) {
      return typeof child === "string" ? !whitespace(child) : true;
    });
  }
  addNode(state, props, type, node);
  addChildren(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node, type, props, key);
}
function mdxExpression(state, node) {
  if (node.data && node.data.estree && state.evaluater) {
    const program = node.data.estree;
    const expression = program.body[0];
    ok(expression.type === "ExpressionStatement");
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateExpression(expression.expression)
    );
  }
  crashEstree(state, node.position);
}
function mdxEsm(state, node) {
  if (node.data && node.data.estree && state.evaluater) {
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateProgram(node.data.estree)
    );
  }
  crashEstree(state, node.position);
}
function mdxJsxElement(state, node, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node.name === "svg" && parentSchema.space === "html") {
    schema = svg2;
    state.schema = schema;
  }
  state.ancestors.push(node);
  const type = node.name === null ? state.Fragment : findComponentFromName(state, node.name, true);
  const props = createJsxElementProps(state, node);
  const children = createChildren(state, node);
  addNode(state, props, type, node);
  addChildren(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node, type, props, key);
}
function root(state, node, key) {
  const props = {};
  addChildren(props, createChildren(state, node));
  return state.create(node, state.Fragment, props, key);
}
function text(_2, node) {
  return node.value;
}
function addNode(state, props, type, node) {
  if (typeof type !== "string" && type !== state.Fragment && state.passNode) {
    props.node = node;
  }
}
function addChildren(props, children) {
  if (children.length > 0) {
    const value = children.length > 1 ? children : children[0];
    if (value) {
      props.children = value;
    }
  }
}
function productionCreate(_2, jsx, jsxs) {
  return create22;
  function create22(_3, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const fn = isStaticChildren ? jsxs : jsx;
    return key ? fn(type, props, key) : fn(type, props);
  }
}
function developmentCreate(filePath, jsxDEV) {
  return create22;
  function create22(node, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const point32 = pointStart(node);
    return jsxDEV(
      type,
      props,
      key,
      isStaticChildren,
      {
        columnNumber: point32 ? point32.column - 1 : void 0,
        fileName: filePath,
        lineNumber: point32 ? point32.line : void 0
      },
      void 0
    );
  }
}
function createElementProps(state, node) {
  const props = {};
  let alignValue;
  let prop;
  for (prop in node.properties) {
    if (prop !== "children" && own2.call(node.properties, prop)) {
      const result = createProperty(state, prop, node.properties[prop]);
      if (result) {
        const [key, value] = result;
        if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement.has(node.tagName)) {
          alignValue = value;
        } else {
          props[key] = value;
        }
      }
    }
  }
  if (alignValue) {
    const style = (
      /** @type {Style} */
      props.style || (props.style = {})
    );
    style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
  }
  return props;
}
function createJsxElementProps(state, node) {
  const props = {};
  for (const attribute of node.attributes) {
    if (attribute.type === "mdxJsxExpressionAttribute") {
      if (attribute.data && attribute.data.estree && state.evaluater) {
        const program = attribute.data.estree;
        const expression = program.body[0];
        ok(expression.type === "ExpressionStatement");
        const objectExpression = expression.expression;
        ok(objectExpression.type === "ObjectExpression");
        const property = objectExpression.properties[0];
        ok(property.type === "SpreadElement");
        Object.assign(
          props,
          state.evaluater.evaluateExpression(property.argument)
        );
      } else {
        crashEstree(state, node.position);
      }
    } else {
      const name22 = attribute.name;
      let value;
      if (attribute.value && typeof attribute.value === "object") {
        if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
          const program = attribute.value.data.estree;
          const expression = program.body[0];
          ok(expression.type === "ExpressionStatement");
          value = state.evaluater.evaluateExpression(expression.expression);
        } else {
          crashEstree(state, node.position);
        }
      } else {
        value = attribute.value === null ? true : attribute.value;
      }
      props[name22] = /** @type {Props[keyof Props]} */
      value;
    }
  }
  return props;
}
function createChildren(state, node) {
  const children = [];
  let index22 = -1;
  const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
  while (++index22 < node.children.length) {
    const child = node.children[index22];
    let key;
    if (state.passKeys) {
      const name22 = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
      if (name22) {
        const count = countsByName.get(name22) || 0;
        key = name22 + "-" + count;
        countsByName.set(name22, count + 1);
      }
    }
    const result = one(state, child, key);
    if (result !== void 0) children.push(result);
  }
  return children;
}
function createProperty(state, prop, value) {
  const info = find(state.schema, prop);
  if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) {
    return;
  }
  if (Array.isArray(value)) {
    value = info.commaSeparated ? stringify(value) : stringify2(value);
  }
  if (info.property === "style") {
    let styleObject = typeof value === "object" ? value : parseStyle(state, String(value));
    if (state.stylePropertyNameCase === "css") {
      styleObject = transformStylesToCssCasing(styleObject);
    }
    return ["style", styleObject];
  }
  return [
    state.elementAttributeNameCase === "react" && info.space ? hastToReact[info.property] || info.property : info.attribute,
    value
  ];
}
function parseStyle(state, value) {
  try {
    return (0, import_style_to_js.default)(value, { reactCompat: true });
  } catch (error) {
    if (state.ignoreInvalidStyle) {
      return {};
    }
    const cause = (
      /** @type {Error} */
      error
    );
    const message = new VFileMessage("Cannot parse `style` attribute", {
      ancestors: state.ancestors,
      cause,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    message.file = state.filePath || void 0;
    message.url = docs + "#cannot-parse-style-attribute";
    throw message;
  }
}
function findComponentFromName(state, name22, allowExpression) {
  let result;
  if (!allowExpression) {
    result = { type: "Literal", value: name22 };
  } else if (name22.includes(".")) {
    const identifiers = name22.split(".");
    let index22 = -1;
    let node;
    while (++index22 < identifiers.length) {
      const prop = name(identifiers[index22]) ? { type: "Identifier", name: identifiers[index22] } : { type: "Literal", value: identifiers[index22] };
      node = node ? {
        type: "MemberExpression",
        object: node,
        property: prop,
        computed: Boolean(index22 && prop.type === "Literal"),
        optional: false
      } : prop;
    }
    result = node;
  } else {
    result = name(name22) && !/^[a-z]/.test(name22) ? { type: "Identifier", name: name22 } : { type: "Literal", value: name22 };
  }
  if (result.type === "Literal") {
    const name3 = (
      /** @type {string | number} */
      result.value
    );
    return own2.call(state.components, name3) ? state.components[name3] : name3;
  }
  if (state.evaluater) {
    return state.evaluater.evaluateExpression(result);
  }
  crashEstree(state);
}
function crashEstree(state, place) {
  const message = new VFileMessage(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: state.ancestors,
      place,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  message.file = state.filePath || void 0;
  message.url = docs + "#cannot-handle-mdx-estrees-without-createevaluater";
  throw message;
}
function transformStylesToCssCasing(domCasing) {
  const cssCasing = {};
  let from;
  for (from in domCasing) {
    if (own2.call(domCasing, from)) {
      cssCasing[transformStyleToCssCasing(from)] = domCasing[from];
    }
  }
  return cssCasing;
}
function transformStyleToCssCasing(from) {
  let to = from.replace(cap2, toDash);
  if (to.slice(0, 3) === "ms-") to = "-" + to;
  return to;
}
function toDash($0) {
  return "-" + $0.toLowerCase();
}
function childrenToString(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childrenToString).join("");
  return String(children ?? "");
}
var builtinComponents = {
  table: (props) => /* @__PURE__ */ u2("div", {
    class: "table-container",
    children: /* @__PURE__ */ u2("table", { ...props })
  }),
  style: ({ children, ...rest }) => k("style", { ...rest, dangerouslySetInnerHTML: { __html: childrenToString(children) } }),
  script: ({ children, ...rest }) => k("script", { ...rest, dangerouslySetInnerHTML: { __html: childrenToString(children) } })
};
function htmlToJsx(tree, components) {
  return toJsxRuntime(tree, {
    Fragment: S,
    jsx: u2,
    jsxs: u2,
    elementAttributeNameCase: "html",
    components: { ...builtinComponents, ...components }
  });
}
var en_US_default = {
  pages: {
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 item under this folder." : `${count} items under this folder.`
    }
  },
  components: {}
};
var ar_SA_default = {
  pages: {
    folderContent: {
      folder: "\u0645\u062C\u0644\u062F",
      itemsUnderFolder: ({ count }) => count === 1 ? "\u064A\u0648\u062C\u062F \u0639\u0646\u0635\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u062A\u062D\u062A \u0647\u0630\u0627 \u0627\u0644\u0645\u062C\u0644\u062F" : `\u064A\u0648\u062C\u062F ${count} \u0639\u0646\u0627\u0635\u0631 \u062A\u062D\u062A \u0647\u0630\u0627 \u0627\u0644\u0645\u062C\u0644\u062F.`
    }
  },
  components: {}
};
var ca_ES_default = {
  pages: {
    folderContent: {
      folder: "Carpeta",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 article en aquesta carpeta." : `${count} articles en esta carpeta.`
    }
  },
  components: {}
};
var cs_CZ_default = {
  pages: {
    folderContent: {
      folder: "Slo\u017Eka",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 polo\u017Eka v t\xE9to slo\u017Ece." : `${count} polo\u017Eek v t\xE9to slo\u017Ece.`
    }
  },
  components: {}
};
var de_DE_default = {
  pages: {
    folderContent: {
      folder: "Ordner",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 Datei in diesem Ordner." : `${count} Dateien in diesem Ordner.`
    }
  },
  components: {}
};
var en_GB_default = {
  pages: {
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 item under this folder." : `${count} items under this folder.`
    }
  },
  components: {}
};
var es_ES_default = {
  pages: {
    folderContent: {
      folder: "Carpeta",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 art\xEDculo en esta carpeta." : `${count} art\xEDculos en esta carpeta.`
    }
  },
  components: {}
};
var fa_IR_default = {
  pages: {
    folderContent: {
      folder: "\u067E\u0648\u0634\u0647",
      itemsUnderFolder: ({ count }) => count === 1 ? ".\u06CC\u06A9 \u0645\u0637\u0644\u0628 \u062F\u0631 \u0627\u06CC\u0646 \u067E\u0648\u0634\u0647 \u0627\u0633\u062A" : `${count} \u0645\u0637\u0644\u0628 \u062F\u0631 \u0627\u06CC\u0646 \u067E\u0648\u0634\u0647 \u0627\u0633\u062A.`
    }
  },
  components: {}
};
var fi_FI_default = {
  pages: {
    folderContent: {
      folder: "Kansio",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 kohde t\xE4ss\xE4 kansiossa." : `${count} kohdetta t\xE4ss\xE4 kansiossa.`
    }
  },
  components: {}
};
var fr_FR_default = {
  pages: {
    folderContent: {
      folder: "Dossier",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 \xE9l\xE9ment sous ce dossier." : `${count} \xE9l\xE9ments sous ce dossier.`
    }
  },
  components: {}
};
var he_IL_default = {
  pages: {
    folderContent: {
      folder: "\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4",
      itemsUnderFolder: ({ count }) => count === 1 ? "\u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3 \u05EA\u05D7\u05EA \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05D6\u05D5." : `${count} \u05E4\u05E8\u05D9\u05D8\u05D9\u05DD \u05EA\u05D7\u05EA \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05D6\u05D5.`
    }
  },
  components: {}
};
var hu_HU_default = {
  pages: {
    folderContent: {
      folder: "Mappa",
      itemsUnderFolder: ({ count }) => `Ebben a mapp\xE1ban ${count} elem tal\xE1lhat\xF3.`
    }
  },
  components: {}
};
var id_ID_default = {
  pages: {
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 item di bawah folder ini." : `${count} item di bawah folder ini.`
    }
  },
  components: {}
};
var it_IT_default = {
  pages: {
    folderContent: {
      folder: "Cartella",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 oggetto in questa cartella." : `${count} oggetti in questa cartella.`
    }
  },
  components: {}
};
var ja_JP_default = {
  pages: {
    folderContent: {
      folder: "\u30D5\u30A9\u30EB\u30C0",
      itemsUnderFolder: ({ count }) => `${count}\u4EF6\u306E\u30DA\u30FC\u30B8`
    }
  },
  components: {}
};
var kk_KZ_default = {
  pages: {
    folderContent: {
      folder: "\u049A\u0430\u043B\u0442\u0430",
      itemsUnderFolder: ({ count }) => count === 1 ? "\u0411\u04B1\u043B \u049B\u0430\u043B\u0442\u0430\u0434\u0430 1 \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u0431\u0430\u0440." : `\u0411\u04B1\u043B \u049B\u0430\u043B\u0442\u0430\u0434\u0430 ${count} \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u0431\u0430\u0440.`
    }
  },
  components: {}
};
var ko_KR_default = {
  pages: {
    folderContent: {
      folder: "\uD3F4\uB354",
      itemsUnderFolder: ({ count }) => `${count}\uAC74\uC758 \uD56D\uBAA9`
    }
  },
  components: {}
};
var lt_LT_default = {
  pages: {
    folderContent: {
      folder: "Aplankas",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 elementas \u0161iame aplanke." : count < 10 ? `${count} elementai \u0161iame aplanke.` : `${count} element\u0173 \u0161iame aplanke.`
    }
  },
  components: {}
};
var nb_NO_default = {
  pages: {
    folderContent: {
      folder: "Mappe",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 gjenstand i denne mappen." : `${count} gjenstander i denne mappen.`
    }
  },
  components: {}
};
var nl_NL_default = {
  pages: {
    folderContent: {
      folder: "Map",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 item in deze map." : `${count} items in deze map.`
    }
  },
  components: {}
};
var pl_PL_default = {
  pages: {
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: ({ count }) => count === 1 ? "W tym folderze jest 1 element." : `Element\xF3w w folderze: ${count}.`
    }
  },
  components: {}
};
var pt_BR_default = {
  pages: {
    folderContent: {
      folder: "Arquivo",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 item neste arquivo." : `${count} items neste arquivo.`
    }
  },
  components: {}
};
var ro_RO_default = {
  pages: {
    folderContent: {
      folder: "Dosar",
      itemsUnderFolder: ({ count }) => count === 1 ? "1 articol \xEEn acest dosar." : `${count} elemente \xEEn acest dosar.`
    }
  },
  components: {}
};
var ru_RU_default = {
  pages: {
    folderContent: {
      folder: "\u041F\u0430\u043F\u043A\u0430",
      itemsUnderFolder: ({ count }) => `\u0432 \u044D\u0442\u043E\u0439 \u043F\u0430\u043F\u043A\u0435 ${count} \u044D\u043B\u0435\u043C\u0435\u043D\u0442${getForm(count, "", "\u0430", "\u043E\u0432")}`
    }
  },
  components: {}
};
function getForm(number22, form1, form2, form5) {
  const remainder100 = number22 % 100;
  const remainder10 = remainder100 % 10;
  if (remainder100 >= 10 && remainder100 <= 20) return form5;
  if (remainder10 > 1 && remainder10 < 5) return form2;
  if (remainder10 == 1) return form1;
  return form5;
}
var th_TH_default = {
  pages: {
    folderContent: {
      folder: "\u0E42\u0E1F\u0E25\u0E40\u0E14\u0E2D\u0E23\u0E4C",
      itemsUnderFolder: ({ count }) => `\u0E21\u0E35 ${count} \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E43\u0E19\u0E42\u0E1F\u0E25\u0E40\u0E14\u0E2D\u0E23\u0E4C\u0E19\u0E35\u0E49`
    }
  },
  components: {}
};
var tr_TR_default = {
  pages: {
    folderContent: {
      folder: "Klas\xF6r",
      itemsUnderFolder: ({ count }) => count === 1 ? "Bu klas\xF6r alt\u0131nda 1 \xF6\u011Fe." : `Bu klas\xF6r alt\u0131ndaki ${count} \xF6\u011Fe.`
    }
  },
  components: {}
};
var uk_UA_default = {
  pages: {
    folderContent: {
      folder: "\u0422\u0435\u043A\u0430",
      itemsUnderFolder: ({ count }) => count === 1 ? "\u0423 \u0446\u0456\u0439 \u0442\u0435\u0446\u0456 1 \u0435\u043B\u0435\u043C\u0435\u043D\u0442." : `\u0415\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432 \u0443 \u0446\u0456\u0439 \u0442\u0435\u0446\u0456: ${count}.`
    }
  },
  components: {}
};
var vi_VN_default = {
  pages: {
    folderContent: {
      folder: "Th\u01B0 m\u1EE5c",
      itemsUnderFolder: ({ count }) => `C\xF3 ${count} trang trong th\u01B0 m\u1EE5c n\xE0y.`
    }
  },
  components: {}
};
var zh_CN_default = {
  pages: {
    folderContent: {
      folder: "\u6587\u4EF6\u5939",
      itemsUnderFolder: ({ count }) => `\u6B64\u6587\u4EF6\u5939\u4E0B\u6709${count}\u6761\u7B14\u8BB0\u3002`
    }
  },
  components: {}
};
var zh_TW_default = {
  pages: {
    folderContent: {
      folder: "\u8CC7\u6599\u593E",
      itemsUnderFolder: ({ count }) => `\u6B64\u8CC7\u6599\u593E\u4E0B\u6709 ${count} \u689D\u7B46\u8A18\u3002`
    }
  },
  components: {}
};
var locales = {
  "en-US": en_US_default,
  "ar-SA": ar_SA_default,
  "ca-ES": ca_ES_default,
  "cs-CZ": cs_CZ_default,
  "de-DE": de_DE_default,
  "en-GB": en_GB_default,
  "es-ES": es_ES_default,
  "fa-IR": fa_IR_default,
  "fi-FI": fi_FI_default,
  "fr-FR": fr_FR_default,
  "he-IL": he_IL_default,
  "hu-HU": hu_HU_default,
  "id-ID": id_ID_default,
  "it-IT": it_IT_default,
  "ja-JP": ja_JP_default,
  "kk-KZ": kk_KZ_default,
  "ko-KR": ko_KR_default,
  "lt-LT": lt_LT_default,
  "nb-NO": nb_NO_default,
  "nl-NL": nl_NL_default,
  "pl-PL": pl_PL_default,
  "pt-BR": pt_BR_default,
  "ro-RO": ro_RO_default,
  "ru-RU": ru_RU_default,
  "th-TH": th_TH_default,
  "tr-TR": tr_TR_default,
  "uk-UA": uk_UA_default,
  "vi-VN": vi_VN_default,
  "zh-CN": zh_CN_default,
  "zh-TW": zh_TW_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}
var listPage_default = "ul.section-ul {\n  list-style: none;\n  margin-top: 2em;\n  padding-left: 0;\n}\n\nli.section-li {\n  margin-bottom: 1em;\n}\nli.section-li > .section {\n  display: grid;\n  grid-template-columns: fit-content(8em) 3fr 1fr;\n}\n@media all and (max-width: 600px) {\n  li.section-li > .section > .tags {\n    display: none;\n  }\n}\nli.section-li > .section > .desc > h3 > a {\n  background-color: transparent;\n}\nli.section-li > .section .meta {\n  margin: 0 1em 0 0;\n  opacity: 0.6;\n}\n\n.popover .section {\n  grid-template-columns: fit-content(8em) 1fr !important;\n}\n.popover .section > .tags {\n  display: none;\n}";
var defaultOptions = {
  showFolderCount: true,
  showSubfolders: true
};
function concatenateResources(...resources) {
  const result = resources.filter((r2) => r2 !== void 0).flat();
  return result.length === 0 ? void 0 : result;
}
function pagesFromTrie(folder, showSubfolders) {
  return folder.children.map((node) => {
    const nodeData = node.data;
    if (nodeData) {
      if (nodeData.unlisted === true) return void 0;
      return nodeData;
    }
    if (node.isFolder && showSubfolders) {
      return {
        slug: node.slug,
        dates: mostRecentDatesFromChildren(node.children),
        frontmatter: { title: node.displayName, tags: [] }
      };
    }
    return void 0;
  }).filter((page) => page !== void 0);
}
function pagesFromAllFiles(allFiles, folderSlug, showSubfolders) {
  const folderPrefix = folderSlug.endsWith("/index") ? folderSlug.slice(0, -"index".length) : folderSlug.endsWith("/") ? folderSlug : folderSlug + "/";
  const directChildren = [];
  const subfolderFiles = /* @__PURE__ */ new Map();
  for (const file of allFiles) {
    if (file.unlisted === true) continue;
    const fileSlug = file.slug;
    if (!fileSlug || !fileSlug.startsWith(folderPrefix)) continue;
    const relativePath = fileSlug.slice(folderPrefix.length);
    if (!relativePath || relativePath === "index") continue;
    const segments = relativePath.split("/");
    if (segments.length === 1) {
      directChildren.push(file);
    } else if (showSubfolders) {
      const subfolderName = segments[0];
      if (!subfolderFiles.has(subfolderName)) {
        subfolderFiles.set(subfolderName, []);
      }
      subfolderFiles.get(subfolderName).push(file);
    }
  }
  for (const [subfolderName, files] of subfolderFiles) {
    const indexFile = files.find((f32) => f32.slug === `${folderPrefix}${subfolderName}/index`);
    if (indexFile) continue;
    directChildren.push({
      slug: `${folderPrefix}${subfolderName}/index`,
      dates: mostRecentDatesFromEntries(files),
      frontmatter: { title: subfolderName, tags: [] }
    });
  }
  return directChildren;
}
function mostRecentDatesFromChildren(children) {
  let maybeDates;
  for (const child of children) {
    const childDates = child.data?.dates;
    if (childDates) {
      if (!maybeDates) {
        maybeDates = { ...childDates };
      } else {
        if (childDates.created > maybeDates.created) maybeDates.created = childDates.created;
        if (childDates.modified > maybeDates.modified) maybeDates.modified = childDates.modified;
        if (childDates.published > maybeDates.published)
          maybeDates.published = childDates.published;
      }
    }
  }
  return maybeDates ?? { created: /* @__PURE__ */ new Date(), modified: /* @__PURE__ */ new Date(), published: /* @__PURE__ */ new Date() };
}
function mostRecentDatesFromEntries(entries) {
  let maybeDates;
  for (const entry of entries) {
    if (entry.dates) {
      if (!maybeDates) {
        maybeDates = { ...entry.dates };
      } else {
        if (entry.dates.created > maybeDates.created) maybeDates.created = entry.dates.created;
        if (entry.dates.modified > maybeDates.modified) maybeDates.modified = entry.dates.modified;
        if (entry.dates.published > maybeDates.published)
          maybeDates.published = entry.dates.published;
      }
    }
  }
  return maybeDates ?? { created: /* @__PURE__ */ new Date(), modified: /* @__PURE__ */ new Date(), published: /* @__PURE__ */ new Date() };
}
var FolderContent_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const FolderContent = (props) => {
    const { tree, fileData, allFiles, cfg } = props;
    const ctx = props.ctx;
    const slug2 = fileData?.slug;
    if (!slug2) return null;
    const trie = ctx?.trie;
    let allPagesInFolder;
    if (trie) {
      const folder = trie.findNode(slug2.split("/"));
      if (!folder) return null;
      allPagesInFolder = pagesFromTrie(folder, options.showSubfolders);
    } else {
      allPagesInFolder = pagesFromAllFiles(allFiles ?? [], slug2, options.showSubfolders);
    }
    const cssClasses = fileData?.frontmatter?.cssclasses ?? [];
    const classes = cssClasses.join(" ");
    const listProps = {
      ...props,
      sort: options.sort,
      allFiles: allPagesInFolder
    };
    const hastRoot = tree;
    const content = hastRoot.children.length === 0 ? fileData?.description : htmlToJsx(hastRoot);
    const pageListContent = PageList(listProps);
    return /* @__PURE__ */ u2("div", { class: "popover-hint", children: [
      /* @__PURE__ */ u2("article", { class: classes, children: /* @__PURE__ */ u2("div", { class: "markdown-preview-view markdown-rendered", children: content }) }),
      /* @__PURE__ */ u2("div", { class: "page-listing", children: [
        options.showFolderCount && /* @__PURE__ */ u2("p", { children: i18n(
          cfg?.locale ?? "en-US"
        ).pages.folderContent.itemsUnderFolder({
          count: allPagesInFolder.length
        }) }),
        /* @__PURE__ */ u2("div", { children: pageListContent })
      ] })
    ] });
  };
  FolderContent.css = concatenateResources(listPage_default, PageList.css);
  return FolderContent;
});
var folderMatcher = ({ slug: slug2 }) => {
  return slug2.endsWith("/index");
};
function getFolders(slug2) {
  let folderName = path.dirname(slug2 ?? "");
  const parentFolderNames = [folderName];
  while (folderName !== ".") {
    folderName = path.dirname(folderName ?? "");
    parentFolderNames.push(folderName);
  }
  return parentFolderNames;
}
var FolderPage = (opts) => {
  const body = () => FolderContent_default(opts);
  return {
    name: "FolderPage",
    priority: 10,
    match: folderMatcher,
    generate({ content, cfg }) {
      const allFiles = content.map((c2) => c2[1].data).filter((d2) => d2?.unlisted !== true);
      const locale = cfg?.locale ?? "en-US";
      const folders = /* @__PURE__ */ new Set();
      const folderDisplayNames = /* @__PURE__ */ new Map();
      for (const file of allFiles) {
        const slug2 = file?.slug;
        if (!slug2) continue;
        const fileFolders = getFolders(slug2).filter((f32) => f32 !== "." && f32 !== "tags");
        for (const f32 of fileFolders) {
          folders.add(f32);
        }
        const relativePath = file?.relativePath;
        if (relativePath) {
          const slugParts = path.dirname(slug2).split("/").filter((s2) => s2 !== ".");
          const pathParts = path.dirname(relativePath).split("/").filter((s2) => s2 !== ".");
          for (let i2 = 0; i2 < slugParts.length && i2 < pathParts.length; i2++) {
            const slugPart = slugParts[i2];
            const pathPart = pathParts[i2];
            if (slugPart && pathPart && !folderDisplayNames.has(slugPart)) {
              folderDisplayNames.set(slugPart, pathPart);
            }
          }
        }
      }
      const foldersWithIndex = /* @__PURE__ */ new Set();
      for (const [, file] of content) {
        const data = file.data;
        if (data?.unlisted === true) continue;
        const slug2 = data?.slug;
        if (slug2 && slug2.endsWith("/index")) {
          const folder = slug2.slice(0, -"/index".length);
          foldersWithIndex.add(folder);
        }
      }
      for (const [, file] of content) {
        const slug2 = file.data?.slug;
        if (!slug2 || !slug2.endsWith("/index")) continue;
        const frontmatter = file.data.frontmatter;
        if (!frontmatter || frontmatter.title && frontmatter.title !== "index") continue;
        const folder = slug2.slice(0, -"/index".length);
        const slugSegment = folder.split("/").pop() ?? folder;
        const folderName = folderDisplayNames.get(slugSegment) ?? slugSegment;
        frontmatter.title = opts?.prefixFolders ? `${i18n(locale).pages.folderContent.folder}: ${folderName}` : folderName;
      }
      const virtualPages = [];
      for (const folder of folders) {
        if (foldersWithIndex.has(folder)) continue;
        const slug2 = joinSegments(folder, "index");
        const slugSegment = folder.split("/").pop() ?? folder;
        const folderName = folderDisplayNames.get(slugSegment) ?? slugSegment;
        const title = opts?.prefixFolders ? `${i18n(locale).pages.folderContent.folder}: ${folderName}` : folderName;
        virtualPages.push({
          slug: slug2,
          title,
          data: {}
        });
      }
      return virtualPages;
    },
    layout: "folder",
    body
  };
};

// node_modules/comma-separated-tokens/index.js
function stringify3(values, options) {
  const settings = {};
  const input = values[values.length - 1] === "" ? [...values, ""] : values;
  return input.join(
    (settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")
  ).trim();
}

// node_modules/devlop/lib/default.js
function ok2() {
}

// node_modules/estree-util-is-identifier-name/lib/index.js
var nameRe2 = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var nameReJsx2 = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var emptyOptions2 = {};
function name2(name3, options) {
  const settings = emptyOptions2;
  const re3 = settings.jsx ? nameReJsx2 : nameRe2;
  return re3.test(name3);
}

// node_modules/hast-util-whitespace/lib/index.js
var re2 = /[ \t\n\f\r]/g;
function whitespace2(thing) {
  return typeof thing === "object" ? thing.type === "text" ? empty2(thing.value) : false : empty2(thing);
}
function empty2(value) {
  return value.replace(re2, "") === "";
}

// node_modules/property-information/lib/util/schema.js
var Schema2 = class {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(property, normal, space) {
    this.normal = normal;
    this.property = property;
    if (space) {
      this.space = space;
    }
  }
};
Schema2.prototype.normal = {};
Schema2.prototype.property = {};
Schema2.prototype.space = void 0;

// node_modules/property-information/lib/util/merge.js
function merge2(definitions, space) {
  const property = {};
  const normal = {};
  for (const definition of definitions) {
    Object.assign(property, definition.property);
    Object.assign(normal, definition.normal);
  }
  return new Schema2(property, normal, space);
}

// node_modules/property-information/lib/normalize.js
function normalize2(value) {
  return value.toLowerCase();
}

// node_modules/property-information/lib/util/info.js
var Info2 = class {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(property, attribute) {
    this.attribute = attribute;
    this.property = property;
  }
};
Info2.prototype.attribute = "";
Info2.prototype.booleanish = false;
Info2.prototype.boolean = false;
Info2.prototype.commaOrSpaceSeparated = false;
Info2.prototype.commaSeparated = false;
Info2.prototype.defined = false;
Info2.prototype.mustUseProperty = false;
Info2.prototype.number = false;
Info2.prototype.overloadedBoolean = false;
Info2.prototype.property = "";
Info2.prototype.spaceSeparated = false;
Info2.prototype.space = void 0;

// node_modules/property-information/lib/util/types.js
var types_exports2 = {};
__export(types_exports2, {
  boolean: () => boolean2,
  booleanish: () => booleanish2,
  commaOrSpaceSeparated: () => commaOrSpaceSeparated2,
  commaSeparated: () => commaSeparated2,
  number: () => number2,
  overloadedBoolean: () => overloadedBoolean2,
  spaceSeparated: () => spaceSeparated2
});
var powers2 = 0;
var boolean2 = increment2();
var booleanish2 = increment2();
var overloadedBoolean2 = increment2();
var number2 = increment2();
var spaceSeparated2 = increment2();
var commaSeparated2 = increment2();
var commaOrSpaceSeparated2 = increment2();
function increment2() {
  return 2 ** ++powers2;
}

// node_modules/property-information/lib/util/defined-info.js
var checks2 = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(types_exports2)
);
var DefinedInfo2 = class extends Info2 {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(property, attribute, mask, space) {
    let index3 = -1;
    super(property, attribute);
    mark2(this, "space", space);
    if (typeof mask === "number") {
      while (++index3 < checks2.length) {
        const check = checks2[index3];
        mark2(this, checks2[index3], (mask & types_exports2[check]) === types_exports2[check]);
      }
    }
  }
};
DefinedInfo2.prototype.defined = true;
function mark2(values, key, value) {
  if (value) {
    values[key] = value;
  }
}

// node_modules/property-information/lib/util/create.js
function create2(definition) {
  const properties = {};
  const normals = {};
  for (const [property, value] of Object.entries(definition.properties)) {
    const info = new DefinedInfo2(
      property,
      definition.transform(definition.attributes || {}, property),
      value,
      definition.space
    );
    if (definition.mustUseProperty && definition.mustUseProperty.includes(property)) {
      info.mustUseProperty = true;
    }
    properties[property] = info;
    normals[normalize2(property)] = property;
    normals[normalize2(info.attribute)] = property;
  }
  return new Schema2(properties, normals, definition.space);
}

// node_modules/property-information/lib/aria.js
var aria2 = create2({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish2,
    ariaAutoComplete: null,
    ariaBusy: booleanish2,
    ariaChecked: booleanish2,
    ariaColCount: number2,
    ariaColIndex: number2,
    ariaColSpan: number2,
    ariaControls: spaceSeparated2,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated2,
    ariaDetails: null,
    ariaDisabled: booleanish2,
    ariaDropEffect: spaceSeparated2,
    ariaErrorMessage: null,
    ariaExpanded: booleanish2,
    ariaFlowTo: spaceSeparated2,
    ariaGrabbed: booleanish2,
    ariaHasPopup: null,
    ariaHidden: booleanish2,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated2,
    ariaLevel: number2,
    ariaLive: null,
    ariaModal: booleanish2,
    ariaMultiLine: booleanish2,
    ariaMultiSelectable: booleanish2,
    ariaOrientation: null,
    ariaOwns: spaceSeparated2,
    ariaPlaceholder: null,
    ariaPosInSet: number2,
    ariaPressed: booleanish2,
    ariaReadOnly: booleanish2,
    ariaRelevant: null,
    ariaRequired: booleanish2,
    ariaRoleDescription: spaceSeparated2,
    ariaRowCount: number2,
    ariaRowIndex: number2,
    ariaRowSpan: number2,
    ariaSelected: booleanish2,
    ariaSetSize: number2,
    ariaSort: null,
    ariaValueMax: number2,
    ariaValueMin: number2,
    ariaValueNow: number2,
    ariaValueText: null,
    role: null
  },
  transform(_2, property) {
    return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
  }
});

// node_modules/property-information/lib/util/case-sensitive-transform.js
function caseSensitiveTransform2(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute;
}

// node_modules/property-information/lib/util/case-insensitive-transform.js
function caseInsensitiveTransform2(attributes, property) {
  return caseSensitiveTransform2(attributes, property.toLowerCase());
}

// node_modules/property-information/lib/html.js
var html3 = create2({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated2,
    acceptCharset: spaceSeparated2,
    accessKey: spaceSeparated2,
    action: null,
    allow: null,
    allowFullScreen: boolean2,
    allowPaymentRequest: boolean2,
    allowUserMedia: boolean2,
    alpha: boolean2,
    alt: null,
    as: null,
    async: boolean2,
    autoCapitalize: null,
    autoComplete: spaceSeparated2,
    autoFocus: boolean2,
    autoPlay: boolean2,
    blocking: spaceSeparated2,
    capture: null,
    charSet: null,
    checked: boolean2,
    cite: null,
    className: spaceSeparated2,
    closedBy: null,
    colorSpace: null,
    cols: number2,
    colSpan: number2,
    command: null,
    commandFor: null,
    content: null,
    contentEditable: booleanish2,
    controls: boolean2,
    controlsList: spaceSeparated2,
    coords: number2 | commaSeparated2,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean2,
    defer: boolean2,
    dir: null,
    dirName: null,
    disabled: boolean2,
    download: overloadedBoolean2,
    draggable: booleanish2,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean2,
    formTarget: null,
    headers: spaceSeparated2,
    height: number2,
    hidden: overloadedBoolean2,
    high: number2,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated2,
    httpEquiv: spaceSeparated2,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: boolean2,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean2,
    itemId: null,
    itemProp: spaceSeparated2,
    itemRef: spaceSeparated2,
    itemScope: boolean2,
    itemType: spaceSeparated2,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: boolean2,
    low: number2,
    manifest: null,
    max: null,
    maxLength: number2,
    media: null,
    method: null,
    min: null,
    minLength: number2,
    multiple: boolean2,
    muted: boolean2,
    name: null,
    nonce: null,
    noModule: boolean2,
    noValidate: boolean2,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean2,
    optimum: number2,
    pattern: null,
    ping: spaceSeparated2,
    placeholder: null,
    playsInline: boolean2,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: boolean2,
    referrerPolicy: null,
    rel: spaceSeparated2,
    required: boolean2,
    reversed: boolean2,
    rows: number2,
    rowSpan: number2,
    sandbox: spaceSeparated2,
    scope: null,
    scoped: boolean2,
    seamless: boolean2,
    selected: boolean2,
    shadowRootClonable: boolean2,
    shadowRootCustomElementRegistry: boolean2,
    shadowRootDelegatesFocus: boolean2,
    shadowRootMode: null,
    shadowRootSerializable: boolean2,
    shape: null,
    size: number2,
    sizes: null,
    slot: null,
    span: number2,
    spellCheck: booleanish2,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: number2,
    step: null,
    style: null,
    tabIndex: number2,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean2,
    useMap: null,
    value: booleanish2,
    width: number2,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: spaceSeparated2,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: number2,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: number2,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: boolean2,
    // Lists. Use CSS to reduce space between items instead
    declare: boolean2,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: number2,
    // `<img>` and `<object>`
    leftMargin: number2,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: number2,
    // `<body>`
    marginWidth: number2,
    // `<body>`
    noResize: boolean2,
    // `<frame>`
    noHref: boolean2,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean2,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean2,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: number2,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: booleanish2,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: number2,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: number2,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    credentialless: boolean2,
    disablePictureInPicture: boolean2,
    disableRemotePlayback: boolean2,
    exportParts: commaSeparated2,
    part: spaceSeparated2,
    prefix: null,
    property: null,
    results: number2,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: caseInsensitiveTransform2
});

// node_modules/property-information/lib/svg.js
var svg3 = create2({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    maskType: "mask-type",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: commaOrSpaceSeparated2,
    accentHeight: number2,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number2,
    amplitude: number2,
    arabicForm: null,
    ascent: number2,
    attributeName: null,
    attributeType: null,
    azimuth: number2,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number2,
    by: null,
    calcMode: null,
    capHeight: number2,
    className: spaceSeparated2,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number2,
    diffuseConstant: number2,
    direction: null,
    display: null,
    dur: null,
    divisor: number2,
    dominantBaseline: null,
    download: boolean2,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number2,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number2,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number2,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated2,
    g2: commaSeparated2,
    glyphName: commaSeparated2,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number2,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number2,
    horizOriginX: number2,
    horizOriginY: number2,
    id: null,
    ideographic: number2,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number2,
    k: number2,
    k1: number2,
    k2: number2,
    k3: number2,
    k4: number2,
    kernelMatrix: commaOrSpaceSeparated2,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number2,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskType: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number2,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number2,
    overlineThickness: number2,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number2,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated2,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number2,
    pointsAtY: number2,
    pointsAtZ: number2,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated2,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated2,
    rev: commaOrSpaceSeparated2,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated2,
    requiredFeatures: commaOrSpaceSeparated2,
    requiredFonts: commaOrSpaceSeparated2,
    requiredFormats: commaOrSpaceSeparated2,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number2,
    specularExponent: number2,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number2,
    strikethroughThickness: number2,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated2,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number2,
    strokeOpacity: number2,
    strokeWidth: null,
    style: null,
    surfaceScale: number2,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated2,
    tabIndex: number2,
    tableValues: null,
    target: null,
    targetX: number2,
    targetY: number2,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated2,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: number2,
    underlineThickness: number2,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number2,
    values: null,
    vAlphabetic: number2,
    vMathematical: number2,
    vectorEffect: null,
    vHanging: number2,
    vIdeographic: number2,
    version: null,
    vertAdvY: number2,
    vertOriginX: number2,
    vertOriginY: number2,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number2,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: caseSensitiveTransform2
});

// node_modules/property-information/lib/xlink.js
var xlink2 = create2({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(_2, property) {
    return "xlink:" + property.slice(5).toLowerCase();
  }
});

// node_modules/property-information/lib/xmlns.js
var xmlns2 = create2({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: caseInsensitiveTransform2
});

// node_modules/property-information/lib/xml.js
var xml2 = create2({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(_2, property) {
    return "xml:" + property.slice(3).toLowerCase();
  }
});

// node_modules/property-information/lib/hast-to-react.js
var hastToReact2 = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
};

// node_modules/property-information/lib/find.js
var cap3 = /[A-Z]/g;
var dash2 = /-[a-z]/g;
var valid2 = /^data[-\w.:]+$/i;
function find2(schema, value) {
  const normal = normalize2(value);
  let property = value;
  let Type = Info2;
  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]];
  }
  if (normal.length > 4 && normal.slice(0, 4) === "data" && valid2.test(value)) {
    if (value.charAt(4) === "-") {
      const rest = value.slice(5).replace(dash2, camelcase2);
      property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      const rest = value.slice(4);
      if (!dash2.test(rest)) {
        let dashes = rest.replace(cap3, kebab2);
        if (dashes.charAt(0) !== "-") {
          dashes = "-" + dashes;
        }
        value = "data" + dashes;
      }
    }
    Type = DefinedInfo2;
  }
  return new Type(property, value);
}
function kebab2($0) {
  return "-" + $0.toLowerCase();
}
function camelcase2($0) {
  return $0.charAt(1).toUpperCase();
}

// node_modules/property-information/index.js
var html4 = merge2([aria2, html3, xlink2, xmlns2, xml2], "html");
var svg4 = merge2([aria2, svg3, xlink2, xmlns2, xml2], "svg");

// node_modules/space-separated-tokens/index.js
function stringify4(values) {
  return values.join(" ").trim();
}

// node_modules/hast-util-to-jsx-runtime/lib/index.js
var import_style_to_js2 = __toESM(require_cjs6());
var pointStart2 = point3("start");
function point3(type) {
  return point5;
  function point5(node) {
    const point6 = node && node.position && node.position[type] || {};
    if (typeof point6.line === "number" && point6.line > 0 && typeof point6.column === "number" && point6.column > 0) {
      return {
        line: point6.line,
        column: point6.column,
        offset: typeof point6.offset === "number" && point6.offset > -1 ? point6.offset : void 0
      };
    }
  }
}

// node_modules/unist-util-stringify-position/lib/index.js
function stringifyPosition2(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position3(value.position);
  }
  if ("start" in value || "end" in value) {
    return position3(value);
  }
  if ("line" in value || "column" in value) {
    return point4(value);
  }
  return "";
}
function point4(point5) {
  return index2(point5 && point5.line) + ":" + index2(point5 && point5.column);
}
function position3(pos) {
  return point4(pos && pos.start) + "-" + point4(pos && pos.end);
}
function index2(value) {
  return value && typeof value === "number" ? value : 1;
}

// node_modules/vfile-message/lib/index.js
var VFileMessage2 = class extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(causeOrReason, optionsOrParentOrPlace, origin) {
    super();
    if (typeof optionsOrParentOrPlace === "string") {
      origin = optionsOrParentOrPlace;
      optionsOrParentOrPlace = void 0;
    }
    let reason = "";
    let options = {};
    let legacyCause = false;
    if (optionsOrParentOrPlace) {
      if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("type" in optionsOrParentOrPlace) {
        options = {
          ancestors: [optionsOrParentOrPlace],
          place: optionsOrParentOrPlace.position
        };
      } else {
        options = { ...optionsOrParentOrPlace };
      }
    }
    if (typeof causeOrReason === "string") {
      reason = causeOrReason;
    } else if (!options.cause && causeOrReason) {
      legacyCause = true;
      reason = causeOrReason.message;
      options.cause = causeOrReason;
    }
    if (!options.ruleId && !options.source && typeof origin === "string") {
      const index3 = origin.indexOf(":");
      if (index3 === -1) {
        options.ruleId = origin;
      } else {
        options.source = origin.slice(0, index3);
        options.ruleId = origin.slice(index3 + 1);
      }
    }
    if (!options.place && options.ancestors && options.ancestors) {
      const parent = options.ancestors[options.ancestors.length - 1];
      if (parent) {
        options.place = parent.position;
      }
    }
    const start2 = options.place && "start" in options.place ? options.place.start : options.place;
    this.ancestors = options.ancestors || void 0;
    this.cause = options.cause || void 0;
    this.column = start2 ? start2.column : void 0;
    this.fatal = void 0;
    this.file = "";
    this.message = reason;
    this.line = start2 ? start2.line : void 0;
    this.name = stringifyPosition2(options.place) || "1:1";
    this.place = options.place || void 0;
    this.reason = this.message;
    this.ruleId = options.ruleId || void 0;
    this.source = options.source || void 0;
    this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
    this.actual = void 0;
    this.expected = void 0;
    this.note = void 0;
    this.url = void 0;
  }
};
VFileMessage2.prototype.file = "";
VFileMessage2.prototype.name = "";
VFileMessage2.prototype.reason = "";
VFileMessage2.prototype.message = "";
VFileMessage2.prototype.stack = "";
VFileMessage2.prototype.column = void 0;
VFileMessage2.prototype.line = void 0;
VFileMessage2.prototype.ancestors = void 0;
VFileMessage2.prototype.cause = void 0;
VFileMessage2.prototype.fatal = void 0;
VFileMessage2.prototype.place = void 0;
VFileMessage2.prototype.ruleId = void 0;
VFileMessage2.prototype.source = void 0;

// node_modules/hast-util-to-jsx-runtime/lib/index.js
var own = {}.hasOwnProperty;
var emptyMap2 = /* @__PURE__ */ new Map();
var cap4 = /[A-Z]/g;
var tableElements2 = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]);
var tableCellElement2 = /* @__PURE__ */ new Set(["td", "th"]);
var docs2 = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function toJsxRuntime2(tree, options) {
  if (!options || options.Fragment === void 0) {
    throw new TypeError("Expected `Fragment` in options");
  }
  const filePath = options.filePath || void 0;
  let create3;
  if (options.development) {
    if (typeof options.jsxDEV !== "function") {
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    }
    create3 = developmentCreate2(filePath, options.jsxDEV);
  } else {
    if (typeof options.jsx !== "function") {
      throw new TypeError("Expected `jsx` in production options");
    }
    if (typeof options.jsxs !== "function") {
      throw new TypeError("Expected `jsxs` in production options");
    }
    create3 = productionCreate2(filePath, options.jsx, options.jsxs);
  }
  const state = {
    Fragment: options.Fragment,
    ancestors: [],
    components: options.components || {},
    create: create3,
    elementAttributeNameCase: options.elementAttributeNameCase || "react",
    evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
    filePath,
    ignoreInvalidStyle: options.ignoreInvalidStyle || false,
    passKeys: options.passKeys !== false,
    passNode: options.passNode || false,
    schema: options.space === "svg" ? svg4 : html4,
    stylePropertyNameCase: options.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: options.tableCellAlignToStyle !== false
  };
  const result = one2(state, tree, void 0);
  if (result && typeof result !== "string") {
    return result;
  }
  return state.create(
    tree,
    state.Fragment,
    { children: result || void 0 },
    void 0
  );
}
function one2(state, node, key) {
  if (node.type === "element") {
    return element2(state, node, key);
  }
  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    return mdxExpression2(state, node);
  }
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    return mdxJsxElement2(state, node, key);
  }
  if (node.type === "mdxjsEsm") {
    return mdxEsm2(state, node);
  }
  if (node.type === "root") {
    return root2(state, node, key);
  }
  if (node.type === "text") {
    return text2(state, node);
  }
}
function element2(state, node, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
    schema = svg4;
    state.schema = schema;
  }
  state.ancestors.push(node);
  const type = findComponentFromName2(state, node.tagName, false);
  const props = createElementProps2(state, node);
  let children = createChildren2(state, node);
  if (tableElements2.has(node.tagName)) {
    children = children.filter(function(child) {
      return typeof child === "string" ? !whitespace2(child) : true;
    });
  }
  addNode2(state, props, type, node);
  addChildren2(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node, type, props, key);
}
function mdxExpression2(state, node) {
  if (node.data && node.data.estree && state.evaluater) {
    const program = node.data.estree;
    const expression = program.body[0];
    ok2(expression.type === "ExpressionStatement");
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateExpression(expression.expression)
    );
  }
  crashEstree2(state, node.position);
}
function mdxEsm2(state, node) {
  if (node.data && node.data.estree && state.evaluater) {
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateProgram(node.data.estree)
    );
  }
  crashEstree2(state, node.position);
}
function mdxJsxElement2(state, node, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node.name === "svg" && parentSchema.space === "html") {
    schema = svg4;
    state.schema = schema;
  }
  state.ancestors.push(node);
  const type = node.name === null ? state.Fragment : findComponentFromName2(state, node.name, true);
  const props = createJsxElementProps2(state, node);
  const children = createChildren2(state, node);
  addNode2(state, props, type, node);
  addChildren2(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node, type, props, key);
}
function root2(state, node, key) {
  const props = {};
  addChildren2(props, createChildren2(state, node));
  return state.create(node, state.Fragment, props, key);
}
function text2(_2, node) {
  return node.value;
}
function addNode2(state, props, type, node) {
  if (typeof type !== "string" && type !== state.Fragment && state.passNode) {
    props.node = node;
  }
}
function addChildren2(props, children) {
  if (children.length > 0) {
    const value = children.length > 1 ? children : children[0];
    if (value) {
      props.children = value;
    }
  }
}
function productionCreate2(_2, jsx, jsxs) {
  return create3;
  function create3(_3, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const fn = isStaticChildren ? jsxs : jsx;
    return key ? fn(type, props, key) : fn(type, props);
  }
}
function developmentCreate2(filePath, jsxDEV) {
  return create3;
  function create3(node, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const point5 = pointStart2(node);
    return jsxDEV(
      type,
      props,
      key,
      isStaticChildren,
      {
        columnNumber: point5 ? point5.column - 1 : void 0,
        fileName: filePath,
        lineNumber: point5 ? point5.line : void 0
      },
      void 0
    );
  }
}
function createElementProps2(state, node) {
  const props = {};
  let alignValue;
  let prop;
  for (prop in node.properties) {
    if (prop !== "children" && own.call(node.properties, prop)) {
      const result = createProperty2(state, prop, node.properties[prop]);
      if (result) {
        const [key, value] = result;
        if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement2.has(node.tagName)) {
          alignValue = value;
        } else {
          props[key] = value;
        }
      }
    }
  }
  if (alignValue) {
    const style = (
      /** @type {Style} */
      props.style || (props.style = {})
    );
    style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
  }
  return props;
}
function createJsxElementProps2(state, node) {
  const props = {};
  for (const attribute of node.attributes) {
    if (attribute.type === "mdxJsxExpressionAttribute") {
      if (attribute.data && attribute.data.estree && state.evaluater) {
        const program = attribute.data.estree;
        const expression = program.body[0];
        ok2(expression.type === "ExpressionStatement");
        const objectExpression = expression.expression;
        ok2(objectExpression.type === "ObjectExpression");
        const property = objectExpression.properties[0];
        ok2(property.type === "SpreadElement");
        Object.assign(
          props,
          state.evaluater.evaluateExpression(property.argument)
        );
      } else {
        crashEstree2(state, node.position);
      }
    } else {
      const name3 = attribute.name;
      let value;
      if (attribute.value && typeof attribute.value === "object") {
        if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
          const program = attribute.value.data.estree;
          const expression = program.body[0];
          ok2(expression.type === "ExpressionStatement");
          value = state.evaluater.evaluateExpression(expression.expression);
        } else {
          crashEstree2(state, node.position);
        }
      } else {
        value = attribute.value === null ? true : attribute.value;
      }
      props[name3] = /** @type {Props[keyof Props]} */
      value;
    }
  }
  return props;
}
function createChildren2(state, node) {
  const children = [];
  let index3 = -1;
  const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap2;
  while (++index3 < node.children.length) {
    const child = node.children[index3];
    let key;
    if (state.passKeys) {
      const name3 = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
      if (name3) {
        const count = countsByName.get(name3) || 0;
        key = name3 + "-" + count;
        countsByName.set(name3, count + 1);
      }
    }
    const result = one2(state, child, key);
    if (result !== void 0) children.push(result);
  }
  return children;
}
function createProperty2(state, prop, value) {
  const info = find2(state.schema, prop);
  if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) {
    return;
  }
  if (Array.isArray(value)) {
    value = info.commaSeparated ? stringify3(value) : stringify4(value);
  }
  if (info.property === "style") {
    let styleObject = typeof value === "object" ? value : parseStyle2(state, String(value));
    if (state.stylePropertyNameCase === "css") {
      styleObject = transformStylesToCssCasing2(styleObject);
    }
    return ["style", styleObject];
  }
  return [
    state.elementAttributeNameCase === "react" && info.space ? hastToReact2[info.property] || info.property : info.attribute,
    value
  ];
}
function parseStyle2(state, value) {
  try {
    return (0, import_style_to_js2.default)(value, { reactCompat: true });
  } catch (error) {
    if (state.ignoreInvalidStyle) {
      return {};
    }
    const cause = (
      /** @type {Error} */
      error
    );
    const message = new VFileMessage2("Cannot parse `style` attribute", {
      ancestors: state.ancestors,
      cause,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    message.file = state.filePath || void 0;
    message.url = docs2 + "#cannot-parse-style-attribute";
    throw message;
  }
}
function findComponentFromName2(state, name3, allowExpression) {
  let result;
  if (!allowExpression) {
    result = { type: "Literal", value: name3 };
  } else if (name3.includes(".")) {
    const identifiers = name3.split(".");
    let index3 = -1;
    let node;
    while (++index3 < identifiers.length) {
      const prop = name2(identifiers[index3]) ? { type: "Identifier", name: identifiers[index3] } : { type: "Literal", value: identifiers[index3] };
      node = node ? {
        type: "MemberExpression",
        object: node,
        property: prop,
        computed: Boolean(index3 && prop.type === "Literal"),
        optional: false
      } : prop;
    }
    result = node;
  } else {
    result = name2(name3) && !/^[a-z]/.test(name3) ? { type: "Identifier", name: name3 } : { type: "Literal", value: name3 };
  }
  if (result.type === "Literal") {
    const name4 = (
      /** @type {string | number} */
      result.value
    );
    return own.call(state.components, name4) ? state.components[name4] : name4;
  }
  if (state.evaluater) {
    return state.evaluater.evaluateExpression(result);
  }
  crashEstree2(state);
}
function crashEstree2(state, place) {
  const message = new VFileMessage2(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: state.ancestors,
      place,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  message.file = state.filePath || void 0;
  message.url = docs2 + "#cannot-handle-mdx-estrees-without-createevaluater";
  throw message;
}
function transformStylesToCssCasing2(domCasing) {
  const cssCasing = {};
  let from;
  for (from in domCasing) {
    if (own.call(domCasing, from)) {
      cssCasing[transformStyleToCssCasing2(from)] = domCasing[from];
    }
  }
  return cssCasing;
}
function transformStyleToCssCasing2(from) {
  let to = from.replace(cap4, toDash2);
  if (to.slice(0, 3) === "ms-") to = "-" + to;
  return to;
}
function toDash2($0) {
  return "-" + $0.toLowerCase();
}
var l2;
function S2(n3) {
  return n3.children;
}
l2 = { __e: function(n3, l3, u5, t2) {
  for (var i2, r2, o2; l3 = l3.__; ) if ((i2 = l3.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n3)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n3, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l4) {
    n3 = l4;
  }
  throw n3;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f3 = 0;
function u4(e2, t2, n3, o2, i2, u5) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l3 = { type: e2, props: p2, key: n3, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i2, __self: u5 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l2.vnode && l2.vnode(l3), l3;
}

// ../_shared/noteMeta.ts
function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? void 0 : value;
  if (typeof value !== "string" && typeof value !== "number") return void 0;
  const d2 = new Date(value);
  return Number.isNaN(d2.getTime()) ? void 0 : d2;
}
function formatYmd(date) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}
function getNoteDates(file) {
  const created = file.dates?.created ?? file.dates?.published;
  const differs = (d2, ...others) => d2 && !others.some((o2) => o2 && formatYmd(o2) === formatYmd(d2)) ? d2 : void 0;
  const revised = differs(toDate(file.frontmatter?.posted), created);
  const updated = differs(file.dates?.modified, created, revised);
  return { created, revised, updated };
}
function getListDate(file) {
  const { created, revised } = getNoteDates(file);
  return revised ?? created;
}

// ../_shared/topics.ts
var TOPICS = [
  { key: "computer-science", label: "Computer Science" },
  { key: "data-engineering", label: "Data Engineering" },
  { key: "data-science", label: "Data Science" },
  { key: "gis", label: "GIS" },
  { key: "programming", label: "Programming" },
  { key: "finance-property", label: "Finance & Property" },
  { key: "tools", label: "Tools" }
];
var TOPIC_NAMES = Object.fromEntries(TOPICS.map((t2) => [t2.key, t2.label]));

// ../_shared/notes.ts
function isRealNote(slug) {
  if (!slug) return false;
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
function isListedNote(file) {
  return isRealNote(file.slug) && file.unlisted !== true && file.frontmatter?.unlisted !== true;
}
function titleCase(key) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function folderTitle(path2, overrides = {}) {
  const segment = path2.split("/").pop() ?? path2;
  return overrides[path2] ?? overrides[segment] ?? TOPIC_NAMES[segment] ?? titleCase(segment);
}
var plural = (n3, word) => `${n3} ${word}${n3 === 1 ? "" : "s"}`;
var byListDateDesc = (a2, b2) => (getListDate(b2)?.getTime() ?? 0) - (getListDate(a2)?.getTime() ?? 0);

// ../_shared/path.ts
function endsWith2(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix2(s2, suffix) {
  return endsWith2(s2, suffix) ? s2.slice(0, -suffix.length) : s2;
}
function stripSlashes2(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) s2 = s2.substring(1);
  if (!onlyStripPrefix && s2.endsWith("/")) s2 = s2.slice(0, -1);
  return s2;
}
function simplifySlug2(fp) {
  const res = stripSlashes2(trimSuffix2(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments2(...args) {
  if (args.length === 0) return "";
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes2(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) joined = "/" + joined;
  if (last?.endsWith("/")) joined = joined + "/";
  return joined;
}
function pathToRoot2(slug) {
  const rootPath = slug.split("/").filter((x3) => x3 !== "").slice(0, -1).map(() => "..").join("/");
  return rootPath.length === 0 ? "." : rootPath;
}
function resolveRelative2(current, target) {
  return joinSegments2(pathToRoot2(current), simplifySlug2(target));
}

// ../_shared/series.ts
function seriesOf(file) {
  const raw = file.frontmatter?.series;
  return raw == null ? "" : String(raw).trim();
}
function seriesIndexOf(file) {
  const raw = file.frontmatter?.series_index;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : void 0;
  if (typeof raw === "string" && raw.trim() !== "") {
    const index3 = Number(raw);
    return Number.isFinite(index3) ? index3 : void 0;
  }
  return void 0;
}
function episodeLabel(index3) {
  return index3 === 0 ? "\uC11C\uBB38" : `${index3}\uD3B8`;
}
function seriesLabel(file) {
  const index3 = seriesIndexOf(file);
  return seriesOf(file) && index3 !== void 0 ? episodeLabel(index3) : void 0;
}
function groupBySeries(sorted) {
  const groups = [];
  const bySeries = /* @__PURE__ */ new Map();
  for (const file of sorted) {
    const series = seriesOf(file);
    if (!series) {
      groups.push({ series: "", items: [file] });
      continue;
    }
    let group = bySeries.get(series);
    if (!group) {
      group = { series, items: [] };
      bySeries.set(series, group);
      groups.push(group);
    }
    group.items.push(file);
  }
  const rank = (f4) => seriesIndexOf(f4) ?? Number.POSITIVE_INFINITY;
  for (const group of bySeries.values()) {
    group.items.sort((a2, b2) => rank(a2) === rank(b2) ? 0 : rank(a2) < rank(b2) ? -1 : 1);
  }
  return groups;
}

// src/folderTree.ts
var folderPathOf = (node) => node.slug.replace(/\/?index$/, "");
function folderNote(node) {
  const data = node.data;
  return data && data.unlisted !== true && data.frontmatter?.unlisted !== true ? data : void 0;
}
function folderDisplayName(node, overrides) {
  const title = folderNote(node)?.frontmatter?.title;
  if (typeof title === "string" && title.trim() !== "" && title !== "index") return title;
  return folderTitle(folderPathOf(node), overrides);
}
function walkFolders(node, fn) {
  for (const child of node.children) {
    if (!child.isFolder) continue;
    fn(child);
    walkFolders(child, fn);
  }
}
function buildSection(node, overrides, collapse) {
  const notes = node.children.filter((c2) => !c2.isFolder && c2.data && isListedNote(c2.data)).map((c2) => c2.data);
  const children = node.children.filter((c2) => c2.isFolder).map((c2) => buildSection(c2, overrides, true)).filter((s2) => s2.count > 0 || s2.intro);
  let section = {
    path: folderPathOf(node),
    title: folderDisplayName(node, overrides),
    intro: folderNote(node),
    notes,
    children,
    count: notes.length + children.reduce((n3, c2) => n3 + c2.count, 0)
  };
  while (collapse && section.notes.length === 0 && !section.intro && section.children.length === 1) {
    const only = section.children[0];
    section = { ...only, title: `${section.title} / ${only.title}` };
  }
  return section;
}
function flattenSections(sections, prefix = "") {
  return sections.flatMap((s2) => {
    const title = prefix ? `${prefix} / ${s2.title}` : s2.title;
    return [{ ...s2, title }, ...flattenSections(s2.children, title)];
  });
}

// src/components/rows.tsx
var byListDate = (a2, b2) => byListDateDesc(a2, b2) || String(a2.frontmatter?.title ?? "").localeCompare(String(b2.frontmatter?.title ?? ""), "ko", { numeric: true });
var descOf = (page) => typeof page.description === "string" ? page.description.trim() : "";
function Ymd({ page, class: cls }) {
  const date = getListDate(page);
  return date ? /* @__PURE__ */ u4("time", { class: cls, dateTime: formatYmd(date), children: formatYmd(date) }) : /* @__PURE__ */ u4("span", { class: cls });
}
function PageRow({ page, ctx, track }) {
  const desc = descOf(page);
  return /* @__PURE__ */ u4("li", { children: /* @__PURE__ */ u4(
    "a",
    {
      class: track ? "fi-row is-track" : "fi-row",
      href: resolveRelative2(ctx.slug, page.slug),
      "data-no-popover": "true",
      children: [
        track ? /* @__PURE__ */ u4("span", { class: "fi-no", children: seriesLabel(page) }) : /* @__PURE__ */ u4(Ymd, { page, class: "fi-date" }),
        /* @__PURE__ */ u4("span", { class: "fi-title", children: page.frontmatter?.title }),
        track && /* @__PURE__ */ u4(Ymd, { page, class: "fi-date fi-end" }),
        desc && /* @__PURE__ */ u4("span", { class: "fi-desc", children: desc })
      ]
    }
  ) });
}

// src/components/styles/folderListing.scss
var folderListing_default = ".folder-index {\n  container-type: inline-size;\n}\n.folder-index .folder-meta {\n  margin: 1.5rem 0 0;\n  font-size: 0.85rem;\n  line-height: 1.5;\n  color: var(--gray);\n}\n.folder-index ul.fi-rows {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n.folder-index ul.fi-rows > li {\n  margin: 0;\n}\n.folder-index ul.fi-root {\n  margin-top: 1.75rem;\n  border-top: 1px solid var(--lightgray);\n}\n\n.folder-index .folder-section {\n  margin-top: 2.5rem;\n}\n\n.folder-index .folder-sub {\n  margin-top: 1.75rem;\n}\n\n.folder-index .fi-label {\n  display: flex;\n  align-items: baseline;\n  gap: 0.75rem;\n  padding-bottom: 10px;\n  border-bottom: 1px solid var(--lightgray);\n}\n.folder-index .fi-label h2,\n.folder-index .fi-label h3 {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-family: var(--headerFont);\n  font-weight: 700;\n  line-height: 1.3;\n  scroll-margin-top: 1.5rem;\n}\n.folder-index .fi-label h2 {\n  font-size: 1.15rem;\n  color: var(--secondary);\n}\n.folder-index .fi-label.is-sub {\n  gap: 0.6rem;\n  padding-bottom: 6px;\n}\n.folder-index .fi-label.is-sub h3 {\n  font-size: 0.95rem;\n  color: var(--darkgray);\n}\n.folder-index .fi-label.is-sub .fi-open {\n  font-size: 0.8rem;\n}\n\n.folder-index .fi-count {\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  line-height: 1.3;\n  font-variant-numeric: tabular-nums;\n  color: var(--gray);\n}\n\n.folder-index .fi-open,\n.folder-index .fi-acts a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 2.75rem;\n  font-family: var(--headerFont);\n  font-weight: 600;\n  color: var(--secondary);\n  text-decoration: none;\n  white-space: nowrap;\n}\n@media (hover: hover) and (pointer: fine) {\n  .folder-index .fi-open:hover,\n  .folder-index .fi-acts a:hover {\n    color: var(--secondary);\n    text-decoration: underline;\n    text-underline-offset: 3px;\n  }\n}\n.folder-index .fi-open:focus-visible,\n.folder-index .fi-acts a:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}\n\n.folder-index .fi-open {\n  margin: -0.75rem 0 -0.75rem auto;\n  font-size: 0.85rem;\n}\n\n.folder-index .fi-row {\n  display: grid;\n  grid-template-columns: 6.25rem minmax(0, 1fr);\n  column-gap: 14px;\n  align-items: baseline;\n  box-sizing: border-box;\n  min-height: 44px;\n  padding: 0.6rem 0.4rem;\n  border-bottom: 1px solid var(--lightgray);\n  font-weight: 400;\n  color: var(--darkgray);\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.folder-index .fi-row.is-track, .folder-index .fi-row.is-series {\n  grid-template-columns: 6.25rem minmax(0, 1fr) auto;\n}\n.folder-index .fi-row:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: -2px;\n}\n\n.folder-index li:nth-child(even) > .fi-row,\n.folder-index li:nth-child(even) > details > summary.fi-row {\n  background: rgba(var(--accent-rgb), 0.035);\n}\n\n@media (hover: hover) and (pointer: fine) {\n  .folder-index li > .fi-row:hover,\n  .folder-index li > details > summary.fi-row:hover {\n    background: rgba(var(--accent-rgb), 0.1);\n    color: var(--darkgray);\n  }\n  .folder-index li > .fi-row:hover .fi-title,\n  .folder-index li > details > summary.fi-row:hover .fi-title {\n    text-decoration: underline;\n    text-underline-offset: 3px;\n  }\n}\n.folder-index li > .fi-row:active,\n.folder-index li > details > summary.fi-row:active {\n  background: rgba(var(--accent-rgb), 0.1);\n}\n\n.folder-index .fi-date,\n.folder-index .fi-kind {\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  font-weight: 400;\n  line-height: 1.3;\n  font-variant-numeric: tabular-nums;\n  color: var(--gray);\n  white-space: nowrap;\n}\n\n.folder-index .fi-end {\n  justify-self: end;\n}\n\n.folder-index .fi-no {\n  font-family: var(--bodyFont);\n  font-size: 0.8rem;\n  font-weight: 600;\n  line-height: 1.3;\n  font-variant-numeric: tabular-nums;\n  color: var(--darkgray);\n  white-space: nowrap;\n}\n\n.folder-index .fi-title {\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 620;\n  line-height: 1.45;\n  color: var(--dark);\n  word-break: keep-all;\n}\n\n.folder-index .fi-desc {\n  grid-column: 2/-1;\n  margin-top: 0.15rem;\n  overflow: hidden;\n  font-size: 0.82rem;\n  line-height: 1.55;\n  color: var(--darkgray);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.folder-index .fi-row.is-intro .fi-kind {\n  font-family: var(--bodyFont);\n  font-weight: 600;\n}\n.folder-index .fi-row.is-intro .fi-title {\n  font-weight: 700;\n}\n\n.folder-index .fi-series-head {\n  display: grid;\n  grid-template-columns: 6.25rem minmax(0, 1fr) auto;\n  column-gap: 14px;\n  align-items: baseline;\n  padding: 0.9rem 0.4rem 0.55rem;\n  border-bottom: 1px solid var(--border-strong);\n}\n.folder-index .fi-series-head .fi-acts a {\n  margin-block: -0.9rem;\n}\n\n.folder-index .fi-series-name {\n  font-family: var(--headerFont);\n  font-size: 1.02rem;\n  font-weight: 700;\n  line-height: 1.4;\n  color: var(--dark);\n  word-break: keep-all;\n}\n\n.folder-index .fi-acts {\n  display: flex;\n  gap: 0 1rem;\n  margin: 0;\n  font-size: 0.85rem;\n}\n\n.folder-index summary.fi-row {\n  cursor: pointer;\n  list-style: none;\n}\n.folder-index summary.fi-row::-webkit-details-marker {\n  display: none;\n}\n.folder-index summary.fi-row .fi-title {\n  font-weight: 700;\n}\n\n.folder-index .fi-chev {\n  align-self: center;\n  width: 0.45rem;\n  height: 0.45rem;\n  margin-right: 0.3rem;\n  border-right: 2px solid var(--gray);\n  border-bottom: 2px solid var(--gray);\n  transform: rotate(-45deg);\n  transition: transform var(--dur-base) var(--ease);\n}\n\n.folder-index details[open] > summary .fi-chev {\n  transform: rotate(45deg);\n}\n\n.folder-index .fi-fold-body {\n  margin-left: 6.25rem;\n  border-left: 1px solid var(--lightgray);\n}\n.folder-index .fi-fold-body .fi-row.is-track {\n  grid-template-columns: 3rem minmax(0, 1fr) auto;\n}\n.folder-index .fi-fold-body .fi-acts {\n  padding: 0.55rem 0.4rem;\n  border-bottom: 1px solid var(--lightgray);\n}\n.folder-index .fi-fold-body .fi-acts a {\n  margin-block: -0.6rem;\n}\n\n@container (max-width: 600px) {\n  .folder-index .fi-open-word {\n    display: none;\n  }\n  .folder-index .fi-row {\n    grid-template-columns: minmax(0, 1fr);\n    row-gap: 2px;\n    padding: 0.7rem 0.25rem;\n  }\n  .folder-index .fi-row .fi-desc {\n    grid-column: 1;\n  }\n  .folder-index .fi-row.is-track {\n    grid-template-columns: 2.75rem minmax(0, 1fr);\n  }\n  .folder-index .fi-row.is-track .fi-end {\n    display: none;\n  }\n  .folder-index .fi-row.is-track .fi-desc {\n    grid-column: 2;\n  }\n  .folder-index .fi-row.is-series {\n    grid-template-columns: minmax(0, 1fr) auto;\n  }\n  .folder-index .fi-row.is-series .fi-kind {\n    grid-column: 1/-1;\n  }\n  .folder-index .fi-row.is-series .fi-chev {\n    grid-row: 2;\n    grid-column: 2;\n  }\n  .folder-index .fi-series-head {\n    grid-template-columns: minmax(0, 1fr);\n    row-gap: 2px;\n  }\n  .folder-index .fi-series-head .fi-acts {\n    margin-top: 0.35rem;\n  }\n  .folder-index .fi-series-head .fi-acts a {\n    margin-block: -0.4rem;\n  }\n  .folder-index .fi-fold-body {\n    margin-left: 0.75rem;\n  }\n  .folder-index .fi-fold-body .fi-row.is-track {\n    grid-template-columns: 2.75rem minmax(0, 1fr);\n  }\n}\n.folder-jump ul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin: 0.75rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n.folder-jump ul a {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  min-height: 2.25rem;\n  padding: 0 0.85rem;\n  border-radius: var(--radius-s);\n  background: rgba(var(--accent-rgb), 0.08);\n  font-family: var(--headerFont);\n  font-size: 0.9rem;\n  font-weight: 700;\n  color: var(--secondary);\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n@media (hover: hover) and (pointer: fine) {\n  .folder-jump ul a:hover {\n    background: rgba(var(--accent-rgb), 0.16);\n  }\n  .folder-jump ul a:hover .folder-jump-count {\n    color: var(--darkgray);\n  }\n}\n.folder-jump ul a:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}\n@media all and (max-width: 600px) {\n  .folder-jump ul a {\n    min-height: 2.75rem;\n  }\n}\n.folder-jump ul .folder-jump-count {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  color: var(--gray);\n}";

// src/components/FolderListing.tsx
var sectionId = (path2) => `folder-${path2.replace(/\//g, "-")}`;
function IntroRow({ page, ctx }) {
  const desc = descOf(page);
  return /* @__PURE__ */ u4("ul", { class: "fi-rows", children: /* @__PURE__ */ u4("li", { children: /* @__PURE__ */ u4("a", { class: "fi-row is-intro", href: resolveRelative2(ctx.slug, page.slug), "data-no-popover": "true", children: [
    /* @__PURE__ */ u4("span", { class: "fi-kind", children: "\uD3F4\uB354 \uC18C\uAC1C" }),
    /* @__PURE__ */ u4("span", { class: "fi-title", children: page.frontmatter?.title }),
    desc && /* @__PURE__ */ u4("span", { class: "fi-desc", children: desc })
  ] }) }) });
}
function SeriesActions({ group, ctx }) {
  const first = group.items[0];
  const roadmap = ctx.roadmaps.get(group.series);
  return /* @__PURE__ */ u4(S2, { children: [
    /* @__PURE__ */ u4("a", { href: resolveRelative2(ctx.slug, first.slug), "data-no-popover": "true", children: [
      seriesLabel(first) ?? "1\uD3B8",
      "\uBD80\uD130 \uC77D\uAE30 \u2192"
    ] }),
    roadmap && /* @__PURE__ */ u4("a", { href: `${resolveRelative2(ctx.slug, roadmap.slug)}#series-roadmap`, "data-no-popover": "true", children: "\uB85C\uB4DC\uB9F5" })
  ] });
}
function SeriesRows({ group, ctx }) {
  return /* @__PURE__ */ u4("ul", { class: "fi-rows", children: group.items.map((page) => /* @__PURE__ */ u4(PageRow, { page, ctx, track: true })) });
}
function SeriesRun(props) {
  const { group, ctx } = props;
  const kind = /* @__PURE__ */ u4("span", { class: "fi-kind", children: [
    "\uC2DC\uB9AC\uC988 \xB7 ",
    group.items.length,
    "\uD3B8"
  ] });
  const name3 = ctx.seriesTitles[group.series] ?? group.series;
  if (!props.folded) {
    return /* @__PURE__ */ u4("li", { class: "fi-series", children: [
      /* @__PURE__ */ u4("div", { class: "fi-series-head", children: [
        kind,
        /* @__PURE__ */ u4("span", { class: "fi-series-name", children: name3 }),
        /* @__PURE__ */ u4("span", { class: "fi-acts", children: /* @__PURE__ */ u4(SeriesActions, { group, ctx }) })
      ] }),
      /* @__PURE__ */ u4(SeriesRows, { group, ctx })
    ] });
  }
  return /* @__PURE__ */ u4("li", { children: /* @__PURE__ */ u4("details", { class: "fi-fold", children: [
    /* @__PURE__ */ u4("summary", { class: "fi-row is-series", children: [
      kind,
      /* @__PURE__ */ u4("span", { class: "fi-title", children: name3 }),
      /* @__PURE__ */ u4("span", { class: "fi-chev", "aria-hidden": "true" })
    ] }),
    /* @__PURE__ */ u4("div", { class: "fi-fold-body", children: [
      /* @__PURE__ */ u4(SeriesRows, { group, ctx }),
      /* @__PURE__ */ u4("p", { class: "fi-acts", children: /* @__PURE__ */ u4(SeriesActions, { group, ctx }) })
    ] })
  ] }) });
}
function NoteList({ notes, ctx, root: root3 }) {
  if (notes.length === 0) return null;
  const groups = groupBySeries([...notes].sort(byListDate));
  const folded = groups.some((g2) => !g2.series) && groups.some((g2) => g2.series);
  return /* @__PURE__ */ u4("ul", { class: root3 ? "fi-rows fi-root" : "fi-rows", children: groups.map(
    (group) => group.series ? /* @__PURE__ */ u4(SeriesRun, { group, ctx, folded }) : /* @__PURE__ */ u4(PageRow, { page: group.items[0], ctx })
  ) });
}
function SectionBody({ section, ctx }) {
  return /* @__PURE__ */ u4(S2, { children: [
    section.intro && /* @__PURE__ */ u4(IntroRow, { page: section.intro, ctx }),
    /* @__PURE__ */ u4(NoteList, { notes: section.notes, ctx })
  ] });
}
function SectionLabel({ section, slug, sub }) {
  const Heading = sub ? "h3" : "h2";
  return /* @__PURE__ */ u4("div", { class: sub ? "fi-label is-sub" : "fi-label", children: [
    /* @__PURE__ */ u4(Heading, { id: sectionId(section.path), children: section.title }),
    /* @__PURE__ */ u4("span", { class: "fi-count", children: section.count }),
    /* @__PURE__ */ u4(
      "a",
      {
        class: "fi-open",
        href: resolveRelative2(slug, `${section.path}/index`),
        "aria-label": `${section.title} \uD3F4\uB354 \uC5F4\uAE30`,
        "data-no-popover": "true",
        children: [
          !sub && /* @__PURE__ */ u4("span", { class: "fi-open-word", children: "\uD3F4\uB354\xA0" }),
          "\uC5F4\uAE30 \u2192"
        ]
      }
    )
  ] });
}
var FolderListing_default = (opts) => {
  const showFolderCount = opts?.showFolderCount ?? true;
  const folderTitles = opts?.folderTitles ?? {};
  const seriesTitles = opts?.seriesTitles ?? {};
  const FolderListing = (props) => {
    const { tree, fileData, allFiles } = props;
    const slug = fileData.slug;
    const folder = props.ctx?.trie?.findNode(slug?.split("/") ?? []);
    if (!slug || !folder) return null;
    const roadmaps = /* @__PURE__ */ new Map();
    for (const file of allFiles) {
      const series = file.seriesRoadmap;
      if (typeof series === "string" && !roadmaps.has(series)) roadmaps.set(series, file);
    }
    const ctx = { slug, seriesTitles, roadmaps };
    const root3 = buildSection(folder, folderTitles, false);
    const sections = root3.children;
    const ast = tree;
    const content = ast.children.length === 0 ? fileData.description : toJsxRuntime2(ast, { Fragment: S2, jsx: u4, jsxs: u4, elementAttributeNameCase: "html" });
    const classes = (fileData.frontmatter?.cssclasses ?? []).join(" ");
    return /* @__PURE__ */ u4("div", { class: "popover-hint", children: [
      /* @__PURE__ */ u4("article", { class: classes, children: /* @__PURE__ */ u4("div", { class: "markdown-preview-view markdown-rendered", children: content }) }),
      /* @__PURE__ */ u4("div", { class: "page-listing folder-index", children: [
        showFolderCount && /* @__PURE__ */ u4("p", { class: "folder-meta", children: [
          plural(root3.count, "note"),
          sections.length > 0 && ` \xB7 ${plural(sections.length, "section")}`
        ] }),
        sections.length > 1 && /* @__PURE__ */ u4("nav", { class: "folder-jump", "aria-label": "\uC139\uC158 \uBC14\uB85C\uAC00\uAE30", children: /* @__PURE__ */ u4("ul", { children: sections.map((s2) => /* @__PURE__ */ u4("li", { children: /* @__PURE__ */ u4("a", { href: `#${sectionId(s2.path)}`, "data-no-popover": "true", children: [
          s2.title,
          /* @__PURE__ */ u4("span", { class: "folder-jump-count", children: s2.count })
        ] }) })) }) }),
        /* @__PURE__ */ u4(NoteList, { notes: root3.notes, ctx, root: true }),
        sections.map((s2) => /* @__PURE__ */ u4("section", { class: "folder-section", "aria-labelledby": sectionId(s2.path), children: [
          /* @__PURE__ */ u4(SectionLabel, { section: s2, slug }),
          /* @__PURE__ */ u4(SectionBody, { section: s2, ctx }),
          flattenSections(s2.children).map((sub) => /* @__PURE__ */ u4("section", { class: "folder-sub", "aria-labelledby": sectionId(sub.path), children: [
            /* @__PURE__ */ u4(SectionLabel, { section: sub, slug, sub: true }),
            /* @__PURE__ */ u4(SectionBody, { section: sub, ctx })
          ] }))
        ] }))
      ] })
    ] });
  };
  FolderListing.css = folderListing_default;
  return FolderListing;
};

// src/pageType.ts
var FolderListingPage = (opts) => {
  const base = FolderPage(opts);
  const folderTitles = opts?.folderTitles ?? {};
  return {
    ...base,
    name: "FolderListingPage",
    // 표시명을 가상 페이지 제목(H1·<title>)과 공유 trie(breadcrumb가 읽는다)에 함께 심는다.
    generate(args) {
      const trie = args.ctx.trie;
      const names = /* @__PURE__ */ new Map();
      if (trie) {
        walkFolders(trie, (node) => {
          const name3 = folderDisplayName(node, folderTitles);
          names.set(folderPathOf(node), name3);
          node.displayName = name3;
        });
      }
      return (base.generate?.(args) ?? []).map((page) => {
        const name3 = names.get(page.slug.replace(/\/index$/, ""));
        return name3 ? { ...page, title: name3 } : page;
      });
    },
    body: () => FolderListing_default(opts)
  };
};

export { FolderListingPage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
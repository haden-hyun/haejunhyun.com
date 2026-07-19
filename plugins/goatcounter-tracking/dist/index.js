// node_modules/preact/dist/preact.mjs
var n;
var l;
var u;
var w = [];
function k(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2) ;
  return x(l2, e2, i2, r2, null);
}
function x(n2, t2, i2, r2, o2) {
  var e2 = { type: n2, props: t2, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u : o2, __i: -1, __u: 0 };
  return null != l.vnode && l.vnode(e2), e2;
}
n = w.slice, l = { __e: function(n2, l2, u2, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u = 0, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// src/index.ts
var defaultOptions = {
  site: "haejunhyun",
  scriptSrc: "//gc.zgo.at/count.js"
};
var GoatcounterTracking = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "GoatcounterTracking",
    // No-op: only `externalResources` is used, but Quartz's transformer-category
    // validation requires at least one of textTransform/markdownPlugins/htmlPlugins
    // to be present on the instance (see config-loader.ts's `validateCategory`).
    htmlPlugins() {
      return [];
    },
    externalResources() {
      return {
        additionalHead: [
          k("script", {
            "data-goatcounter": `https://${opts.site}.goatcounter.com/count`,
            async: true,
            src: opts.scriptSrc
          })
        ]
      };
    }
  };
};
var src_default = GoatcounterTracking;

export { src_default as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
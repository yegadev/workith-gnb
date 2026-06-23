// src/ApiAppsSource.ts
var DEFAULT_GNB_APPS_ENDPOINT = "https://api.workith.com/api/gnb/apps";
var ApiAppsSource = class {
  constructor(endpoint = DEFAULT_GNB_APPS_ENDPOINT, options = {}) {
    this.endpoint = endpoint;
    this.options = options;
  }
  async getApps() {
    const fetchImpl = this.options.fetch ?? globalThis.fetch;
    if (!fetchImpl) {
      throw new Error("fetch is required to load GNB apps");
    }
    const token = await this.options.getToken?.();
    const headers = {
      Accept: "application/json",
      ...token ? { Authorization: `Bearer ${token}` } : {}
    };
    const response = await fetchImpl(this.endpoint, { headers });
    if (!response.ok) {
      throw new Error(`gnb apps fetch failed: ${response.status}`);
    }
    return response.json();
  }
};

// src/apps.mock.json
var apps_mock_default = [
  {
    id: "groupware",
    name: "\uADF8\uB8F9\uC6E8\uC5B4",
    url: "https://admin.workith.com",
    icon: "groupware",
    order: 1
  },
  {
    id: "editor",
    name: "\uC5D0\uB514\uD130",
    url: "https://editor.workith.com",
    icon: "editor",
    order: 2
  },
  {
    id: "mail",
    name: "\uBA54\uC77C",
    url: "https://mail.workith.com",
    icon: "mail",
    order: 3
  },
  {
    id: "files",
    name: "\uD30C\uC77C",
    url: "https://files.workith.com",
    icon: "files",
    order: 4
  },
  {
    id: "yega-op",
    name: "\uC608\uAC00\uBE44\uC988 OP",
    url: "https://yega-op.workith.com",
    icon: "op",
    order: 5
  },
  {
    id: "withlog",
    name: "Withlog",
    url: "https://withlog.workith.com",
    icon: "withlog",
    order: 6
  }
];

// src/apps.ts
var StaticAppsSource = class {
  constructor(apps = apps_mock_default) {
    this.apps = apps;
  }
  getApps() {
    return Promise.resolve([...this.apps]);
  }
};
var FallbackAppsSource = class {
  constructor(primary, fallback) {
    this.primary = primary;
    this.fallback = fallback;
  }
  async getApps() {
    try {
      return await this.primary.getApps();
    } catch {
      return this.fallback.getApps();
    }
  }
};
var defaultAppsSource = new FallbackAppsSource(
  new ApiAppsSource(),
  new StaticAppsSource()
);

// src/GnbErrorBoundary.tsx
import { Component } from "react";
var GnbErrorBoundary = class extends Component {
  constructor() {
    super(...arguments);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
};

// src/SuperGnbRail.tsx
import { useEffect, useState } from "react";

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
import { forwardRef as forwardRef2, createElement as createElement3 } from "react";

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/Icon.mjs
import { forwardRef, createElement as createElement2 } from "react";

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/defaultAttributes.mjs
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/context.mjs
import { createContext, useContext, useMemo, createElement } from "react";
var LucideContext = createContext({});
var useLucideContext = () => useContext(LucideContext);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/Icon.mjs
var Icon = forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return createElement2(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement2(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var createLucideIcon = (iconName, iconNode) => {
  const Component2 = forwardRef2(
    ({ className, ...props }, ref) => createElement3(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component2.displayName = toPascalCase(iconName);
  return Component2;
};

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/calendar-clock.mjs
var __iconNode = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
];
var CalendarClock = createLucideIcon("calendar-clock", __iconNode);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/chart-column.mjs
var __iconNode2 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
var ChartColumn = createLucideIcon("chart-column", __iconNode2);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/file-text.mjs
var __iconNode3 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
var FileText = createLucideIcon("file-text", __iconNode3);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/folder.mjs
var __iconNode4 = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
var Folder = createLucideIcon("folder", __iconNode4);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/image.mjs
var __iconNode5 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
var Image = createLucideIcon("image", __iconNode5);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs
var __iconNode6 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
var LayoutGrid = createLucideIcon("layout-grid", __iconNode6);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/mail.mjs
var __iconNode7 = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
var Mail = createLucideIcon("mail", __iconNode7);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/settings.mjs
var __iconNode8 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode8);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/users.mjs
var __iconNode9 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
var Users = createLucideIcon("users", __iconNode9);

// node_modules/.pnpm/lucide-react@1.17.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/wallet.mjs
var __iconNode10 = [
  [
    "path",
    {
      d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      key: "18etb6"
    }
  ],
  ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]
];
var Wallet = createLucideIcon("wallet", __iconNode10);

// src/icons.ts
var ICON_MAP = {
  groupware: Settings,
  // 그룹웨어 공통 (설정/사용자/권한)
  editor: FileText,
  // CRDT 에디터
  mail: Mail,
  // 메일
  image: Image,
  // 이미지
  files: Folder,
  // 파일
  op: ChartColumn,
  // 예가비즈 OP (경영지표)
  withlog: CalendarClock,
  // Withlog (일정/기록)
  hr: Users,
  // (예정) HR
  payroll: Wallet
  // 급여
};
var DEFAULT_ICON = LayoutGrid;
function resolveIcon(key) {
  return ICON_MAP[key] ?? DEFAULT_ICON;
}

// src/AppIcon.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function AppIcon({ app, active, expanded }) {
  const Icon2 = resolveIcon(app.icon);
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: app.url,
      "aria-current": active ? "page" : void 0,
      onClick: (e) => {
        if (active) e.preventDefault();
      },
      className: `wgnb-group wgnb-relative wgnb-flex wgnb-items-center wgnb-gap-2.5 wgnb-rounded-[10px] wgnb-p-2 wgnb-text-slate-200 wgnb-no-underline wgnb-transition-colors hover:wgnb-bg-slate-700 ${active ? "wgnb-cursor-default wgnb-bg-slate-700 wgnb-text-white" : "wgnb-opacity-60 hover:wgnb-opacity-100"}`,
      children: [
        active && /* @__PURE__ */ jsx(
          "span",
          {
            "data-testid": "active-indicator",
            className: "wgnb-absolute -wgnb-left-2 wgnb-top-1.5 wgnb-bottom-1.5 wgnb-w-[3px] wgnb-rounded-r wgnb-bg-blue-400"
          }
        ),
        /* @__PURE__ */ jsx(Icon2, { className: "wgnb-h-5 wgnb-w-5 wgnb-shrink-0", "aria-hidden": "true" }),
        expanded ? (
          // 펼침: 아이콘 옆 텍스트 라벨
          /* @__PURE__ */ jsx("span", { className: "wgnb-whitespace-nowrap wgnb-text-[13px]", children: app.name })
        ) : (
          // 접힘: 호버 시에만 보이는 우측 툴팁
          /* @__PURE__ */ jsx(
            "span",
            {
              role: "tooltip",
              className: "wgnb-pointer-events-none wgnb-absolute wgnb-left-12 wgnb-top-1/2 wgnb-z-10 -wgnb-translate-y-1/2 wgnb-whitespace-nowrap wgnb-rounded-md wgnb-bg-slate-950 wgnb-px-2.5 wgnb-py-1 wgnb-text-xs wgnb-text-white wgnb-opacity-0 wgnb-shadow-lg wgnb-transition-opacity group-hover:wgnb-opacity-100",
              children: app.name
            }
          )
        )
      ]
    }
  );
}

// src/SuperGnbRail.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var STORAGE_KEY = "wgnb.expanded";
function readExpanded() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function SuperGnbRail({
  currentAppId,
  appsSource = defaultAppsSource
}) {
  const [apps, setApps] = useState([]);
  const [expanded, setExpanded] = useState(readExpanded);
  useEffect(() => {
    let cancelled = false;
    appsSource.getApps().then(
      (loaded) => {
        if (!cancelled) setApps([...loaded].sort((a, b) => a.order - b.order));
      },
      () => {
        if (!cancelled) {
          setApps([
            { id: currentAppId, name: currentAppId, url: "#", icon: currentAppId, order: 0 }
          ]);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [appsSource, currentAppId]);
  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
      }
      return next;
    });
  };
  return /* @__PURE__ */ jsxs2(
    "nav",
    {
      "aria-label": "Workith \uC571 \uC804\uD658",
      className: `wgnb-relative wgnb-z-10 wgnb-hidden wgnb-h-full wgnb-shrink-0 wgnb-flex-col wgnb-gap-1 wgnb-overflow-hidden wgnb-bg-slate-800 wgnb-px-2 wgnb-py-2.5 wgnb-transition-[width] wgnb-duration-200 wgnb-ease-out md:wgnb-flex ${expanded ? "wgnb-w-[200px]" : "wgnb-w-14"}`,
      children: [
        /* @__PURE__ */ jsxs2(
          "button",
          {
            type: "button",
            onClick: toggle,
            "aria-expanded": expanded,
            "aria-label": expanded ? "\uBA54\uB274 \uC811\uAE30" : "\uBA54\uB274 \uD3BC\uCE58\uAE30",
            className: "wgnb-mb-2.5 wgnb-flex wgnb-cursor-pointer wgnb-items-center wgnb-gap-2.5 wgnb-rounded-lg wgnb-border-0 wgnb-bg-transparent wgnb-p-1",
            children: [
              /* @__PURE__ */ jsx2("span", { className: "wgnb-flex wgnb-h-8 wgnb-w-8 wgnb-shrink-0 wgnb-items-center wgnb-justify-center wgnb-rounded-lg wgnb-bg-gradient-to-br wgnb-from-blue-500 wgnb-to-violet-500 wgnb-text-sm wgnb-font-extrabold wgnb-text-white", children: "W" }),
              expanded && /* @__PURE__ */ jsx2("span", { className: "wgnb-text-sm wgnb-font-bold wgnb-text-white", children: "Workith" })
            ]
          }
        ),
        apps.map((app) => /* @__PURE__ */ jsx2(AppIcon, { app, active: app.id === currentAppId, expanded }, app.id))
      ]
    }
  );
}

// src/GnbShell.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function GnbShell({ currentAppId, appsSource, children }) {
  return /* @__PURE__ */ jsxs3("div", { className: "wgnb-flex wgnb-h-screen wgnb-w-full", children: [
    /* @__PURE__ */ jsx3(GnbErrorBoundary, { children: /* @__PURE__ */ jsx3(SuperGnbRail, { currentAppId, appsSource }) }),
    /* @__PURE__ */ jsx3("div", { className: "wgnb-min-w-0 wgnb-flex-1 wgnb-overflow-auto", children })
  ] });
}
export {
  ApiAppsSource,
  DEFAULT_GNB_APPS_ENDPOINT,
  FallbackAppsSource,
  GnbShell,
  StaticAppsSource,
  SuperGnbRail,
  defaultAppsSource
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-react/dist/esm/defaultAttributes.mjs:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-react/dist/esm/context.mjs:
lucide-react/dist/esm/Icon.mjs:
lucide-react/dist/esm/createLucideIcon.mjs:
lucide-react/dist/esm/icons/calendar-clock.mjs:
lucide-react/dist/esm/icons/chart-column.mjs:
lucide-react/dist/esm/icons/file-text.mjs:
lucide-react/dist/esm/icons/folder.mjs:
lucide-react/dist/esm/icons/image.mjs:
lucide-react/dist/esm/icons/layout-grid.mjs:
lucide-react/dist/esm/icons/mail.mjs:
lucide-react/dist/esm/icons/settings.mjs:
lucide-react/dist/esm/icons/users.mjs:
lucide-react/dist/esm/icons/wallet.mjs:
lucide-react/dist/esm/lucide-react.mjs:
  (**
   * @license lucide-react v1.17.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=index.js.map
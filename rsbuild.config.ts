import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  html: {
    template: "./public/index.html",
  },
  source: {
    tsconfigPath: './jsconfig.json',
  },
  output: {
    polyfill: "usage",
    distPath: {
      root: "build",
    },
  },
});

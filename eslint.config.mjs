import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default defineConfig([globalIgnores(["projects/**/*"]), {
    files: ["**/*.ts"],

    extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        angular.configs.tsRecommended,
    ],

    processor: angular.processInlineTemplates,

    rules: {
        // v22 recommended flags components that explicitly use Default change detection
        "@angular-eslint/prefer-on-push-component-change-detection": "off",

        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "app",
            style: "camelCase",
        }],

        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "app",
            style: "kebab-case",
        }],
    },
}, {
    files: ["**/*.html"],
    extends: [angular.configs.templateRecommended],
    rules: {},
}]);
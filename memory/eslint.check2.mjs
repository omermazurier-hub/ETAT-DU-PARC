import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
export default [{files:["**/*.{js,jsx}"],plugins:{react,"react-hooks":hooks},languageOptions:{ecmaVersion:2022,sourceType:"module",parserOptions:{ecmaFeatures:{jsx:true}}},rules:{...hooks.configs.recommended.rules,"react/jsx-uses-vars":"error"}}];

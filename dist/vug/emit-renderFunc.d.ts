import { VugNode } from "./parsing";
export interface RenderFuncOpts {
    h?: "/*#__PURE__*/React.createElement" | "h" | string;
    className?: "className" | string;
    Fragment?: "React.Fragment" | "Vue.Fragment" | string;
}
export declare function renderAst(nodes: VugNode[], opts?: RenderFuncOpts): string;

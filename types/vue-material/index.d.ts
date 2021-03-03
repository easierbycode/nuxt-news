declare module 'vue-material' {
    import _Vue from "vue";
    
    export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;
    export type PluginObject<T> = (Vue: typeof _Vue, options?: T) => void;
    export function MdButton(Vue: typeof _Vue, options?: any): void
    export function MdContent(Vue: typeof _Vue, options?: any): void
    export function MdTabs(Vue: typeof _Vue, options?: any): void
    // export function install(Vue: typeof _Vue, options?: any): void
    export function install(PluginFunction: typeof _Vue, options?: any): typeof _Vue
}
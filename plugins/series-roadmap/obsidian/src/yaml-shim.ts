// 블로그 parse.ts는 js-yaml의 load를 쓴다. Obsidian은 parseYaml을 내장하므로 번들 시 이 shim으로 바꿔 끼운다.
import { parseYaml } from "obsidian"

export const load = (source: string): unknown => parseYaml(source)

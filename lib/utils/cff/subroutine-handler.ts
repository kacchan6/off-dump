/**
 * CFF サブルーチン処理クラス
 * サブルーチン呼び出しとスタック操作を処理する
 */

import { parseCharString } from '../../tables/common/cff';
import {
	SubrIndex
} from '../../types/common';
import { PathState } from './path';

/**
 * サブルーチン呼び出しを処理するクラス
 */
export class SubroutineHandler {
	/**
	 * サブルーチンのバイアス値を計算
	 * サブルーチンのインデックスは、実際のインデックス + バイアス値
	 * 
	 * @param count サブルーチンの数
	 * @returns バイアス値
	 */
	public static calculateBias(count: number): number {
		if (count < 1240) {
			return 107;
		} else if (count < 33900) {
			return 1131;
		} else {
			return 32768;
		}
	}

	/**
	 * ローカルサブルーチン呼び出しを処理する
	 * 
	 * @param interpreter CFFインタプリタのインスタンス
	 * @param state 現在のパス状態
	 * @param stack オペランドスタック
	 * @param localSubrs ローカルサブルーチン
	 * @param callStack 呼び出しスタック（再帰制御用）
	 * @returns 処理が成功したか
	 */
	public static handleCallSubr(
		interpreter: any, // 循環参照を避けるためにany型を使用
		state: PathState,
		stack: number[],
		localSubrs: SubrIndex,
		callStack: number[]
	): boolean {
		if (stack.length > 0) {
			// サブルーチンインデックスを取得し、バイアス値を加算
			const subrIndex = stack.pop()! + this.calculateBias(localSubrs.count);

			// 循環呼び出しチェック
			if (callStack.includes(subrIndex)) {
				console.warn(`循環サブルーチン呼び出しを検出: ${subrIndex}`);
				return false;
			}

			// サブルーチンの呼び出し深度制限
			if (callStack.length > 10) {
				console.warn('サブルーチン呼び出し深度が制限を超えました');
				return false;
			}

			if (subrIndex >= 0 && subrIndex < localSubrs.count) {
				const subrData = localSubrs.subrs[subrIndex];
				const subrProgram = parseCharString(subrData);

				// サブルーチンを実行（再帰呼び出し）
				const subrResult = interpreter.executeCharString(
					subrProgram,
					localSubrs,
					state.hasWidth ? state.width : undefined,
					[...callStack, subrIndex]
				);

				// サブルーチンの結果をマージ
				state.path.push(...subrResult.path);

				// 現在位置の更新
				if (subrResult.path.length > 0) {
					const lastCmd = subrResult.path[subrResult.path.length - 1];
					if (lastCmd.type !== 'Z') {
						state.x = lastCmd.x;
						state.y = lastCmd.y;
					}
				}

				// 幅の更新
				if (!state.hasWidth) {
					state.width = subrResult.advance;
					state.hasWidth = true;
				}

				return true;
			}
		}

		return false;
	}

	/**
	 * グローバルサブルーチン呼び出しを処理する
	 * 
	 * @param interpreter CFFインタプリタのインスタンス
	 * @param state 現在のパス状態
	 * @param stack オペランドスタック
	 * @param globalSubrs グローバルサブルーチン
	 * @param localSubrs ローカルサブルーチン
	 * @param callStack 呼び出しスタック（再帰制御用）
	 * @returns 処理が成功したか
	 */
	public static handleCallGSubr(
		interpreter: any, // 循環参照を避けるためにany型を使用
		state: PathState,
		stack: number[],
		globalSubrs: SubrIndex,
		localSubrs: SubrIndex,
		callStack: number[]
	): boolean {
		if (stack.length > 0) {
			// サブルーチンインデックスを取得し、バイアス値を加算
			const subrIndex = stack.pop()! + this.calculateBias(globalSubrs.count);

			// 循環呼び出しチェック
			if (callStack.includes(subrIndex)) {
				console.warn(`循環サブルーチン呼び出しを検出: ${subrIndex}`);
				return false;
			}

			// サブルーチンの呼び出し深度制限
			if (callStack.length > 10) {
				console.warn('サブルーチン呼び出し深度が制限を超えました');
				return false;
			}

			if (subrIndex >= 0 && subrIndex < globalSubrs.count) {
				const subrData = globalSubrs.subrs[subrIndex];
				const subrProgram = parseCharString(subrData);

				// サブルーチンを実行（再帰呼び出し）
				const subrResult = interpreter.executeCharString(
					subrProgram,
					localSubrs,
					state.hasWidth ? state.width : undefined,
					[...callStack, subrIndex]
				);

				// サブルーチンの結果をマージ
				state.path.push(...subrResult.path);

				// 現在位置の更新
				if (subrResult.path.length > 0) {
					const lastCmd = subrResult.path[subrResult.path.length - 1];
					if (lastCmd.type !== 'Z') {
						state.x = lastCmd.x;
						state.y = lastCmd.y;
					}
				}

				// 幅の更新
				if (!state.hasWidth) {
					state.width = subrResult.advance;
					state.hasWidth = true;
				}

				return true;
			}
		}

		return false;
	}
}

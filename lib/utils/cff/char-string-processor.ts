/**
 * CFF CharString 命令処理クラス
 * Type 2 CharStringの各演算子を処理する
 */

import { CharStringOperator } from '../../types/common';
import { PathState, GlyphPath } from './path';

/**
 * CharString命令を処理するクラス
 */
export class CharStringProcessor {
	/**
	 * HStem, VStem コマンドを処理
	 * ヒント情報を管理する
	 */
	public static handleStem(state: PathState, stack: number[], isHorizontal: boolean): void {
		// 幅の処理（最初のヒント演算子の前に幅が指定されることがある）
		if (!state.hasWidth && (stack.length % 2) !== 0) {
			state.width = state.nominalWidthX + stack.shift()!;
			state.hasWidth = true;
		}

		// ステムヒントのカウントを更新
		if (isHorizontal) {
			state.hStemCount += Math.floor(stack.length / 2);
		} else {
			state.vStemCount += Math.floor(stack.length / 2);
		}

		// ヒント情報はパスに影響しないのでスタックをクリア
		stack.length = 0;
	}

	/**
	 * 移動コマンド (RMOVETO, HMOVETO, VMOVETO) を処理
	 */
	public static handleMove(state: PathState, stack: number[], op: CharStringOperator): void {
		// 幅の処理
		let minArgs = 1;
		if (op === CharStringOperator.RMOVETO) minArgs = 2;

		if (!state.hasWidth && stack.length > minArgs) {
			state.width = state.nominalWidthX + stack.shift()!;
			state.hasWidth = true;
		}

		switch (op) {
			case CharStringOperator.RMOVETO:
				if (stack.length >= 2) {
					const dy = stack.pop()!;
					const dx = stack.pop()!;
					state.moveTo(dx, dy);
				}
				break;

			case CharStringOperator.HMOVETO:
				if (stack.length >= 1) {
					const dx = stack.pop()!;
					state.moveTo(dx, 0);
				}
				break;

			case CharStringOperator.VMOVETO:
				if (stack.length >= 1) {
					const dy = stack.pop()!;
					state.moveTo(0, dy);
				}
				break;
		}

		stack.length = 0;
	}

	/**
	 * 直線コマンド (RLINETO, HLINETO, VLINETO) を処理
	 */
	public static handleLine(state: PathState, stack: number[], op: CharStringOperator): void {
		switch (op) {
			case CharStringOperator.RLINETO:
				while (stack.length >= 2) {
					const dy = stack.pop()!;
					const dx = stack.pop()!;
					state.lineTo(dx, dy);
				}
				break;

			case CharStringOperator.HLINETO:
				let isHorizontal = true;
				while (stack.length > 0) {
					const d = stack.pop()!;

					if (isHorizontal) {
						state.lineTo(d, 0);
					} else {
						state.lineTo(0, d);
					}

					isHorizontal = !isHorizontal;
				}
				break;

			case CharStringOperator.VLINETO:
				let isVertical = true;
				while (stack.length > 0) {
					const d = stack.pop()!;

					if (isVertical) {
						state.lineTo(0, d);
					} else {
						state.lineTo(d, 0);
					}

					isVertical = !isVertical;
				}
				break;
		}

		stack.length = 0;
	}

	/**
	 * 標準的なベジェ曲線コマンド (RRCURVETO) を処理
	 */
	public static handleCurve(state: PathState, stack: number[]): void {
		while (stack.length >= 6) {
			const dy3 = stack.pop()!;
			const dx3 = stack.pop()!;
			const dy2 = stack.pop()!;
			const dx2 = stack.pop()!;
			const dy1 = stack.pop()!;
			const dx1 = stack.pop()!;

			state.curveTo(dx1, dy1, dx2, dy2, dx3, dy3);
		}

		stack.length = 0;
	}

	/**
	 * 水平ベジェ曲線コマンド (HHCURVETO) を処理
	 */
	public static handleHHCurve(state: PathState, stack: number[]): void {
		let dy1 = 0;
		if (stack.length % 2 !== 0) {
			dy1 = stack.shift()!;
		}

		while (stack.length >= 4) {
			const dx1 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx3 = stack.shift()!;

			state.curveTo(dx1, dy1, dx2, dy2, dx3, 0);

			// 2回目以降の曲線では dy1 = 0
			dy1 = 0;
		}

		stack.length = 0;
	}

	/**
	 * 垂直ベジェ曲線コマンド (VVCURVETO) を処理
	 */
	public static handleVVCurve(state: PathState, stack: number[]): void {
		let dx1 = 0;
		if (stack.length % 2 !== 0) {
			dx1 = stack.shift()!;
		}

		while (stack.length >= 4) {
			const dy1 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dy3 = stack.shift()!;

			state.curveTo(dx1, dy1, dx2, dy2, 0, dy3);

			// 2回目以降の曲線では dx1 = 0
			dx1 = 0;
		}

		stack.length = 0;
	}

	/**
	 * 水平→垂直ベジェ曲線コマンド (HVCURVETO) を処理
	 */
	public static handleHVCurve(state: PathState, stack: number[]): void {
		let isHorFirst = true;

		while (stack.length >= 4) {
			if (isHorFirst) {
				// 水平開始曲線
				const dx1 = stack.shift()!;
				const dx2 = stack.shift()!;
				const dy2 = stack.shift()!;
				const dy3 = stack.shift()!;

				// 最後の曲線で、余分なパラメータがある場合
				let dx3 = 0;
				if (stack.length === 1) {
					dx3 = stack.shift()!;
				}

				state.curveTo(dx1, 0, dx2, dy2, dx3, dy3);
			} else {
				// 垂直開始曲線
				const dy1 = stack.shift()!;
				const dx2 = stack.shift()!;
				const dy2 = stack.shift()!;
				const dx3 = stack.shift()!;

				// 最後の曲線で、余分なパラメータがある場合
				let dy3 = 0;
				if (stack.length === 1) {
					dy3 = stack.shift()!;
				}

				state.curveTo(0, dy1, dx2, dy2, dx3, dy3);
			}

			isHorFirst = !isHorFirst;
		}

		stack.length = 0;
	}

	/**
	 * 垂直→水平ベジェ曲線コマンド (VHCURVETO) を処理
	 */
	public static handleVHCurve(state: PathState, stack: number[]): void {
		let isVerFirst = true;

		while (stack.length >= 4) {
			if (isVerFirst) {
				// 垂直開始曲線
				const dy1 = stack.shift()!;
				const dx2 = stack.shift()!;
				const dy2 = stack.shift()!;
				const dx3 = stack.shift()!;

				// 最後の曲線で、余分なパラメータがある場合
				let dy3 = 0;
				if (stack.length === 1) {
					dy3 = stack.shift()!;
				}

				state.curveTo(0, dy1, dx2, dy2, dx3, dy3);
			} else {
				// 水平開始曲線
				const dx1 = stack.shift()!;
				const dx2 = stack.shift()!;
				const dy2 = stack.shift()!;
				const dy3 = stack.shift()!;

				// 最後の曲線で、余分なパラメータがある場合
				let dx3 = 0;
				if (stack.length === 1) {
					dx3 = stack.shift()!;
				}

				state.curveTo(dx1, 0, dx2, dy2, dx3, dy3);
			}

			isVerFirst = !isVerFirst;
		}

		stack.length = 0;
	}

	/**
	 * 曲線+直線コマンド (RCURVELINE) を処理
	 */
	public static handleCurveLine(state: PathState, stack: number[]): void {
		// 最後の2つのスタック要素は直線のためのもの
		while (stack.length > 2) {
			const dy1 = stack.shift()!;
			const dx1 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy3 = stack.shift()!;
			const dx3 = stack.shift()!;

			state.curveTo(dx1, dy1, dx2, dy2, dx3, dy3);
		}

		// 最後の2つのスタック要素で直線を描画
		if (stack.length === 2) {
			const dy = stack.pop()!;
			const dx = stack.pop()!;
			state.lineTo(dx, dy);
		}

		stack.length = 0;
	}

	/**
	 * 直線+曲線コマンド (RLINECURVE) を処理
	 */
	public static handleLineCurve(state: PathState, stack: number[]): void {
		// 最後の6つのスタック要素は曲線のためのもの
		while (stack.length > 6) {
			const dy = stack.shift()!;
			const dx = stack.shift()!;
			state.lineTo(dx, dy);
		}

		// 最後の6つのスタック要素で曲線を描画
		if (stack.length === 6) {
			const dy1 = stack.shift()!;
			const dx1 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy3 = stack.shift()!;
			const dx3 = stack.shift()!;

			state.curveTo(dx1, dy1, dx2, dy2, dx3, dy3);
		}

		stack.length = 0;
	}

	/**
	 * HFLEXコマンドを処理
	 */
	public static handleHFLEX(state: PathState, stack: number[]): void {
		if (stack.length >= 7) {
			const dx1 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx3 = stack.shift()!;
			const dx4 = stack.shift()!;
			const dx5 = stack.shift()!;
			const dx6 = stack.shift()!;

			// 最初の曲線
			state.curveTo(dx1, 0, dx2, dy2, dx3, 0);

			// 2つ目の曲線
			state.curveTo(dx4, 0, dx5, -dy2, dx6, 0);
		}

		stack.length = 0;
	}

	/**
	 * FLEXコマンドを処理
	 */
	public static handleFLEX(state: PathState, stack: number[]): void {
		if (stack.length >= 13) {
			const dx1 = stack.shift()!;
			const dy1 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx3 = stack.shift()!;
			const dy3 = stack.shift()!;
			const dx4 = stack.shift()!;
			const dy4 = stack.shift()!;
			const dx5 = stack.shift()!;
			const dy5 = stack.shift()!;
			const dx6 = stack.shift()!;
			const dy6 = stack.shift()!;
			// const fd = stack.shift()!; // flex depth

			// 最初の曲線
			state.curveTo(dx1, dy1, dx2, dy2, dx3, dy3);

			// 2つ目の曲線
			state.curveTo(dx4, dy4, dx5, dy5, dx6, dy6);
		}

		stack.length = 0;
	}

	/**
	 * HFLEX1コマンドを処理
	 */
	public static handleHFLEX1(state: PathState, stack: number[]): void {
		if (stack.length >= 9) {
			const dx1 = stack.shift()!;
			const dy1 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx3 = stack.shift()!;
			const dx4 = stack.shift()!;
			const dx5 = stack.shift()!;
			const dy5 = stack.shift()!;
			const dx6 = stack.shift()!;

			// 最初の曲線
			state.curveTo(dx1, dy1, dx2, dy2, dx3, 0);

			// 2つ目の曲線
			state.curveTo(dx4, 0, dx5, dy5, dx6, -dy1 - dy2 - dy5);
		}

		stack.length = 0;
	}

	/**
	 * FLEX1コマンドを処理
	 */
	public static handleFLEX1(state: PathState, stack: number[]): void {
		if (stack.length >= 11) {
			const dx1 = stack.shift()!;
			const dy1 = stack.shift()!;
			const dx2 = stack.shift()!;
			const dy2 = stack.shift()!;
			const dx3 = stack.shift()!;
			const dy3 = stack.shift()!;
			const dx4 = stack.shift()!;
			const dy4 = stack.shift()!;
			const dx5 = stack.shift()!;
			const dy5 = stack.shift()!;
			const d6 = stack.shift()!;

			// 最初の曲線
			state.curveTo(dx1, dy1, dx2, dy2, dx3, dy3);

			// 2つ目の曲線
			const dx = Math.abs(dx1 + dx2 + dx3 + dx4 + dx5);
			const dy = Math.abs(dy1 + dy2 + dy3 + dy4 + dy5);

			let dx6, dy6;
			if (dx > dy) {
				dx6 = d6;
				dy6 = -dy1 - dy2 - dy3 - dy4 - dy5;
			} else {
				dx6 = -dx1 - dx2 - dx3 - dx4 - dx5;
				dy6 = d6;
			}

			state.curveTo(dx4, dy4, dx5, dy5, dx6, dy6);
		}

		stack.length = 0;
	}

	/**
	 * ENDCHARコマンドを処理
	 */
	public static handleEndChar(state: PathState, stack: number[]): GlyphPath {
		// 幅の処理（もし指定されていれば）
		if (!state.hasWidth && stack.length > 0) {
			state.width = state.nominalWidthX + stack[0];
		}

		// パスを閉じる
		if (state.path.length > 0) {
			state.closePath();
		}

		return state.getResult();
	}
}

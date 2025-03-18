/**
 * CFF/CFF2 インタプリタの型定義
 */

// SVG風のパスコマンド
export type PathCommand =
	| { type: 'M', x: number, y: number } // MoveTo
	| { type: 'L', x: number, y: number } // LineTo
	| { type: 'C', x1: number, y1: number, x2: number, y2: number, x: number, y: number } // CurveTo
	| { type: 'Z' }; // ClosePath

// SVG風のパスデータ（1グリフ分）
export interface GlyphPath {
	path: PathCommand[];
	advance: number; // グリフの送り幅
}

/**
 * 現在のパス状態を保持するクラス
 * CharString実行中の座標や状態を管理する
 */
export class PathState {
	// 現在位置
	public x: number = 0;
	public y: number = 0;

	// グリフの送り幅
	public width: number = 0;
	public hasWidth: boolean = false;

	// パスコマンドの集合
	public path: PathCommand[] = [];

	// ステムヒントのカウント
	public hStemCount: number = 0;
	public vStemCount: number = 0;

	// 幅の初期値設定
	constructor(
		public defaultWidthX: number = 0,
		public nominalWidthX: number = 0,
		initialWidth?: number
	) {
		this.width = defaultWidthX;
		if (initialWidth !== undefined) {
			this.width = initialWidth;
			this.hasWidth = true;
		}
	}

	/**
	 * 移動コマンドを追加
	 */
	public moveTo(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
		this.path.push({ type: 'M', x: this.x, y: this.y });
	}

	/**
	 * 直線コマンドを追加
	 */
	public lineTo(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
		this.path.push({ type: 'L', x: this.x, y: this.y });
	}

	/**
	 * ベジェ曲線コマンドを追加
	 */
	public curveTo(
		dx1: number, dy1: number,
		dx2: number, dy2: number,
		dx3: number, dy3: number
	): void {
		const x1 = this.x + dx1;
		const y1 = this.y + dy1;
		const x2 = x1 + dx2;
		const y2 = y1 + dy2;

		this.x = x2 + dx3;
		this.y = y2 + dy3;

		this.path.push({
			type: 'C',
			x1, y1,
			x2, y2,
			x: this.x, y: this.y
		});
	}

	/**
	 * パスを閉じる
	 */
	public closePath(): void {
		this.path.push({ type: 'Z' });
	}

	/**
	 * スタックから幅を処理する
	 */
	public handleWidth(stack: number[]): boolean {
		if (!this.hasWidth && stack.length > 0) {
			this.width = this.nominalWidthX + stack[0];
			this.hasWidth = true;
			stack.shift();
			return true;
		}
		return false;
	}

	/**
	 * 現在のパス状態から結果を取得
	 */
	public getResult(): GlyphPath {
		return {
			path: this.path,
			advance: this.width
		};
	}
}

/**
 * SVGパスデータ文字列に変換するユーティリティ関数
 * 
 * @param path SVG風のパスコマンド配列
 * @returns SVGパス文字列 (d属性の値)
 */
export function pathToSVGString(path: PathCommand[]): string {
	return path.map(cmd => {
		switch (cmd.type) {
			case 'M':
				return `M${cmd.x},${cmd.y}`;
			case 'L':
				return `L${cmd.x},${cmd.y}`;
			case 'C':
				return `C${cmd.x1},${cmd.y1} ${cmd.x2},${cmd.y2} ${cmd.x},${cmd.y}`;
			case 'Z':
				return 'Z';
			default:
				return '';
		}
	}).join(' ');
}

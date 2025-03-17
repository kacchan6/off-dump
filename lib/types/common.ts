/**
 * OpenType共通テーブル型定義
 * GSUB/GPOSテーブルなどで共通して使用される型
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/chapter2
 */

/**
 * スクリプトテーブル
 */
export interface ScriptTable {
	/**
	 * スクリプトタグ (例: 'latn', 'arab')
	 */
	scriptTag: string;

	/**
	 * デフォルト言語システム
	 */
	defaultLangSys?: LangSysTable;

	/**
	 * 言語システムレコード
	 */
	langSysRecords: LangSysRecord[];
}

/**
 * 言語システムレコード
 */
export interface LangSysRecord {
	/**
	 * 言語タグ (例: 'ENG ', 'JPN ')
	 */
	langSysTag: string;

	/**
	 * 言語システムテーブル
	 */
	langSys: LangSysTable;
}

/**
 * 言語システムテーブル
 */
export interface LangSysTable {
	/**
	 * ルックアップ順序 (予約済み、0)
	 */
	lookupOrder: number;

	/**
	 * 必須機能インデックス (0xFFFF=なし)
	 */
	requiredFeatureIndex: number;

	/**
	 * 機能インデックスの数
	 */
	featureIndexCount: number;

	/**
	 * 機能インデックス配列
	 */
	featureIndices: number[];
}

/**
 * 機能テーブル
 */
export interface FeatureTable {
	/**
	 * 機能タグ (例: 'kern', 'liga')
	 */
	featureTag: string;

	/**
	 * 代替機能へのオフセット (0=なし)
	 */
	featureParamsOffset: number;

	/**
	 * ルックアップインデックスの数
	 */
	lookupIndexCount: number;

	/**
	 * ルックアップインデックス配列
	 */
	lookupListIndices: number[];

	/**
	 * 機能パラメータ (存在する場合)
	 */
	featureParams?: any;  // 必要に応じて型を定義
}

/**
 * ルックアップテーブル
 */
export interface LookupTable {
	/**
	 * ルックアップタイプ
	 * 値の範囲はテーブルによって異なる (GSUB vs GPOS)
	 */
	lookupType: number;

	/**
	 * ルックアップフラグ
	 */
	lookupFlag: number;

	/**
	 * サブテーブルの数
	 */
	subTableCount: number;

	/**
	 * マークフィルタリングセット (ルックアップフラグの8ビット目がセットされていれば設定)
	 */
	markFilteringSet?: number;
}

/**
 * ルックアップフラグのビット定義
 */
export const enum LookupFlag {
	RIGHT_TO_LEFT = 0x0001,               // 右から左へのテキスト処理
	IGNORE_BASE_GLYPHS = 0x0002,          // ベースグリフを無視
	IGNORE_LIGATURES = 0x0004,            // 合字を無視
	IGNORE_MARKS = 0x0008,                // マークを無視
	USE_MARK_FILTERING_SET = 0x0010,      // マークフィルタリングセットを使用
	MARK_ATTACHMENT_TYPE_MASK = 0xFF00    // マーク接続タイプ (上位8ビット)
}

/**
 * カバレッジテーブル
 */
export interface CoverageTable {
	/**
	 * カバレッジフォーマット
	 */
	coverageFormat: number;

	/**
	 * グリフインデックス配列 (フォーマット1)
	 */
	glyphs?: number[];

	/**
	 * 範囲レコード配列 (フォーマット2)
	 */
	rangeRecords?: RangeRecord[];
}

/**
 * 範囲レコード
 */
export interface RangeRecord {
	/**
	 * 開始グリフID
	 */
	startGlyphID: number;

	/**
	 * 終了グリフID
	 */
	endGlyphID: number;

	/**
	 * 開始カバレッジインデックス
	 */
	startCoverageIndex: number;
}

/**
 * クラス定義テーブル
 */
export interface ClassDefTable {
	/**
	 * クラス定義フォーマット
	 */
	classFormat: number;

	/**
	 * 開始グリフID (フォーマット1)
	 */
	startGlyphID?: number;

	/**
	 * グリフの数 (フォーマット1)
	 */
	glyphCount?: number;

	/**
	 * クラス値配列 (フォーマット1)
	 */
	classValueArray?: number[];

	/**
	 * クラス範囲レコード配列 (フォーマット2)
	 */
	classRangeRecords?: ClassRangeRecord[];
}

/**
 * クラス範囲レコード
 */
export interface ClassRangeRecord {
	/**
	 * 開始グリフID
	 */
	startGlyphID: number;

	/**
	 * 終了グリフID
	 */
	endGlyphID: number;

	/**
	 * クラス値
	 */
	class: number;
}

/**
 * 装置テーブル - 特定のポイントサイズでの調整値
 */
export interface DeviceTable {
	/**
	 * 開始ポイントサイズ
	 */
	startSize: number;

	/**
	 * 終了ポイントサイズ
	 */
	endSize: number;

	/**
	 * フォーマット
	 */
	deltaFormat: number;

	/**
	 * デルタ値配列
	 */
	deltaValues: number[];
}

/**
 * ローカル可変フォントテーブル - 可変フォントのバリエーション
 */
export interface VariationIndexTable {
	/**
	 * 外部デルタセットへのオフセット
	 */
	deltaSetOuterOffset: number;

	/**
	 * 内部デルタセットへのオフセット
	 */
	deltaSetInnerOffset: number;

	/**
	 * デルタフォーマット
	 */
	deltaFormat: number;
}

/**
 * OpenTypeフォントの主要タグ定義
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/ttoreg
 */

/**
 * スクリプトタグ（Script Tags）
 * 文字体系を識別するための4バイトのタグ
 */
export const enum OpenTypeScriptTag {
	ADLM = 'adlm', // アドラム文字
	ARAB = 'arab', // アラビア文字
	ARMN = 'armn', // アルメニア文字
	AVST = 'avst', // アヴェスター文字
	BALI = 'bali', // バリ文字
	BAMU = 'bamu', // バムン文字
	BENG = 'beng', // ベンガル文字
	BOPO = 'bopo', // 注音字母
	BRAH = 'brah', // ブラーフミー文字
	BUGI = 'bugi', // ブギス文字
	BUHD = 'buhd', // ブヒッド文字
	BYZM = 'byzm', // ビザンチン音楽記号
	CANS = 'cans', // 統合カナダ先住民音節文字
	CARI = 'cari', // カリア文字
	CHER = 'cher', // チェロキー文字
	COPT = 'copt', // コプト文字
	CPRT = 'cprt', // キプロス文字
	CYRL = 'cyrl', // キリル文字
	DEVA = 'deva', // デーヴァナーガリー文字
	DSRT = 'dsrt', // デザレット文字
	DUPL = 'dupl', // デュプロワイエ速記
	EGYP = 'egyp', // エジプト聖刻文字
	ELBA = 'elba', // エルバサン文字
	ETHI = 'ethi', // エチオピア文字
	GEOR = 'geor', // グルジア文字
	GLAG = 'glag', // グラゴル文字
	GOTH = 'goth', // ゴート文字
	GREK = 'grek', // ギリシャ文字
	GUJR = 'gujr', // グジャラート文字
	GURU = 'guru', // グルムキー文字
	HANG = 'hang', // ハングル
	HANI = 'hani', // 漢字
	HANO = 'hano', // ハヌノオ文字
	HEBR = 'hebr', // ヘブライ文字
	HLUW = 'hluw', // アナトリア象形文字
	HMNG = 'hmng', // パハウ・フモン文字
	HUNG = 'hung', // 古ハンガリー文字
	ITAL = 'ital', // 古イタリア文字
	JAVA = 'java', // ジャワ文字
	JPAN = 'jpan', // 日本語
	KALI = 'kali', // カヤー文字
	KANA = 'kana', // カタカナ
	KHAR = 'khar', // カローシュティー文字
	KHMR = 'khmr', // クメール文字
	KHOJ = 'khoj', // コージキー文字
	KNDA = 'knda', // カンナダ文字
	KTHI = 'kthi', // カイティー文字
	LANA = 'lana', // ラーンナー文字
	LAO = 'lao ', // ラオス文字
	LATN = 'latn', // ラテン文字
	LEPC = 'lepc', // レプチャ文字
	LIMB = 'limb', // リンブ文字
	LINA = 'lina', // 線文字A
	LINB = 'linb', // 線文字B
	LISU = 'lisu', // リス文字
	LYCI = 'lyci', // リキア文字
	LYDI = 'lydi', // リディア文字
	MAHJ = 'mahj', // マハジャニ文字
	MAKA = 'maka', // マカッサル文字
	MAND = 'mand', // マンダ文字
	MANI = 'mani', // マニ文字
	MARC = 'marc', // マルチェン文字
	MAYA = 'maya', // マヤ象形文字
	MEDF = 'medf', // メデファイドリン文字
	MEND = 'mend', // メンデ文字
	MERC = 'merc', // メロエ文字（草書体）
	MERO = 'mero', // メロエ文字
	MLYM = 'mlym', // マラヤーラム文字
	MODI = 'modi', // モーディー文字
	MONG = 'mong', // モンゴル文字
	MROO = 'mroo', // ムロ文字
	MTEI = 'mtei', // メイテイ・マイエク文字
	MULT = 'mult', // ムルターニー文字
	MYMR = 'mymr', // ミャンマー文字
	NARB = 'narb', // 古北アラビア文字
	NBAT = 'nbat', // ナバテア文字
	NEWA = 'newa', // ネワール文字
	NKOO = 'nko ', // ンコ文字
	NSHU = 'nshu', // 女書
	OGAM = 'ogam', // オガム文字
	OLCK = 'olck', // オル・チキ文字
	ORKH = 'orkh', // オルホン文字
	ORYA = 'orya', // オリヤー文字
	OSGE = 'osge', // オセージ文字
	OSMA = 'osma', // オスマニア文字
	PALM = 'palm', // パルミラ文字
	PAUC = 'pauc', // パウチンハウ文字
	PERM = 'perm', // 古ペルム文字
	PHAG = 'phag', // パスパ文字
	PHLI = 'phli', // 碑文パフラヴィー文字
	PHLP = 'phlp', // プサルター・パフラヴィー文字
	PHNX = 'phnx', // フェニキア文字
	PLRD = 'plrd', // ポラード音標文字
	PRTI = 'prti', // 碑文パルティア文字
	RJNG = 'rjng', // レジャン文字
	ROHG = 'rohg', // ハヌーフィー文字
	RUNR = 'runr', // ルーン文字
	SAMR = 'samr', // サマリア文字
	SARB = 'sarb', // 古南アラビア文字
	SAUR = 'saur', // サウラーシュトラ文字
	SGNW = 'sgnw', // SignWriting
	SHAW = 'shaw', // シェイブィアン文字
	SHRD = 'shrd', // シャーラダー文字
	SIDD = 'sidd', // シッダーム文字
	SIND = 'sind', // クダワディー文字
	SINH = 'sinh', // シンハラ文字
	SOGD = 'sogd', // ソグド文字
	SOGO = 'sogo', // 古ソグド文字
	SORA = 'sora', // ソラ・ソンペン文字
	SOYO = 'soyo', // ソヨンボ文字
	SUND = 'sund', // スンダ文字
	SYLO = 'sylo', // シロティ・ナグリ文字
	SYRC = 'syrc', // シリア文字
	TAGB = 'tagb', // タグバヌワ文字
	TAKR = 'takr', // タークリー文字
	TALE = 'tale', // タイ・レ文字
	TALU = 'talu', // 新タイ・ルー文字
	TAML = 'taml', // タミル文字
	TANG = 'tang', // 西夏文字
	TAVT = 'tavt', // タイ・ヴィエト文字
	TELU = 'telu', // テルグ文字
	TFNG = 'tfng', // ティフィナグ文字
	TGLG = 'tglg', // タガログ文字
	THAA = 'thaa', // ターナ文字
	THAI = 'thai', // タイ文字
	TIBT = 'tibt', // チベット文字
	TIRH = 'tirh', // ティルフータ文字
	UGAR = 'ugar', // ウガリト文字
	VAI = 'vai ', // ヴァイ文字
	WARA = 'wara', // ヴァラング文字
	WCHO = 'wcho', // ヴァンチョ文字
	XPEO = 'xpeo', // 古代ペルシア文字
	XSUX = 'xsux', // 楔形文字
	YIII = 'yiii', // イ文字
	ZANB = 'zanb', // ザナバザル方形文字
	ZINH = 'zinh', // 継承
	ZYYY = 'zyyy', // 共通
	ZZZZ = 'zzzz', // 不明または無効なスクリプト
}

/**
 * 言語タグ（Language Tags）
 * 言語を識別するための4バイトのタグ
 */
export const enum OpenTypeLangSysTag {
	// デフォルト言語タグ
	DFLT = 'DFLT', // デフォルト言語システム

	// 南アジア
	BEN = 'BEN ', // ベンガル語
	DEV = 'DEV ', // デーヴァナーガリー
	GUJ = 'GUJ ', // グジャラート語
	HIN = 'HIN ', // ヒンディー語
	KAN = 'KAN ', // カンナダ語
	MAL = 'MAL ', // マラヤーラム語
	ORI = 'ORI ', // オリヤー語
	SAN = 'SAN ', // サンスクリット語
	TAM = 'TAM ', // タミル語
	TEL = 'TEL ', // テルグ語
	URD = 'URD ', // ウルドゥー語

	// 東アジア
	JAN = 'JAN ', // 日本語
	CHN = 'CHN ', // 中国語（Simplified）
	HKG = 'HKG ', // 中国語（Hong Kong）
	MAC = 'MAC ', // 中国語（Macau）
	TWN = 'TWN ', // 中国語（Taiwan）
	KOR = 'KOR ', // 韓国語

	// ヨーロッパ
	AFK = 'AFK ', // アフリカーンス語
	ARA = 'ARA ', // アラビア語
	AZE = 'AZE ', // アゼルバイジャン語
	BEL = 'BEL ', // ベラルーシ語
	BGR = 'BGR ', // ブルガリア語
	CAT = 'CAT ', // カタロニア語
	CES = 'CES ', // チェコ語
	DAN = 'DAN ', // デンマーク語
	DEU = 'DEU ', // ドイツ語
	ELL = 'ELL ', // ギリシャ語
	ENG = 'ENG ', // 英語
	ESP = 'ESP ', // スペイン語
	EST = 'EST ', // エストニア語
	FIN = 'FIN ', // フィンランド語
	FRA = 'FRA ', // フランス語
	ITA = 'ITA ', // イタリア語
	NLD = 'NLD ', // オランダ語
	NOR = 'NOR ', // ノルウェー語
	POL = 'POL ', // ポーランド語
	POR = 'POR ', // ポルトガル語
	ROM = 'ROM ', // ルーマニア語
	RUS = 'RUS ', // ロシア語
	SVE = 'SVE ', // スウェーデン語
	TRK = 'TRK ', // トルコ語
	UKR = 'UKR ', // ウクライナ語

	// その他の言語
	HEB = 'HEB ', // ヘブライ語
	THA = 'THA ', // タイ語
	VIT = 'VIT ', // ベトナム語
}

/**
 * 機能タグ（Feature Tags）
 * レイアウト機能を識別するための4バイトのタグ
 */
export const enum OpenTypeFeatureTag {
	// 一般的な機能
	AALT = 'aalt', // 全ての代替形
	ABVF = 'abvf', // 上付き形式
	ABVM = 'abvm', // 上付きマーク
	ABVS = 'abvs', // 上付き代替形
	AFRC = 'afrc', // 代替分数
	AKHN = 'akhn', // アカンド
	BLWF = 'blwf', // 下付き形式
	BLWM = 'blwm', // 下付きマーク
	BLWS = 'blws', // 下付き代替形
	C2PC = 'c2pc', // 大文字から小型大文字への変換
	C2SC = 'c2sc', // 大文字から小文字への変換
	CALT = 'calt', // 文脈依存代替形
	CASE = 'case', // 大文字化
	CCMP = 'ccmp', // グリフ合成・分解
	CFAR = 'cfar', // 接続形式-アラビア語
	CJCT = 'cjct', // 接続形式
	CLIG = 'clig', // 文脈依存合字
	CPCT = 'cpct', // 中央配置
	CPSP = 'cpsp', // 大文字の字間
	CSWH = 'cswh', // 文脈依存スワッシュ
	CURS = 'curs', // 筆記体接続
	DFLT = 'dflt', // デフォルト処理
	DIST = 'dist', // 距離
	DLIG = 'dlig', // 任意の合字
	DNOM = 'dnom', // 分母
	DTLS = 'dtls', // ドットレスフォーム
	EXPT = 'expt', // 専門知識を要する形式
	FALT = 'falt', // 終止形代替形
	FIN2 = 'fin2', // 末尾形式#2
	FIN3 = 'fin3', // 末尾形式#3
	FINA = 'fina', // 末尾形式
	FLAC = 'flac', // 平坦なアクセント形式
	FRAC = 'frac', // 分数
	FWID = 'fwid', // 全角幅
	HALF = 'half', // 半角幅
	HALN = 'haln', // 半形式
	HALT = 'halt', // 代替半角幅
	HIST = 'hist', // 歴史的形式
	HKNA = 'hkna', // 横書き仮名代替形
	HLIG = 'hlig', // 歴史的合字
	HNGL = 'hngl', // ハングル
	HOJO = 'hojo', // 変体仮名
	HWID = 'hwid', // 半角幅
	INIT = 'init', // 初期形式
	ISOL = 'isol', // 孤立形式
	ITAL = 'ital', // イタリック体
	JALT = 'jalt', // 字形代替形
	JP04 = 'jp04', // JIS2004形式
	JP78 = 'jp78', // JIS78形式
	JP83 = 'jp83', // JIS83形式
	JP90 = 'jp90', // JIS90形式
	KERN = 'kern', // カーニング
	LFBD = 'lfbd', // 左境界
	LIGA = 'liga', // 標準合字
	LJMO = 'ljmo', // 先行子音 ハングル
	LNUM = 'lnum', // ライニング数字
	LOCL = 'locl', // ローカライズされた形式
	LTRA = 'ltra', // 左から右の代替形
	LTRM = 'ltrm', // 左から右の代わりに
	MARK = 'mark', // マーク配置
	MED2 = 'med2', // 中間形式#2
	MEDI = 'medi', // 中間形式
	MGRK = 'mgrk', // 数学的ギリシャ
	MKMK = 'mkmk', // マーク対マーク配置
	NALT = 'nalt', // 注釈代替形
	NLCK = 'nlck', // 窶舌「シロを占めるカーソル
	NUKT = 'nukt', // ヌクタ
	NUMR = 'numr', // 分子
	ONUM = 'onum', // 老式数字
	OPBD = 'opbd', // 光学的境界
	ORDN = 'ordn', // 序数
	ORNM = 'ornm', // 装飾
	PALT = 'palt', // プロポーショナル代替幅
	PCAP = 'pcap', // 小型大文字
	PKNA = 'pkna', // プロポーショナル仮名
	PNUM = 'pnum', // プロポーショナル数字
	PREF = 'pref', // 接頭辞
	PRES = 'pres', // 接頭辞置換
	PSTF = 'pstf', // 接尾辞
	PSTS = 'psts', // 接尾辞置換
	PWID = 'pwid', // プロポーショナル幅
	QWID = 'qwid', // 四分角幅
	RAND = 'rand', // ランダマイズ
	RCLT = 'rclt', // 必須文脈依存形式
	RKRF = 'rkrf', // ラカル形式
	RLIG = 'rlig', // 必須合字
	RPHF = 'rphf', // レファ形式
	RTBD = 'rtbd', // 右境界
	RTLA = 'rtla', // 右から左の代替形
	RTLM = 'rtlm', // 右から左の代わりに
	RUBY = 'ruby', // ルビ注釈形式
	RVRN = 'rvrn', // 必要なバリエーション
	SALT = 'salt', // 様式的代替形
	SINF = 'sinf', // 下付き添字
	SIZE = 'size', // サイズ調整機能
	SMCP = 'smcp', // 小型大文字
	SMPL = 'smpl', // 単純化形式
	SS01 = 'ss01', // スタイルセット1
	SS02 = 'ss02', // スタイルセット2
	SS03 = 'ss03', // スタイルセット3
	SS04 = 'ss04', // スタイルセット4
	SS05 = 'ss05', // スタイルセット5
	SS06 = 'ss06', // スタイルセット6
	SS07 = 'ss07', // スタイルセット7
	SS08 = 'ss08', // スタイルセット8
	SS09 = 'ss09', // スタイルセット9
	SS10 = 'ss10', // スタイルセット10
	SUBS = 'subs', // 下付き文字
	SUPS = 'sups', // 上付き文字
	SWSH = 'swsh', // スワッシュ
	TITL = 'titl', // タイトル
	TJMO = 'tjmo', // 中間子音 ハングル
	TNAM = 'tnam', // 伝統的な名前形式
	TNUM = 'tnum', // 表形式数字
	TRAD = 'trad', // 伝統的形式
	TWID = 'twid', // 三分角幅
	UNIC = 'unic', // ユニケース
	VALT = 'valt', // 代替垂直メトリクス
	VATU = 'vatu', // バット
	VERT = 'vert', // 垂直書き
	VHAL = 'vhal', // 代替垂直半角メトリクス
	VJMO = 'vjmo', // 後続子音 ハングル
	VKNA = 'vkna', // 縦書き仮名代替形
	VKRN = 'vkrn', // 垂直カーニング
	VPAL = 'vpal', // 垂直プロポーショナル代替メトリクス
	VRT2 = 'vrt2', // 垂直代替メトリクス#2
	VRTR = 'vrtr', // 縦中横
	ZERO = 'zero', // スラッシュゼロ
}

/**
 * ベースラインタグ（Baseline Tags）
 * ベースラインを識別するための4バイトのタグ
 */
export const enum OpenTypeBaselineTag {
	HANG = 'hang', // ぶら下げベースライン
	ICFB = 'icfb', // 表意文字表面下端ベースライン
	ICFT = 'icft', // 表意文字表面上端ベースライン
	IDEO = 'ideo', // 表意文字エムボックス下端ベースライン
	IDTP = 'idtp', // 表意文字エムボックス上端ベースライン
	MATH = 'math', // 数式ベースライン
	ROMN = 'romn', // ローマ字ベースライン
}

/**
 * CFF (Compact Font Format) および CFF2 の共通型定義
 * 参考:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff2
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf
 */

// 基本データ型の定義
export type Card8 = number; // 8-bit unsigned integer
export type Card16 = number; // 16-bit unsigned integer
export type Card32 = number; // 32-bit unsigned integer
export type OffSize = number; // 1, 2, 3, or 4 byte unsigned integer
export type Offset = number; // 1, 2, 3, or 4 byte unsigned integer per OffSize
export type SID = number; // 2-byte string identifier

// サブルーチン索引
export interface SubrIndex {
	count: Card16;           // エントリー数
	offSize: OffSize;        // オフセットのサイズ
	offsets: Offset[];       // オフセット配列
	subrs: Uint8Array[];     // サブルーチンデータの配列
}

// 辞書索引の構造
export interface DictIndex {
	count: Card16;           // エントリー数
	offSize: OffSize;        // オフセットのサイズ
	offsets: Offset[];       // オフセット配列
	data: Uint8Array[];      // 辞書データの配列
}

// FDSelect形式
export enum FDSelectFormat {
	Format0 = 0,
	Format3 = 3,
	Format4 = 4
}

// フォーマット0 FDSelect
export interface FDSelect0 {
	format: FDSelectFormat.Format0;
	fds: Card8[];           // グリフごとのFD
}

// フォーマット3 FDSelect
export interface FDSelect3 {
	format: FDSelectFormat.Format3;
	nRanges: Card16;        // 範囲数
	ranges: Array<{
		first: Card16;        // 最初のグリフ
		fd: Card8;            // FDインデックス
	}>;
	sentinel: Card16;       // 番兵値
}

// フォーマット4 FDSelect (CFF2)
export interface FDSelect4 {
	format: FDSelectFormat.Format4;
	nRanges: Card32;        // 範囲数
	ranges: Array<{
		first: Card32;        // 最初のグリフ
		fd: Card16;           // FDインデックス
	}>;
	sentinel: Card32;       // 番兵値
}

// FDSelectのユニオン型
export type FDSelect = FDSelect0 | FDSelect3 | FDSelect4;

// Private DICT 項目
export interface PrivateDictEntry {
	key: number;            // 演算子コード
	value: number | number[]; // オペランド (単一または配列)
}

// Private DICT 共通フィールド
export interface PrivateDictCommon {
	blueValues?: number[];  // ブルー値
	otherBlues?: number[];  // その他のブルー値
	familyBlues?: number[]; // ファミリーブルー値
	familyOtherBlues?: number[]; // ファミリーのその他のブルー値
	blueScale?: number;     // ブルースケール
	blueShift?: number;     // ブルーシフト
	blueFuzz?: number;      // ブルーファズ
	stdHW?: number;         // 標準水平幅
	stdVW?: number;         // 標準垂直幅
	stemSnapH?: number[];   // 水平ステムスナップ幅
	stemSnapV?: number[];   // 垂直ステムスナップ幅
	forceBold?: boolean;    // 強制ボールド
	languageGroup?: number; // 言語グループ
	expansionFactor?: number; // 拡張係数
	initialRandomSeed?: number; // 初期ランダムシード
	subrs?: Offset;         // サブルーチンのオフセット
	defaultWidthX?: number; // デフォルト幅X
	nominalWidthX?: number; // 公称幅X
}

// CharString 演算子
export enum CharStringOperator {
	// CFF1演算子
	HSTEM = 1,
	VSTEM = 3,
	VMOVETO = 4,
	RLINETO = 5,
	HLINETO = 6,
	VLINETO = 7,
	RRCURVETO = 8,
	CALLSUBR = 10,
	RETURN = 11,
	ESCAPE = 12,    // 2バイト演算子の1バイト目
	ENDCHAR = 14,
	HSTEMHM = 18,
	HINTMASK = 19,
	CNTRMASK = 20,
	RMOVETO = 21,
	HMOVETO = 22,
	VSTEMHM = 23,
	RCURVELINE = 24,
	RLINECURVE = 25,
	VVCURVETO = 26,
	HHCURVETO = 27,
	SHORTINT = 28,  // 2バイト整数の1バイト目
	CALLGSUBR = 29,
	VHCURVETO = 30,
	HVCURVETO = 31,

	// 拡張演算子 (ESCAPE の後に続く)
	DOTSECTION = 0,
	AND = 3,
	OR = 4,
	NOT = 5,
	ABS = 9,
	ADD = 10,
	SUB = 11,
	DIV = 12,
	NEG = 14,
	EQ = 15,
	DROP = 18,
	PUT = 20,
	GET = 21,
	IFELSE = 22,
	RANDOM = 23,
	MUL = 24,
	SQRT = 26,
	DUP = 27,
	EXCH = 28,
	INDEX = 29,
	ROLL = 30,
	HFLEX = 34,
	FLEX = 35,
	HFLEX1 = 36,
	FLEX1 = 37,

	// CFF2 固有の演算子
	BLEND = 16
}

// CharString コマンド
export type CharStringCommand = {
	operator: CharStringOperator;
	operands: number[];
};

// CharString プログラム
export type CharStringProgram = CharStringCommand[];

// 変数データストア (CFF2)
export interface VariationStore {
	format: Card16;         // フォーマット (常に1)
	regionList: RegionList;
	dataList: ItemVariationDataList;
}

export interface RegionList {
	axisCount: Card16;      // 軸数
	regionCount: Card16;    // 領域数
	regions: Region[];      // 領域配列
}

export interface Region {
	regionAxes: RegionAxis[]; // 各軸の領域情報
}

export interface RegionAxis {
	startCoord: number;     // 開始座標
	peakCoord: number;      // ピーク座標
	endCoord: number;       // 終了座標
}

export interface ItemVariationDataList {
	itemCount: Card16;      // アイテム数
	itemVariationData: ItemVariationData[]; // データ配列
}

export interface ItemVariationData {
	itemCount: Card16;      // アイテム数
	shortDeltaCount: Card16; // 短いデルタの数
	regionIndexCount: Card16; // 領域インデックス数
	regionIndices: Card16[]; // 領域インデックス配列
	deltaSet: number[][];   // デルタセット
}

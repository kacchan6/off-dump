/**
 * name テーブル型定義
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/name
 */

/**
 * プラットフォームID
 */
export const enum PlatformID {
	Unicode = 0,
	Machintosh = 1,
	ISO = 2, // 非推奨
	Windows = 3,
	Custom = 4
}

/**
 * Unicodeプラットフォームでのエンコーディングの種類
 */
export const enum UnicodeEncodingID {
	UNICODE_1_0 = 0,
	UNICODE_1_1 = 1,
	ISO_10646 = 2,
	UNICODE_2_0_BMP = 3,
	UNICODE_2_0_FULL = 4,
	UNICODE_VARIATION_SEQUENCES = 5,
	UNICODE_FULL = 6
}

/**
 * Macintoshプラットフォームでの言語ID
 */
export const enum MacintoshLanguageID {
	English = 0,
	French = 1,
	German = 2,
	Italian = 3,
	Dutch = 4,
	Swedish = 5,
	Spanish = 6,
	Danish = 7,
	Portuguese = 8,
	Norwegian = 9,
	Hebrew = 10,
	Japanese = 11,
	Arabic = 12,
	Finnish = 13,
	Greek = 14,
	Icelandic = 15,
	Maltese = 16,
	Turkish = 17,
	Croatian = 18,
	ChineseTraditional = 19,
	Urdu = 20,
	Hindi = 21,
	Thai = 22,
	Korean = 23,
	Lithuanian = 24,
	Polish = 25,
	Hungarian = 26,
	Estonian = 27,
	Latvian = 28,
	Sami = 29,
	Faroese = 30,
	FarsiPersian = 31,
	Russian = 32,
	ChineseSimplified = 33,
	Flemish = 34,
	IrishGaelic = 35,
	Albanian = 36,
	Romanian = 37,
	Czech = 38,
	Slovak = 39,
	Slovenian = 40,
	Yiddish = 41,
	Serbian = 42,
	Macedonian = 43,
	Bulgarian = 44,
	Ukrainian = 45,
	Byelorussian = 46,
	Uzbek = 47,
	Kazakh = 48,
	AzerbaijaniCyrillic = 49,
	AzerbaijaniArabic = 50,
	Armenian = 51,
	Georgian = 52,
	Moldavian = 53,
	Kirghiz = 54,
	Tajiki = 55,
	Turkmen = 56,
	Mongolian = 57,
	MongolianCyrillic = 58,
	Pashto = 59,
	Kurdish = 60,
	Kashmiri = 61,
	Sindhi = 62,
	Tibetan = 63,
	Nepali = 64,
	Sanskrit = 65,
	Marathi = 66,
	Bengali = 67,
	Assamese = 68,
	Gujarati = 69,
	Punjabi = 70,
	Oriya = 71,
	Malayalam = 72,
	Kannada = 73,
	Tamil = 74,
	Telugu = 75,
	Sinhalese = 76,
	Burmese = 77,
	Khmer = 78,
	Lao = 79,
	Vietnamese = 80,
	Indonesian = 81,
	Tagalog = 82,
	MalayRoman = 83,
	MalayArabic = 84,
	Amharic = 85,
	Tigrinya = 86,
	Galla = 87,
	Somali = 88,
	Swahili = 89,
	KinyarwandaRuanda = 90,
	Rundi = 91,
	NyanjaChewa = 92,
	Malagasy = 93,
	Esperanto = 94,
	Welsh = 128,
	Basque = 129,
	Catalan = 130,
	Latin = 131,
	Quechua = 132,
	Guarani = 133,
	Aymara = 134,
	Tatar = 135,
	Uighur = 136,
	Dzongkha = 137,
	Javanese = 138,
	Sundanese = 139,
	Galician = 140,
	Afrikaans = 141,
	Breton = 142,
	Inuktitut = 143,
	ScottishGaelic = 144,
	ManxGaelic = 145,
	IrishGaelicWithDot = 146,
	Tongan = 147,
	GreekPolytonic = 148,
	Greenlandic = 149,
	AzerbaijaniRoman = 150
}

/**
 * Windowsプラットフォームでの言語ID
 */
export const enum WindowsLanguageID {
	AfrikaansSouthAfrica = 1078,
	AlbanianAlbania = 1052,
	AlsatianFrance = 1156,
	AmharicEthiopia = 1118,
	ArabicAlgeria = 5121,
	ArabicBahrain = 15361,
	ArabicEgypt = 3073,
	ArabicIraq = 2049,
	ArabicJordan = 11265,
	ArabicKuwait = 13313,
	ArabicLebanon = 12289,
	ArabicLibya = 4097,
	ArabicMorocco = 6145,
	ArabicOman = 8193,
	ArabicQatar = 16385,
	ArabicSaudiArabia = 1025,
	ArabicSyria = 10241,
	ArabicTunisia = 7169,
	ArabicUae = 14337,
	ArabicYemen = 9217,
	ArmenianArmenia = 1067,
	AssameseIndia = 1101,
	AzeriCyrillicAzerbaijan = 2092,
	AzeriLatinAzerbaijan = 1068,
	BashkirRussia = 1133,
	BasqueBasque = 1069,
	BelarusianBelarus = 1059,
	BengliBangladesh = 2117,
	BengliIndia = 1093,
	BosnianCyrillicBosniaHerzegovina = 8218,
	BosnianLatinBosniaHerzegovina = 5146,
	BretonFrance = 1150,
	BulgarianBulgaria = 1026,
	CatalanCatalan = 1027,
	ChineseHongkong = 3076,
	ChineseMacao = 5124,
	ChinesePrc = 2052,
	ChineseSingapore = 4100,
	ChineseTaiwan = 1028,
	CorsicanFrance = 1155,
	CroatianBosniaHerzegovina = 4122,
	CroatianCroatia = 1050,
	CzechCzechRepublic = 1029,
	DanishDenmark = 1030,
	DariAfghanistan = 1164,
	DivehiMaldives = 1125,
	DutchBelgium = 2067,
	DutchNetherlands = 1043,
	EnglishAustralia = 3081,
	EnglishBelize = 10249,
	EnglishCanada = 4105,
	EnglishCaribbean = 9225,
	EnglishIndia = 16393,
	EnglishIreland = 6153,
	EnglishJamaica = 8201,
	EnglishMalaysia = 17417,
	EnglishNewZealand = 5129,
	EnglishRepublicOfThePhilippines = 13321,
	EnglishSingapore = 18441,
	EnglishSouthAfrica = 7177,
	EnglishTrinidadTobago = 11273,
	EnglishUnitedKingdom = 2057,
	EnglishUnitedStates = 1033,
	EnglishZimbabwe = 12297,
	EstonianEstonia = 1061,
	FaroeseFaroeIslands = 1080,
	FilipinoPhilippines = 1124,
	FinnishFinland = 1035,
	FrenchBelgium = 2060,
	FrenchCanada = 3084,
	FrenchFrance = 1036,
	FrenchLuxembourg = 5132,
	FrenchMonaco = 6156,
	FrenchSwitzerland = 4108,
	FrisianNetherlands = 1122,
	GalicianGalician = 1110,
	GeorgianGeorgia = 1079,
	GermanAustria = 3079,
	GermanGermany = 1031,
	GermanLiechtenstein = 5127,
	GermanLuxembourg = 4103,
	GermanSwitzerland = 2055,
	GreekGreece = 1032,
	GreenlandicGreenland = 1135,
	GujaratiIndia = 1095,
	HausaLatinNigeria = 1128,
	HebrewIsrael = 1037,
	HindiIndia = 1081,
	HungarianHungary = 1038,
	IcelandicIceland = 1039,
	IgboNigeria = 1136,
	IndonesianIndonesia = 1057,
	InuktitutCanada = 1117,
	InuktitutLatinCanada = 2141,
	IrishIreland = 2124,
	IsixhosaSouthAfrica = 1076,
	IsizuluSouthAfrica = 1077,
	ItalianItaly = 1040,
	ItalianSwitzerland = 2064,
	JapaneseJapan = 1041,
	KannadaIndia = 1099,
	KazakhKazakhstan = 1087,
	KhmerCambodia = 1107,
	KicheGuatemala = 1158,
	KinyarwandaRwanda = 1159,
	KiswahiliKenya = 1089,
	KonkaniIndia = 1111,
	KoreanKorea = 1042,
	KyrgyzKyrgyzstan = 1088,
	LaoLaoPdr = 1108,
	LatvianLatvia = 1062,
	LithuanianLithuania = 1063,
	LowerSorbianGermany = 2094,
	LuxembourgishLuxembourg = 1134,
	MacedonianFyrom = 1071,
	MalayBruneiDarussalam = 2110,
	MalayMalaysia = 1086,
	MalayalamIndia = 1100,
	MalteseMalta = 1082,
	MaoriNewZealand = 1153,
	MapudungunChile = 1146,
	MarathiIndia = 1102,
	MohawkMohawk = 1148,
	MongolianCyrillicMongolia = 1104,
	MongolianTraditionalPrc = 2128,
	NepaliNepal = 1121,
	NorwegianBokmalNorway = 1044,
	NorwegianNynorskNorway = 2068,
	OccitanFrance = 1154,
	OriyaIndia = 1096,
	PashtoAfghanistan = 1123,
	PersianIran = 1065,
	PolishPoland = 1045,
	PortugueseBrazil = 1046,
	PortuguesePortugal = 2070,
	PunjabiIndia = 1094,
	QuechuaBolivia = 1131,
	QuechuaEcuador = 2155,
	QuechuaPeru = 3179,
	RomanianRomania = 1048,
	RomanshSwitzerland = 1047,
	RussianRussia = 1049,
	SamiInariFinland = 9275,
	SamiLuleNorway = 4155,
	SamiLuleSweden = 5179,
	SamiNorthernFinland = 3083,
	SamiNorthernNorway = 1083,
	SamiNorthernSweden = 2107,
	SamiSkoltFinland = 8251,
	SamiSouthernNorway = 6203,
	SamiSouthernSweden = 7227,
	SanskritIndia = 1103,
	SerbianCyrillicBosniaHerzegovina = 7194,
	SerbianCyrillicSerbia = 3098,
	SerbianLatinBosniaHerzegovina = 6170,
	SerbianLatinSerbia = 2074,
	SesothoSaLeboaSouthAfrica = 1132,
	SetswanaSouthAfrica = 1074,
	SinhalaSriLanka = 1115,
	SlovakSlovakia = 1051,
	SlovenianSlovenia = 1060,
	SpanishArgentina = 11274,
	SpanishBolivia = 16394,
	SpanishChile = 13322,
	SpanishColombia = 9226,
	SpanishCostaRica = 5130,
	SpanishDominicanRepublic = 7178,
	SpanishEcuador = 12298,
	SpanishElSalvador = 17474,
	SpanishGuatemala = 4106,
	SpanishHonduras = 18442,
	SpanishMexico = 2058,
	SpanishNicaragua = 19466,
	SpanishPanama = 6154,
	SpanishParaguay = 15370,
	SpanishPeru = 10250,
	SpanishPuertoRico = 20490,
	SpanishModernSortSpain = 3082,
	SpanishTraditionalSortSpain = 1034,
	SpanishUnitedStates = 21514,
	SpanishUruguay = 14346,
	SpanishVenezuela = 8202,
	SwedishFinland = 2077,
	SwedishSweden = 1053,
	SyriacSyria = 1114,
	TajikCyrillicTajikistan = 1064,
	TamazightLatinAlgeria = 2143,
	TamilIndia = 1097,
	TatarRussia = 1092,
	TeluguIndia = 1098,
	ThaiThailand = 1054,
	TibetanPrc = 1105,
	TurkishTurkey = 1055,
	TurkmenTurkmenistan = 1090,
	UighurPrc = 1152,
	UkrainianUkraine = 1058,
	UpperSorbianGermany = 1070,
	UrduIslamicRepublicOfPakistan = 1056,
	UzbekCyrillicUzbekistan = 2115,
	UzbekLatinUzbekistan = 1091,
	VietnameseVietnam = 1066,
	WelshUnitedKingdom = 1106,
	WolofSenegal = 1160,
	YakutRussia = 1157,
	YiPrc = 1144,
	YorubaNigeria = 1130
}

/**
 * 名前ID (nameID)
 */
export const enum NameID {
	CopyrightNotice = 0,
	FontFamilyName = 1,
	FontSubfamilyName = 2,
	UniqueFontIdentifier = 3,
	FullFontName = 4,
	VersionString = 5,
	PostscriptName = 6,
	Trademark = 7,
	ManufacturerName = 8,
	Designer = 9,
	Description = 10,
	UrlVendor = 11,
	UrlDesigner = 12,
	LicenseDescription = 13,
	LicenseInfoUrl = 14,
	Reserved = 15,
	TypographicFamilyName = 16,
	TypographicSubfamilyName = 17,
	CompatibleFullName = 18,
	SampleText = 19,
	PostscriptCidFindfontName = 20,
	WwsFamilyName = 21,
	WwsSubfamilyName = 22,
	LightBackgroundPalette = 23,
	DarkBackgroundPalette = 24,
	VariationsPostscriptNamePrefix = 25
}

/**
 * 名前レコード
 */
export interface NameRecord {
	/**
	 * プラットフォームID
	 */
	platformID: number;

	/**
	 * プラットフォーム固有のエンコーディングID
	 */
	encodingID: number;

	/**
	 * 言語ID
	 */
	languageID: number;

	/**
	 * 名前ID
	 */
	nameID: number;

	/**
	 * 文字列の長さ (バイト単位)
	 */
	length: number;

	/**
	 * 文字列データへのオフセット (文字列ストレージの先頭から)
	 */
	offset: number;

	/**
	 * デコードされた文字列
	 */
	string: string;
}

/**
 * 言語タグレコード (バージョン1の場合のみ)
 */
export interface LangTagRecord {
	/**
	 * 言語タグの長さ (バイト単位)
	 */
	length: number;

	/**
	 * 言語タグ文字列へのオフセット (言語タグストレージの先頭から)
	 */
	offset: number;

	/**
	 * 言語タグ文字列
	 */
	tag: string;
}

/**
 * nameテーブルの詳細情報
 */
export interface NameTable {
	/**
	 * nameテーブルのフォーマット (0 or 1)
	 */
	format: number;

	/**
	 * 名前レコードの数
	 */
	count: number;

	/**
	 * オフセット (文字列ストレージの先頭)
	 */
	stringOffset: number;

	/**
	 * 名前レコードの配列
	 */
	nameRecords: NameRecord[];

	/**
	 * 言語タグレコードの数 (フォーマット1の場合のみ)
	 */
	langTagCount?: number;

	/**
	 * 言語タグレコードの配列 (フォーマット1の場合のみ)
	 */
	langTagRecords?: LangTagRecord[];
}

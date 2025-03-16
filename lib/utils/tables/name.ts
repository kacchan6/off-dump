/**
 * nameテーブル関連のユーティリティ関数
 */

import { NameTable, NameID, PlatformID, WindowsLanguageID, MacintoshLanguageID } from '../../types/tables/name';

// プラットフォームIDとその名前のマッピング
const platformIDNames: Record<number, string> = {
	[PlatformID.Unicode]: "UNICODE",
	[PlatformID.Machintosh]: "MACINTOSH",
	[PlatformID.ISO]: "ISO",
	[PlatformID.Windows]: "WINDOWS",
	[PlatformID.Custom]: "CUSTOM"
};

// Macintosh言語IDとその名前のマッピング
const macintoshLanguageNames: Record<number, string> = {
	[MacintoshLanguageID.English]: "0",
	[MacintoshLanguageID.French]: "1",
	[MacintoshLanguageID.German]: "2",
	[MacintoshLanguageID.Italian]: "3",
	[MacintoshLanguageID.Dutch]: "4",
	[MacintoshLanguageID.Swedish]: "5",
	[MacintoshLanguageID.Spanish]: "6",
	[MacintoshLanguageID.Danish]: "7",
	[MacintoshLanguageID.Portuguese]: "8",
	[MacintoshLanguageID.Norwegian]: "9",
	[MacintoshLanguageID.Hebrew]: "10",
	[MacintoshLanguageID.Japanese]: "11",
	[MacintoshLanguageID.Arabic]: "12",
	[MacintoshLanguageID.Finnish]: "13",
	[MacintoshLanguageID.Greek]: "14",
	[MacintoshLanguageID.Icelandic]: "15",
	[MacintoshLanguageID.Maltese]: "16",
	[MacintoshLanguageID.Turkish]: "17",
	[MacintoshLanguageID.Croatian]: "18",
	[MacintoshLanguageID.ChineseTraditional]: "19",
	[MacintoshLanguageID.Urdu]: "20",
	[MacintoshLanguageID.Hindi]: "21",
	[MacintoshLanguageID.Thai]: "22",
	[MacintoshLanguageID.Korean]: "23",
	[MacintoshLanguageID.Lithuanian]: "24",
	[MacintoshLanguageID.Polish]: "25",
	[MacintoshLanguageID.Hungarian]: "26",
	[MacintoshLanguageID.Estonian]: "27",
	[MacintoshLanguageID.Latvian]: "28",
	[MacintoshLanguageID.Sami]: "29",
	[MacintoshLanguageID.Faroese]: "30",
	[MacintoshLanguageID.FarsiPersian]: "31",
	[MacintoshLanguageID.Russian]: "32",
	[MacintoshLanguageID.ChineseSimplified]: "33",
	[MacintoshLanguageID.Flemish]: "34",
	[MacintoshLanguageID.IrishGaelic]: "35",
	[MacintoshLanguageID.Albanian]: "36",
	[MacintoshLanguageID.Romanian]: "37",
	[MacintoshLanguageID.Czech]: "38",
	[MacintoshLanguageID.Slovak]: "39",
	[MacintoshLanguageID.Slovenian]: "40",
	[MacintoshLanguageID.Yiddish]: "41",
	[MacintoshLanguageID.Serbian]: "42",
	[MacintoshLanguageID.Macedonian]: "43",
	[MacintoshLanguageID.Bulgarian]: "44",
	[MacintoshLanguageID.Ukrainian]: "45",
	[MacintoshLanguageID.Byelorussian]: "46",
	[MacintoshLanguageID.Uzbek]: "47",
	[MacintoshLanguageID.Kazakh]: "48",
	[MacintoshLanguageID.AzerbaijaniCyrillic]: "49",
	[MacintoshLanguageID.AzerbaijaniArabic]: "50",
	[MacintoshLanguageID.Armenian]: "51",
	[MacintoshLanguageID.Georgian]: "52",
	[MacintoshLanguageID.Moldavian]: "53",
	[MacintoshLanguageID.Kirghiz]: "54",
	[MacintoshLanguageID.Tajiki]: "55",
	[MacintoshLanguageID.Turkmen]: "56",
	[MacintoshLanguageID.Mongolian]: "57",
	[MacintoshLanguageID.MongolianCyrillic]: "58",
	[MacintoshLanguageID.Pashto]: "59",
	[MacintoshLanguageID.Kurdish]: "60",
	[MacintoshLanguageID.Kashmiri]: "61",
	[MacintoshLanguageID.Sindhi]: "62",
	[MacintoshLanguageID.Tibetan]: "63",
	[MacintoshLanguageID.Nepali]: "64",
	[MacintoshLanguageID.Sanskrit]: "65",
	[MacintoshLanguageID.Marathi]: "66",
	[MacintoshLanguageID.Bengali]: "67",
	[MacintoshLanguageID.Assamese]: "68",
	[MacintoshLanguageID.Gujarati]: "69",
	[MacintoshLanguageID.Punjabi]: "70",
	[MacintoshLanguageID.Oriya]: "71",
	[MacintoshLanguageID.Malayalam]: "72",
	[MacintoshLanguageID.Kannada]: "73",
	[MacintoshLanguageID.Tamil]: "74",
	[MacintoshLanguageID.Telugu]: "75",
	[MacintoshLanguageID.Sinhalese]: "76",
	[MacintoshLanguageID.Burmese]: "77",
	[MacintoshLanguageID.Khmer]: "78",
	[MacintoshLanguageID.Lao]: "79",
	[MacintoshLanguageID.Vietnamese]: "80",
	[MacintoshLanguageID.Indonesian]: "81",
	[MacintoshLanguageID.Tagalog]: "82",
	[MacintoshLanguageID.MalayRoman]: "83",
	[MacintoshLanguageID.MalayArabic]: "84",
	[MacintoshLanguageID.Amharic]: "85",
	[MacintoshLanguageID.Tigrinya]: "86",
	[MacintoshLanguageID.Galla]: "87",
	[MacintoshLanguageID.Somali]: "88",
	[MacintoshLanguageID.Swahili]: "89",
	[MacintoshLanguageID.KinyarwandaRuanda]: "90",
	[MacintoshLanguageID.Rundi]: "91",
	[MacintoshLanguageID.NyanjaChewa]: "92",
	[MacintoshLanguageID.Malagasy]: "93",
	[MacintoshLanguageID.Esperanto]: "94",
	[MacintoshLanguageID.Welsh]: "128",
	[MacintoshLanguageID.Basque]: "129",
	[MacintoshLanguageID.Catalan]: "130",
	[MacintoshLanguageID.Latin]: "131",
	[MacintoshLanguageID.Quechua]: "132",
	[MacintoshLanguageID.Guarani]: "133",
	[MacintoshLanguageID.Aymara]: "134",
	[MacintoshLanguageID.Tatar]: "135",
	[MacintoshLanguageID.Uighur]: "136",
	[MacintoshLanguageID.Dzongkha]: "137",
	[MacintoshLanguageID.Javanese]: "138",
	[MacintoshLanguageID.Sundanese]: "139",
	[MacintoshLanguageID.Galician]: "140",
	[MacintoshLanguageID.Afrikaans]: "141",
	[MacintoshLanguageID.Breton]: "142",
	[MacintoshLanguageID.Inuktitut]: "143",
	[MacintoshLanguageID.ScottishGaelic]: "144",
	[MacintoshLanguageID.ManxGaelic]: "145",
	[MacintoshLanguageID.IrishGaelicWithDot]: "146",
	[MacintoshLanguageID.Tongan]: "147",
	[MacintoshLanguageID.GreekPolytonic]: "148",
	[MacintoshLanguageID.Greenlandic]: "149",
	[MacintoshLanguageID.AzerbaijaniRoman]: "150",
};

// Windows言語IDとその名前のマッピング
const windowsLanguageNames: Record<number, string> = {
	[WindowsLanguageID.AfrikaansSouthAfrica]: "1078",
	[WindowsLanguageID.AlbanianAlbania]: "1052",
	[WindowsLanguageID.AlsatianFrance]: "1156",
	[WindowsLanguageID.AmharicEthiopia]: "1118",
	[WindowsLanguageID.ArabicAlgeria]: "5121",
	[WindowsLanguageID.ArabicBahrain]: "15361",
	[WindowsLanguageID.ArabicEgypt]: "3073",
	[WindowsLanguageID.ArabicIraq]: "2049",
	[WindowsLanguageID.ArabicJordan]: "11265",
	[WindowsLanguageID.ArabicKuwait]: "13313",
	[WindowsLanguageID.ArabicLebanon]: "12289",
	[WindowsLanguageID.ArabicLibya]: "4097",
	[WindowsLanguageID.ArabicMorocco]: "6145",
	[WindowsLanguageID.ArabicOman]: "8193",
	[WindowsLanguageID.ArabicQatar]: "16385",
	[WindowsLanguageID.ArabicSaudiArabia]: "1025",
	[WindowsLanguageID.ArabicSyria]: "10241",
	[WindowsLanguageID.ArabicTunisia]: "7169",
	[WindowsLanguageID.ArabicUae]: "14337",
	[WindowsLanguageID.ArabicYemen]: "9217",
	[WindowsLanguageID.ArmenianArmenia]: "1067",
	[WindowsLanguageID.AssameseIndia]: "1101",
	[WindowsLanguageID.AzeriCyrillicAzerbaijan]: "2092",
	[WindowsLanguageID.AzeriLatinAzerbaijan]: "1068",
	[WindowsLanguageID.BashkirRussia]: "1133",
	[WindowsLanguageID.BasqueBasque]: "1069",
	[WindowsLanguageID.BelarusianBelarus]: "1059",
	[WindowsLanguageID.BengliBangladesh]: "2117",
	[WindowsLanguageID.BengliIndia]: "1093",
	[WindowsLanguageID.BosnianCyrillicBosniaHerzegovina]: "8218",
	[WindowsLanguageID.BosnianLatinBosniaHerzegovina]: "5146",
	[WindowsLanguageID.BretonFrance]: "1150",
	[WindowsLanguageID.BulgarianBulgaria]: "1026",
	[WindowsLanguageID.CatalanCatalan]: "1027",
	[WindowsLanguageID.ChineseHongkong]: "3076",
	[WindowsLanguageID.ChineseMacao]: "5124",
	[WindowsLanguageID.ChinesePrc]: "2052",
	[WindowsLanguageID.ChineseSingapore]: "4100",
	[WindowsLanguageID.ChineseTaiwan]: "1028",
	[WindowsLanguageID.CorsicanFrance]: "1155",
	[WindowsLanguageID.CroatianBosniaHerzegovina]: "4122",
	[WindowsLanguageID.CroatianCroatia]: "1050",
	[WindowsLanguageID.CzechCzechRepublic]: "1029",
	[WindowsLanguageID.DanishDenmark]: "1030",
	[WindowsLanguageID.DariAfghanistan]: "1164",
	[WindowsLanguageID.DivehiMaldives]: "1125",
	[WindowsLanguageID.DutchBelgium]: "2067",
	[WindowsLanguageID.DutchNetherlands]: "1043",
	[WindowsLanguageID.EnglishAustralia]: "3081",
	[WindowsLanguageID.EnglishBelize]: "10249",
	[WindowsLanguageID.EnglishCanada]: "4105",
	[WindowsLanguageID.EnglishCaribbean]: "9225",
	[WindowsLanguageID.EnglishIndia]: "16393",
	[WindowsLanguageID.EnglishIreland]: "6153",
	[WindowsLanguageID.EnglishJamaica]: "8201",
	[WindowsLanguageID.EnglishMalaysia]: "17417",
	[WindowsLanguageID.EnglishNewZealand]: "5129",
	[WindowsLanguageID.EnglishRepublicOfThePhilippines]: "13321",
	[WindowsLanguageID.EnglishSingapore]: "18441",
	[WindowsLanguageID.EnglishSouthAfrica]: "7177",
	[WindowsLanguageID.EnglishTrinidadTobago]: "11273",
	[WindowsLanguageID.EnglishUnitedKingdom]: "2057",
	[WindowsLanguageID.EnglishUnitedStates]: "1033",
	[WindowsLanguageID.EnglishZimbabwe]: "12297",
	[WindowsLanguageID.EstonianEstonia]: "1061",
	[WindowsLanguageID.FaroeseFaroeIslands]: "1080",
	[WindowsLanguageID.FilipinoPhilippines]: "1124",
	[WindowsLanguageID.FinnishFinland]: "1035",
	[WindowsLanguageID.FrenchBelgium]: "2060",
	[WindowsLanguageID.FrenchCanada]: "3084",
	[WindowsLanguageID.FrenchFrance]: "1036",
	[WindowsLanguageID.FrenchLuxembourg]: "5132",
	[WindowsLanguageID.FrenchMonaco]: "6156",
	[WindowsLanguageID.FrenchSwitzerland]: "4108",
	[WindowsLanguageID.FrisianNetherlands]: "1122",
	[WindowsLanguageID.GalicianGalician]: "1110",
	[WindowsLanguageID.GeorgianGeorgia]: "1079",
	[WindowsLanguageID.GermanAustria]: "3079",
	[WindowsLanguageID.GermanGermany]: "1031",
	[WindowsLanguageID.GermanLiechtenstein]: "5127",
	[WindowsLanguageID.GermanLuxembourg]: "4103",
	[WindowsLanguageID.GermanSwitzerland]: "2055",
	[WindowsLanguageID.GreekGreece]: "1032",
	[WindowsLanguageID.GreenlandicGreenland]: "1135",
	[WindowsLanguageID.GujaratiIndia]: "1095",
	[WindowsLanguageID.HausaLatinNigeria]: "1128",
	[WindowsLanguageID.HebrewIsrael]: "1037",
	[WindowsLanguageID.HindiIndia]: "1081",
	[WindowsLanguageID.HungarianHungary]: "1038",
	[WindowsLanguageID.IcelandicIceland]: "1039",
	[WindowsLanguageID.IgboNigeria]: "1136",
	[WindowsLanguageID.IndonesianIndonesia]: "1057",
	[WindowsLanguageID.InuktitutCanada]: "1117",
	[WindowsLanguageID.InuktitutLatinCanada]: "2141",
	[WindowsLanguageID.IrishIreland]: "2124",
	[WindowsLanguageID.IsixhosaSouthAfrica]: "1076",
	[WindowsLanguageID.IsizuluSouthAfrica]: "1077",
	[WindowsLanguageID.ItalianItaly]: "1040",
	[WindowsLanguageID.ItalianSwitzerland]: "2064",
	[WindowsLanguageID.JapaneseJapan]: "1041",
	[WindowsLanguageID.KannadaIndia]: "1099",
	[WindowsLanguageID.KazakhKazakhstan]: "1087",
	[WindowsLanguageID.KhmerCambodia]: "1107",
	[WindowsLanguageID.KicheGuatemala]: "1158",
	[WindowsLanguageID.KinyarwandaRwanda]: "1159",
	[WindowsLanguageID.KiswahiliKenya]: "1089",
	[WindowsLanguageID.KonkaniIndia]: "1111",
	[WindowsLanguageID.KoreanKorea]: "1042",
	[WindowsLanguageID.KyrgyzKyrgyzstan]: "1088",
	[WindowsLanguageID.LaoLaoPdr]: "1108",
	[WindowsLanguageID.LatvianLatvia]: "1062",
	[WindowsLanguageID.LithuanianLithuania]: "1063",
	[WindowsLanguageID.LowerSorbianGermany]: "2094",
	[WindowsLanguageID.LuxembourgishLuxembourg]: "1134",
	[WindowsLanguageID.MacedonianFyrom]: "1071",
	[WindowsLanguageID.MalayBruneiDarussalam]: "2110",
	[WindowsLanguageID.MalayMalaysia]: "1086",
	[WindowsLanguageID.MalayalamIndia]: "1100",
	[WindowsLanguageID.MalteseMalta]: "1082",
	[WindowsLanguageID.MaoriNewZealand]: "1153",
	[WindowsLanguageID.MapudungunChile]: "1146",
	[WindowsLanguageID.MarathiIndia]: "1102",
	[WindowsLanguageID.MohawkMohawk]: "1148",
	[WindowsLanguageID.MongolianCyrillicMongolia]: "1104",
	[WindowsLanguageID.MongolianTraditionalPrc]: "2128",
	[WindowsLanguageID.NepaliNepal]: "1121",
	[WindowsLanguageID.NorwegianBokmalNorway]: "1044",
	[WindowsLanguageID.NorwegianNynorskNorway]: "2068",
	[WindowsLanguageID.OccitanFrance]: "1154",
	[WindowsLanguageID.OriyaIndia]: "1096",
	[WindowsLanguageID.PashtoAfghanistan]: "1123",
	[WindowsLanguageID.PersianIran]: "1065",
	[WindowsLanguageID.PolishPoland]: "1045",
	[WindowsLanguageID.PortugueseBrazil]: "1046",
	[WindowsLanguageID.PortuguesePortugal]: "2070",
	[WindowsLanguageID.PunjabiIndia]: "1094",
	[WindowsLanguageID.QuechuaBolivia]: "1131",
	[WindowsLanguageID.QuechuaEcuador]: "2155",
	[WindowsLanguageID.QuechuaPeru]: "3179",
	[WindowsLanguageID.RomanianRomania]: "1048",
	[WindowsLanguageID.RomanshSwitzerland]: "1047",
	[WindowsLanguageID.RussianRussia]: "1049",
	[WindowsLanguageID.SamiInariFinland]: "9275",
	[WindowsLanguageID.SamiLuleNorway]: "4155",
	[WindowsLanguageID.SamiLuleSweden]: "5179",
	[WindowsLanguageID.SamiNorthernFinland]: "3083",
	[WindowsLanguageID.SamiNorthernNorway]: "1083",
	[WindowsLanguageID.SamiNorthernSweden]: "2107",
	[WindowsLanguageID.SamiSkoltFinland]: "8251",
	[WindowsLanguageID.SamiSouthernNorway]: "6203",
	[WindowsLanguageID.SamiSouthernSweden]: "7227",
	[WindowsLanguageID.SanskritIndia]: "1103",
	[WindowsLanguageID.SerbianCyrillicBosniaHerzegovina]: "7194",
	[WindowsLanguageID.SerbianCyrillicSerbia]: "3098",
	[WindowsLanguageID.SerbianLatinBosniaHerzegovina]: "6170",
	[WindowsLanguageID.SerbianLatinSerbia]: "2074",
	[WindowsLanguageID.SesothoSaLeboaSouthAfrica]: "1132",
	[WindowsLanguageID.SetswanaSouthAfrica]: "1074",
	[WindowsLanguageID.SinhalaSriLanka]: "1115",
	[WindowsLanguageID.SlovakSlovakia]: "1051",
	[WindowsLanguageID.SlovenianSlovenia]: "1060",
	[WindowsLanguageID.SpanishArgentina]: "11274",
	[WindowsLanguageID.SpanishBolivia]: "16394",
	[WindowsLanguageID.SpanishChile]: "13322",
	[WindowsLanguageID.SpanishColombia]: "9226",
	[WindowsLanguageID.SpanishCostaRica]: "5130",
	[WindowsLanguageID.SpanishDominicanRepublic]: "7178",
	[WindowsLanguageID.SpanishEcuador]: "12298",
	[WindowsLanguageID.SpanishElSalvador]: "17474",
	[WindowsLanguageID.SpanishGuatemala]: "4106",
	[WindowsLanguageID.SpanishHonduras]: "18442",
	[WindowsLanguageID.SpanishMexico]: "2058",
	[WindowsLanguageID.SpanishNicaragua]: "19466",
	[WindowsLanguageID.SpanishPanama]: "6154",
	[WindowsLanguageID.SpanishParaguay]: "15370",
	[WindowsLanguageID.SpanishPeru]: "10250",
	[WindowsLanguageID.SpanishPuertoRico]: "20490",
	[WindowsLanguageID.SpanishModernSortSpain]: "3082",
	[WindowsLanguageID.SpanishTraditionalSortSpain]: "1034",
	[WindowsLanguageID.SpanishUnitedStates]: "21514",
	[WindowsLanguageID.SpanishUruguay]: "14346",
	[WindowsLanguageID.SpanishVenezuela]: "8202",
	[WindowsLanguageID.SwedishFinland]: "2077",
	[WindowsLanguageID.SwedishSweden]: "1053",
	[WindowsLanguageID.SyriacSyria]: "1114",
	[WindowsLanguageID.TajikCyrillicTajikistan]: "1064",
	[WindowsLanguageID.TamazightLatinAlgeria]: "2143",
	[WindowsLanguageID.TamilIndia]: "1097",
	[WindowsLanguageID.TatarRussia]: "1092",
	[WindowsLanguageID.TeluguIndia]: "1098",
	[WindowsLanguageID.ThaiThailand]: "1054",
	[WindowsLanguageID.TibetanPrc]: "1105",
	[WindowsLanguageID.TurkishTurkey]: "1055",
	[WindowsLanguageID.TurkmenTurkmenistan]: "1090",
	[WindowsLanguageID.UighurPrc]: "1152",
	[WindowsLanguageID.UkrainianUkraine]: "1058",
	[WindowsLanguageID.UpperSorbianGermany]: "1070",
	[WindowsLanguageID.UrduIslamicRepublicOfPakistan]: "1056",
	[WindowsLanguageID.UzbekCyrillicUzbekistan]: "2115",
	[WindowsLanguageID.UzbekLatinUzbekistan]: "1091",
	[WindowsLanguageID.VietnameseVietnam]: "1066",
	[WindowsLanguageID.WelshUnitedKingdom]: "1106",
	[WindowsLanguageID.WolofSenegal]: "1160",
	[WindowsLanguageID.YakutRussia]: "1157",
	[WindowsLanguageID.YiPrc]: "1144",
	[WindowsLanguageID.YorubaNigeria]: "1130",
};

// 名前IDとその説明のマッピング
const nameIDDescriptions: Record<number, string> = {
	[NameID.CopyrightNotice]: "0",
	[NameID.FontFamilyName]: "1",
	[NameID.FontSubfamilyName]: "2",
	[NameID.UniqueFontIdentifier]: "3",
	[NameID.FullFontName]: "4",
	[NameID.VersionString]: "5",
	[NameID.PostscriptName]: "6",
	[NameID.Trademark]: "7",
	[NameID.ManufacturerName]: "8",
	[NameID.Designer]: "9",
	[NameID.Description]: "10",
	[NameID.UrlVendor]: "11",
	[NameID.UrlDesigner]: "12",
	[NameID.LicenseDescription]: "13",
	[NameID.LicenseInfoUrl]: "14",
	[NameID.Reserved]: "15",
	[NameID.TypographicFamilyName]: "16",
	[NameID.TypographicSubfamilyName]: "17",
	[NameID.CompatibleFullName]: "18",
	[NameID.SampleText]: "19",
	[NameID.PostscriptCidFindfontName]: "20",
	[NameID.WwsFamilyName]: "21",
	[NameID.WwsSubfamilyName]: "22",
	[NameID.LightBackgroundPalette]: "23",
	[NameID.DarkBackgroundPalette]: "24",
	[NameID.VariationsPostscriptNamePrefix]: "25",
};

/**
 * 指定した条件に一致する名前レコードを取得
 * 
 * @param name nameテーブル
 * @param nameID 名前ID
 * @param platformID プラットフォームID (省略可)
 * @param languageID 言語ID (省略可)
 * @param encodingID エンコーディングID (省略可)
 */
export function getNameRecord(
	name: NameTable,
	nameID: number,
	platformID?: number,
	languageID?: number,
	encodingID?: number
) {
	// 完全一致で検索
	if (platformID !== undefined && languageID !== undefined && encodingID !== undefined) {
		return name.nameRecords.find(record =>
			record.nameID === nameID &&
			record.platformID === platformID &&
			record.languageID === languageID &&
			record.encodingID === encodingID
		);
	}

	// プラットフォームIDと名前IDで検索
	if (platformID !== undefined) {
		return name.nameRecords.find(record =>
			record.nameID === nameID &&
			record.platformID === platformID
		);
	}

	// 名前IDのみで検索
	return name.nameRecords.find(record => record.nameID === nameID);
}

/**
 * 英語の名前レコードを優先的に取得
 * 
 * @param name nameテーブル
 * @param nameID 名前ID
 */
export function getEnglishNameRecord(name: NameTable, nameID: number) {
	// Windows英語 (米国)
	const windowsEnUS = getNameRecord(
		name,
		nameID,
		PlatformID.Windows,
		WindowsLanguageID.EnglishUnitedStates,
	);
	if (windowsEnUS) return windowsEnUS;

	// Windows英語 (英国)
	const windowsEnGB = getNameRecord(
		name,
		nameID,
		PlatformID.Windows,
		WindowsLanguageID.EnglishUnitedKingdom,
	);
	if (windowsEnGB) return windowsEnGB;

	// Macintosh英語
	const macEnglish = getNameRecord(
		name,
		nameID,
		PlatformID.Machintosh,
		MacintoshLanguageID.English
	);
	if (macEnglish) return macEnglish;

	// Unicode
	const unicode = getNameRecord(name, nameID, PlatformID.Unicode);
	if (unicode) return unicode;

	// 何らかの名前レコード
	return getNameRecord(name, nameID);
}

/**
 * フォントファミリー名を取得
 * 
 * @param name nameテーブル
 */
export function getFontFamilyName(name: NameTable) {
	// タイポグラフィックファミリー名 (nameID 16)
	const typographicFamily = getEnglishNameRecord(name, NameID.TypographicFamilyName);
	if (typographicFamily) return typographicFamily.string;

	// 通常のファミリー名 (nameID 1)
	const family = getEnglishNameRecord(name, NameID.FontFamilyName);
	if (family) return family.string;

	return '';
}

/**
 * フォントサブファミリー名を取得
 * 
 * @param name nameテーブル
 */
export function getFontSubfamilyName(name: NameTable) {
	// タイポグラフィックサブファミリー名 (nameID 17)
	const typographicSubfamily = getEnglishNameRecord(name, NameID.TypographicSubfamilyName);
	if (typographicSubfamily) return typographicSubfamily.string;

	// 通常のサブファミリー名 (nameID 2)
	const subfamily = getEnglishNameRecord(name, NameID.FontSubfamilyName);
	if (subfamily) return subfamily.string;

	return '';
}

/**
 * フルフォント名を取得
 * 
 * @param name nameテーブル
 */
export function getFullFontName(name: NameTable) {
	// フルフォント名 (nameID 4)
	const fullName = getEnglishNameRecord(name, NameID.FullFontName);
	if (fullName) return fullName.string;

	// ファミリー名 + サブファミリー名を組み合わせる
	const familyName = getFontFamilyName(name);
	const subfamilyName = getFontSubfamilyName(name);

	if (familyName && subfamilyName) {
		return `${familyName} ${subfamilyName}`;
	}

	return familyName || '';
}

/**
 * PostScript名を取得
 * 
 * @param name nameテーブル
 */
export function getPostScriptName(name: NameTable) {
	const psName = getEnglishNameRecord(name, NameID.PostscriptName);
	return psName ? psName.string : '';
}

/**
 * バージョン文字列を取得
 * 
 * @param name nameテーブル
 */
export function getVersionString(name: NameTable) {
	const version = getEnglishNameRecord(name, NameID.VersionString);
	return version ? version.string : '';
}

/**
 * 著作権表示を取得
 * 
 * @param name nameテーブル
 */
export function getCopyrightNotice(name: NameTable) {
	const copyright = getEnglishNameRecord(name, NameID.CopyrightNotice);
	return copyright ? copyright.string : '';
}

/**
 * 製造元名を取得
 * 
 * @param name nameテーブル
 */
export function getManufacturerName(name: NameTable) {
	const manufacturer = getEnglishNameRecord(name, NameID.ManufacturerName);
	return manufacturer ? manufacturer.string : '';
}

/**
 * デザイナー名を取得
 * 
 * @param name nameテーブル
 */
export function getDesignerName(name: NameTable) {
	const designer = getEnglishNameRecord(name, NameID.Designer);
	return designer ? designer.string : '';
}

/**
 * 説明を取得
 * 
 * @param name nameテーブル
 */
export function getDescription(name: NameTable) {
	const description = getEnglishNameRecord(name, NameID.Description);
	return description ? description.string : '';
}

/**
 * ライセンス説明を取得
 * 
 * @param name nameテーブル
 */
export function getLicenseDescription(name: NameTable) {
	const license = getEnglishNameRecord(name, NameID.LicenseDescription);
	return license ? license.string : '';
}

/**
 * ライセンス情報URLを取得
 * 
 * @param name nameテーブル
 */
export function getLicenseURL(name: NameTable) {
	const licenseURL = getEnglishNameRecord(name, NameID.LicenseInfoUrl);
	return licenseURL ? licenseURL.string : '';
}

/**
 * サンプルテキストを取得
 * 
 * @param name nameテーブル
 */
export function getSampleText(name: NameTable) {
	const sample = getEnglishNameRecord(name, NameID.SampleText);
	return sample ? sample.string : '';
}

/**
 * 特定の言語IDの名前を取得
 * 
 * @param name nameテーブル
 * @param nameID 名前ID
 * @param platformID プラットフォームID
 * @param languageID 言語ID
 */
export function getLocalizedName(name: NameTable, nameID: number, platformID: PlatformID, languageID: number) {
	const record = getNameRecord(name, nameID, platformID, languageID);
	return record ? record.string : '';
}

/**
 * サポートされている言語IDのリストを取得
 * 
 * @param name nameテーブル
 * @param platformID プラットフォームID (省略可)
 * @param nameID 名前ID (省略可)
 */
export function getSupportedLanguages(name: NameTable, platformID?: PlatformID, nameID?: number) {
	const languages = new Set<number>();

	name.nameRecords.forEach(record => {
		if ((platformID === undefined || record.platformID === platformID) &&
			(nameID === undefined || record.nameID === nameID)) {
			languages.add(record.languageID);
		}
	});

	return Array.from(languages);
}

/**
 * 言語IDを人間が読める形式に変換 (Windows)
 * 
 * @param languageID Windows言語ID
 */
export function getWindowsLanguageName(languageID: number) {
	const name = windowsLanguageNames[languageID];
	return name || `Unknown (0x${languageID.toString(16).toUpperCase().padStart(4, '0')})`;
}

/**
 * 言語IDを人間が読める形式に変換 (Macintosh)
 * 
 * @param languageID Macintosh言語ID
 */
export function getMacintoshLanguageName(languageID: number) {
	const name = macintoshLanguageNames[languageID];
	return name || `Unknown (${languageID})`;
}

/**
 * nameIDを人間が読める形式に変換
 * 
 * @param nameID 名前ID
 */
export function getNameIDDescription(nameID: number) {
	const description = nameIDDescriptions[nameID];
	return description || `Unknown (${nameID})`;
}

/**
 * プラットフォームIDを人間が読める形式に変換
 * 
 * @param platformID プラットフォームID
 */
export function getPlatformIDName(platformID: number) {
	const name = platformIDNames[platformID];
	return name || `Unknown (${platformID})`;
}

/**
 * フォントの基本情報を取得
 * 
 * @param name nameテーブル
 */
export function getFontBasicInfo(name: NameTable) {
	return {
		family: getFontFamilyName(name),
		subfamily: getFontSubfamilyName(name),
		fullName: getFullFontName(name),
		postscriptName: getPostScriptName(name),
		version: getVersionString(name),
		copyright: getCopyrightNotice(name),
		manufacturer: getManufacturerName(name),
		designer: getDesignerName(name)
	};
}
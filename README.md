# このプロジェクトについて

Claude向けの指示です。

OpenType、TrueTypeのフォントのパーサをTypeScriptを使用してNode.jsで動くようにするプロジェクトです。

組版機能は持たず、フォントの形式をotfccのようにJSONで使いやすい形で出力するのが目的です。
フォントの再ビルドは行わず出力のみを行います。 コメント類は全て日本語です

## 実装ルール

- 戻り値の型は全て自明であれば省略、クラスのpublic宣言も不要
- importなどでindexを省略しない
- enumはconst enumを使用する

## 構造

### テーブル

各種テーブルについては

- lib/tables/以下がパーザ
- lib/types/tables/以下が型定義
- lib/utils/tables/以下が型に対応したユーティリティ

という構造となります。

# 課題と検証

- BASEテーブル
	- 3.5 Sonnetだと出力がおかしい
- TrueTypeCollection
	- テーブルが既出のコレクション内のフォントを参照するケースがある
		- 単純な構造ではない

# 参考資料

- OpenTypeフォント仕様書
  - https://docs.microsoft.com/ja-jp/typography/opentype/spec/
- CFF
	- https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
	- https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf
	- https://learn.microsoft.com/ja-jp/typography/opentype/spec/glyphformatcomparison
- OpenType フォント・フォーマット
	- https://azelpg.gitlab.io/azsky2/note/prog/opentype/index.html

# MSの仕様に存在し未実装のタグ

- avar
- CBDT
- CBLC
- CFF
- CFF2
- COLR
- CPAL
- cvar
- cvt
- EBDT
- EBLC
- EBSC
- fpgm
- fvar
- gasp
- GDEF
- glyf
- gvar
- hdmx
- HVAR
- JSTF
- kern
- loca
- LTSH
- MATH
- MERG
- meta
- MVAR
- PCLT
- prep
- sbix
- STAT
- SVG
- VDMX
- VVAR

# テスト

```bash
npm run dev fonts/NotoSansCJKjp-Regular.otf
```

# プロンプト

CFFとCFF2のパーサを作りたいです。まだ作らなくて良いです。


https://learn.microsoft.com/en-us/typography/opentype/spec/cff

https://learn.microsoft.com/en-us/typography/opentype/spec/cff2

https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf

https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf

https://learn.microsoft.com/en-us/typography/opentype/spec/glyphformatcomparison


これらの仕様から作ることは可能ですか。日本語で回答してください。

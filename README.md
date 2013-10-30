#hoi
===========
JSを[acorn](https://github.com/marijnh/acorn "acorn")で構文解析してエラーがあれば検出します。

## インストール方法
```
npm install -g https://github.com/yukidarake/hoi/tarball/master
```

## 使い方
###1. 解析ルールを書きます。
```javascript
// $を含む変数名定義を警告する
module.exports = function(ast, context, errors, walk) {
    walk.simple(ast, {
        VariableDeclaration: function(node, scope) {
            node.declarations.forEach(function(dec) {
                if (/\$/.test(dec.id.name)) {
                    errors.push({
                        loc: dec.loc,
                        message: 'do not use "$" in a variable name.',
                    });
                }
            });
        }
    });
};
```

###2.解析ルールの書かれたJSと解析対象のJSを指定して実行します。
ディレクトリの指定も可能です。
```
hoi -r rules lib
hoi -r rules lib/**/*.js
hoi -r rule.js lib
```
## TIPS
nodeのREPLでacornのパース結果を確認しながら解析ルールをつくるのが
オススメです。
```
node
> var acorn = require('acorn');
> var ast = acorn.parse('var a = null;', { locations: true });
> console.log(JSON.stringify(ast, null, '  ');
```

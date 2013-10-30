var callbackRe = /callback|^(?:next|cb|done)/i;

module.exports = function(ast, context, errors, walk) {
    walk.simple(ast, {
        CallExpression: function(node, scope) {
            // callbackか
            if (!callbackRe.test(node.callee.name)) {
                return;
            }

            // ifブロック内ではない
            if (!scope) {
                return;
            }

            // elseあり
            if (scope.alternate) {
                return;
            }

            // if (callback) { callback(); } のパターン
            var isCallbackExistenceCheck = scope.test.type === 'Identifier' &&
                callbackRe.test(scope.test.name);

            if (isCallbackExistenceCheck) {
                return;
            }

            var returnExists = false;

            walk.simple(scope, {
                ReturnStatement: function(node, scope) {
                    returnExists = true;
                }
            });

            if (returnExists) {
                return;
            }

            errors.push({
                loc: node.loc,
                message: 'if文内でのcallbackのreturn忘れの可能性があります',
            });
        },
    }, walk.make({
        // 別のFunctionスコープに入ったらリセット
        Function: function(node, scope, c) {
            c(node.body, null, 'ScopeBody');
        },
        // Ifステートメントに入ったらそのnodeを保持
        IfStatement: function(node, scope, c) {
            c(node.test, node, "Expression");
            c(node.consequent, node, "Statement");
            if (node.alternate) c(node.alternate, node, "Statement");
        },
    }));
};

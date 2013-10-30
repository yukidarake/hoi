var callbackRe = /callback|^(?:next|cb|done)/i;

module.exports = function(ast, context, errors, walk) {
    walk.simple(ast, {
        TryStatement: function(node) {
            // finallyだけの場合
            if (!node.handler) {
                return;
            }

            var called = false;
            //try節内
            walk.simple(node.block, {
                CallExpression: function(node, scope) {
                    if (callbackRe.test(node.callee.name)) {
                        called = true;
                    }
                }
            });
            // try節内にcallbackが存在しない
            if (!called) {
                return;
            }

            // catch節内
            walk.simple(node.handler.body, {
                CallExpression: function(node, scope) {
                    if (!callbackRe.test(node.callee.name)) {
                        return;
                    }

                    errors.push({
                        loc: node.loc,
                        message: 'tryとcatch節内両方でcallbackを呼ぶのはバグの可能性が高いです',
                    });
                }
            });
        },
    });
};

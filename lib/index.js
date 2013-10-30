var acorn = require('acorn');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var walk = require('acorn/util/walk');

function formatError(e) {
    return e.filename + ':' + e.line +
        '\t' + e.message + '\t' + e.lines[e.line];
}

function formatErrors(errors, context) {
    return errors.map(function(e) {
        return formatError({
            filename: context.filename,
            lines: context.lines,
            line: e.loc.line || e.loc.start.line,
            message: e.message,
        });
    });
}

function check(rule, context) {
    try {
        var errors = [];
        var ast = acorn.parse(context.src, {
            locations: true,
        });
        rule(ast, context, errors, walk);
        return errors;
    } catch(e) {
        if (!e.loc) {
            console.error(e.stack);
            return [];
        }
        return [{
            loc: e.loc,
            message: 'SyntaxError',
        }];
    }
}

function applyTo(rules, files) {
    var errors = [];
    files.forEach(function(file) {
        var src = fs.readFileSync(file, 'utf8');
        var context= {
            filename: file,
            lines: [''].concat(src.split('\n')),
            src: src,
        };
        rules.forEach(function(rule) {
            var errs = check(rule, context);
            Array.prototype.push.apply(errors, formatErrors(errs, context));
        });
    });
    return errors;
}

function report(errors) {
    errors.forEach(function(e) {
        console.log(e);
    });
}

function run(rulePattern, targetPatterns) {
    var rules = glob.sync(rulePattern)
        .map(function(file) {
            return require(path.resolve(file));
        })
        .filter(function(rule) {
            return typeof rule === 'function';
        });
    var files = targetPatterns.reduce(function(targets, pattern) {
        var files = glob.sync(pattern);
        Array.prototype.push.apply(targets, files);
        return targets;
    }, []);
    var errors = applyTo(rules, files);
    report(errors);
}

exports.run = run;


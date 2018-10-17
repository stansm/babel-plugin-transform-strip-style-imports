const { declare } = require('@babel/helper-plugin-utils')
const path = require('path')

const styleExt = {
    '.css': true,
    '.scss': true,
    '.sass': true,
    '.pcss': true,
    '.stylus': true,
    '.styl': true,
    '.less': true,
    '.sss': true,
}

function isStyleFilename(filename) {
    if (styleExt[path.extname(filename)]) {
        return true
    }

    return false
}

module.exports = declare((api, options) => {
    api.assertVersion(7)

    const { types } = api
    const { spec } = options

    function transformRequireCall(nodePath, state) {
        if (
            !types.isIdentifier(nodePath.node.callee, { name: 'require' }) &&
            !(
                types.isMemberExpression(nodePath.node.callee) &&
                types.isIdentifier(nodePath.node.callee.object, {
                    name: 'require',
                })
            )
        ) {
            return
        }

        const moduleArg = nodePath.node.arguments[0]
        if (moduleArg && moduleArg.type === 'StringLiteral') {
            if (isStyleFilename(moduleArg.value)) {
                nodePath.remove()
            }
        }
    }

    return {
        visitor: {
            CallExpression: {
                exit(nodePath, state) {
                    return transformRequireCall(nodePath, state)
                },
            },

            ImportDeclaration(nodePath) {
                if (isStyleFilename(nodePath.node.source.value)) {
                    nodePath.remove()
                }
            },
        },
    }
})

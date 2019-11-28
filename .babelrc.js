module.exports = {
    presets: [
        ["@babel/preset-env", {
            modules: 'cjs',
            targets: {
                browsers: [
                    "> 1%",
                    "last 2 versions",
                    "not ie <= 8"]
            },

            "corejs": {
                "version": 3,
                "proposals": true,
            },
            "useBuiltIns": "usage",
        }]
    ]

}
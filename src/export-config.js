module.exports = {
    excluded: ["electron.ts"],
    included: [],
    build: {
        name: "Spotify Monkey",
        id: "aarontburn.Spotify_Monkey",
        process: "./process/main.js",
        replace: [
            {
                from: "{EXPORTED_MODULE_ID}",
                to: "%id%",
                at: ["./process/main.ts"]
            },
            {
                from: "{EXPORTED_MODULE_NAME}",
                to: "%name%",
                at: ["./process/main.ts", "./module-info.json"]
            }
        ]
    }
}
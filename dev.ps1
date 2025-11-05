wt.exe `
    --title "igf-dev" `
    -d agent pwsh -NoExit -Command "npm run dev" `; `
    split-pane -H -d igf pwsh -NoExit -Command "npm run dev"

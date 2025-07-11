#!/bin/bash

PLIST_NAME="com.wakapi-proxy.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"
SCRIPT_PATH="$HOME/Vencord/src/userplugins/vencord-wakatime/proxy.js"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wakapi-proxy</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$SCRIPT_PATH</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/tmp/wakapi-proxy.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/wakapi-proxy.error.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" 2>/dev/null
launchctl load "$PLIST_PATH"

echo "✅ WakaTime Proxy installed successfully!"

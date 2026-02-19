#!/bin/bash
# Mission Control — local server
# Serves the dashboard on port 4000
cd /root/.openclaw/workspace/mission-control
exec python3 -m http.server 4000

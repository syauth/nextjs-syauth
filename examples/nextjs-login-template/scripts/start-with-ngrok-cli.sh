#!/bin/bash

PORT="${PORT:-3002}"

ngrok http https://localhost:${PORT}

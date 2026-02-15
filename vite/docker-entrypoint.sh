#!/bin/sh
set -e

# Replace placeholders with runtime environment variables
# Only replace if the env var is set
if [ -n "$VITE_BACKEND_URL" ]; then
    find /srv/assets -name '*.js' -exec sed -i "s|__VITE_BACKEND_URL_PLACEHOLDER__|$VITE_BACKEND_URL|g" {} +
fi

if [ -n "$VITE_FRONTEND_URL" ]; then
    find /srv/assets -name '*.js' -exec sed -i "s|__VITE_FRONTEND_URL_PLACEHOLDER__|$VITE_FRONTEND_URL|g" {} +
fi

# Execute the CMD
exec "$@"

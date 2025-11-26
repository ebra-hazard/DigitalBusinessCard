# Dynamic URL Configuration Guide

Your Digital Business Cards application now supports dynamic URL configuration, allowing you to access it from different network connections without rebuilding.

## How to Change Network Connection

When you change your network connection (different WiFi, IP address, or network setup), follow these steps:

### 1. Find Your New IP Address

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for your local network IP address (typically starts with 192.168.x.x or 10.x.x.x)

**On Linux:**
```bash
hostname -I
```

### 2. Update Configuration Files

Edit these files and replace the IP addresses:

#### `.env.development`
```dotenv
# Replace with your new IP address
API_HOST=192.168.1.123
FRONTEND_HOST=192.168.1.123

# Add your new IP to CORS and allowed hosts
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000,http://192.168.1.123:3000,http://192.168.1.123:8000
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.123
```

#### `.env` (main environment file)
Same changes as `.env.development`

### 3. Update Environment Variables

The application uses these key environment variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `API_HOST` | Backend server hostname/IP | `192.168.1.123` |
| `API_PORT` | Backend server port | `8000` |
| `FRONTEND_HOST` | Frontend server hostname/IP | `192.168.1.123` |
| `FRONTEND_PORT` | Frontend server port | `3000` |
| `ENVIRONMENT` | Environment type | `development` or `production` |
| `CORS_ORIGINS` | Allowed CORS origins | Comma-separated list |
| `ALLOWED_HOSTS` | Trusted host names | Comma-separated list |

### 4. Restart Services

```bash
cd /Users/mac/New\ AI\ Projects/Digital\ Business\ Cards
docker-compose restart backend frontend
```

### 5. Verify Configuration

```bash
# Check backend environment variables
docker-compose exec -T backend python3 -c \
  "import os; print(f'API_HOST: {os.getenv(\"API_HOST\")}'); \
   print(f'FRONTEND_HOST: {os.getenv(\"FRONTEND_HOST\")}')"
```

### 6. Regenerate Test Data (Optional)

If you want to create new test cards with the updated URLs:

```bash
python3 seed_test_data.py
```

## Accessing from Different Devices

### From Your Computer
```
http://localhost:3000
```

### From Another Device on Same Network
```
http://<your-machine-ip>:3000
```
Example: `http://192.168.1.123:3000`

### From Your Phone
1. Make sure your phone is on the same WiFi network
2. Visit: `http://<your-machine-ip>:3000`
3. Scan QR codes - they now automatically use your current IP address

## QR Code Behavior

- QR codes embed the API endpoint URL using your configured `API_HOST` and `API_PORT`
- When you change networks and update the configuration, new QR codes will automatically use the new IP
- Old QR codes will contain old IP addresses and won't work until you regenerate cards

## Example: Switching from WiFi to Mobile Hotspot

1. **Old WiFi IP**: `192.168.1.123`
2. **New Hotspot IP**: `192.168.100.50`

**Steps:**
```bash
# 1. Update .env.development
API_HOST=192.168.100.50
FRONTEND_HOST=192.168.100.50

# 2. Restart services
docker-compose restart backend frontend

# 3. Generate new cards with new IP
python3 seed_test_data.py

# 4. Access from new network
http://192.168.100.50:3000
```

## Troubleshooting

### QR codes still show old IP
- Restart the backend: `docker-compose restart backend`
- Regenerate cards: `python3 seed_test_data.py`
- Clear browser cache: `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)

### Can't access from phone
- Verify phone is on same network as computer
- Check firewall isn't blocking port 3000 and 8000
- Verify IP address is correct: `ifconfig` on Mac or `hostname -I` on Linux
- Try `ping <your-ip>` from phone to verify connectivity

### Backend returns 404
- Check `ALLOWED_HOSTS` includes your current IP
- Verify `API_HOST` and `CORS_ORIGINS` are updated correctly
- Restart backend after making changes

## For Production Deployment

When deploying to a server:

1. Set `ENVIRONMENT=production`
2. Use your domain name for `API_HOST` and `FRONTEND_HOST`
3. Configure HTTPS (port 443)
4. Update `CORS_ORIGINS` with your domain

Example:
```dotenv
ENVIRONMENT=production
API_HOST=yourdomain.com
API_PORT=443
FRONTEND_HOST=yourdomain.com
FRONTEND_PORT=443
CORS_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com
```

The application will automatically use HTTPS URLs in QR codes when `ENVIRONMENT=production`.

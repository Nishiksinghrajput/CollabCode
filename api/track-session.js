// Comprehensive session tracking API
// Tracks IP, location, device info, VPN detection, and multiple login attempts

import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';
import crypto from 'crypto';

// VPN/Proxy detection based on common patterns
const VPN_INDICATORS = {
  // Known VPN/Proxy ASN ranges
  vpnAsns: ['AS13335', 'AS9009', 'AS20473', 'AS16509'], // Cloudflare, AWS, etc.
  
  // Suspicious headers that indicate proxy usage
  proxyHeaders: [
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'forwarded',
    'via',
    'x-real-ip',
    'x-originating-ip',
    'x-remote-ip',
    'client-ip',
    'x-client-ip',
    'x-cluster-client-ip',
    'true-client-ip',
    'x-true-client-ip'
  ],
  
  // Known data center IP ranges (simplified)
  datacenterRanges: [
    '104.16.', '104.17.', '104.18.', '104.19.', // Cloudflare
    '34.', '35.', '52.', '54.', // AWS
    '13.', '40.', '20.', '51.', // Azure
    '104.196.', '104.199.', '35.185.', // Google Cloud
  ]
};

// Hash IP for privacy
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').substring(0, 16);
}

// Detect if IP is likely a VPN/Proxy
function detectVPN(ip, headers, geo) {
  const indicators = [];
  
  // Check if IP is from a data center
  for (const range of VPN_INDICATORS.datacenterRanges) {
    if (ip.startsWith(range)) {
      indicators.push('datacenter_ip');
      break;
    }
  }
  
  // Check for multiple proxy headers
  const proxyHeaderCount = VPN_INDICATORS.proxyHeaders.filter(
    header => headers[header] && headers[header] !== ip
  ).length;
  
  if (proxyHeaderCount > 2) {
    indicators.push('multiple_proxy_headers');
  }
  
  // Check if geo location is suspicious
  if (geo) {
    // Check for hosting companies
    if (geo.org && (
      geo.org.toLowerCase().includes('hosting') ||
      geo.org.toLowerCase().includes('cloud') ||
      geo.org.toLowerCase().includes('vpn') ||
      geo.org.toLowerCase().includes('proxy') ||
      geo.org.toLowerCase().includes('datacenter')
    )) {
      indicators.push('hosting_provider');
    }
    
    // Check timezone mismatch (if we have user's browser timezone)
    // This would need to be passed from client
  }
  
  // Check for anonymous proxy indicators
  if (headers['x-anonymized'] || headers['x-tor']) {
    indicators.push('anonymous_proxy');
  }
  
  return {
    isVPN: indicators.length > 0,
    confidence: Math.min(indicators.length * 33, 99), // 33% per indicator, max 99%
    indicators: indicators
  };
}

// Get all IPs from headers (handling proxies)
function getAllIPs(req) {
  const ips = new Set();
  
  // Primary IP
  const primaryIP = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                    req.headers['x-real-ip'] ||
                    req.connection?.remoteAddress ||
                    req.socket?.remoteAddress ||
                    '0.0.0.0';
  
  ips.add(primaryIP);
  
  // Check all forwarded IPs
  if (req.headers['x-forwarded-for']) {
    req.headers['x-forwarded-for'].split(',').forEach(ip => {
      ips.add(ip.trim());
    });
  }
  
  // Additional IP headers
  ['x-real-ip', 'x-originating-ip', 'client-ip', 'true-client-ip'].forEach(header => {
    if (req.headers[header]) {
      ips.add(req.headers[header]);
    }
  });
  
  return Array.from(ips).filter(ip => ip && ip !== '::1' && ip !== '127.0.0.1');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { sessionCode, userId, userName, eventType, metadata = {} } = req.body;
    
    if (!sessionCode || !userId || !eventType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Skip tracking for interviewers entirely
    if (metadata.userType === 'interviewer') {
      return res.status(200).json({
        success: true,
        skipped: true,
        message: 'Tracking skipped for interviewer'
      });
    }
    
    // Get all IPs
    const allIPs = getAllIPs(req);
    const primaryIP = allIPs[0];
    
    // Get user agent info
    const ua = new UAParser(req.headers['user-agent']);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();
    
    // Get geolocation (works offline, no API needed!)
    const geo = geoip.lookup(primaryIP);
    
    // Detect VPN/Proxy
    const vpnDetection = detectVPN(primaryIP, req.headers, geo);
    
    // Create tracking record
    const trackingData = {
      // Session info
      sessionCode,
      userId,
      userName: userName || 'Unknown',
      eventType, // 'join', 'leave', 'end', 'login_attempt', etc.
      
      // IP info
      ip: hashIP(primaryIP), // Hashed for privacy
      ipCount: allIPs.length,
      allIPs: allIPs.map(ip => hashIP(ip)), // All IPs hashed
      
      // Location (from geoip-lite - works offline!)
      location: geo ? {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        coordinates: geo.ll, // [latitude, longitude]
        organization: geo.org,
        asn: geo.asn
      } : null,
      
      // Device info
      device: {
        browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
        os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
        device: device.type || 'desktop',
        deviceVendor: device.vendor || null,
        deviceModel: device.model || null
      },
      
      // VPN/Proxy detection
      vpn: vpnDetection,
      
      // Headers for debugging (in production, you might want to remove this)
      headers: process.env.NODE_ENV === 'development' ? {
        'user-agent': req.headers['user-agent'],
        'accept-language': req.headers['accept-language'],
        'referer': req.headers['referer']
      } : undefined,
      
      // Timestamps
      timestamp: Date.now(),
      timestampISO: new Date().toISOString(),
      
      // Additional metadata from client
      metadata: {
        ...metadata,
        screenResolution: metadata.screenResolution, // Pass from client
        timezone: metadata.timezone, // Pass from client
        language: req.headers['accept-language']?.split(',')[0] || 'en'
      }
    };
    
    // Check for suspicious activity
    const securityFlags = [];
    
    // Multiple IPs (proxy chain)
    if (allIPs.length > 2) {
      securityFlags.push({
        type: 'multiple_ips',
        severity: 'medium',
        detail: `${allIPs.length} different IPs detected`
      });
    }
    
    // VPN detected
    if (vpnDetection.isVPN) {
      securityFlags.push({
        type: 'vpn_detected',
        severity: vpnDetection.confidence > 66 ? 'high' : 'medium',
        detail: `VPN/Proxy detected with ${vpnDetection.confidence}% confidence`,
        indicators: vpnDetection.indicators
      });
    }
    
    // Geo anomaly (if timezone doesn't match)
    if (metadata.timezone && geo?.timezone) {
      const tzOffset = new Date().getTimezoneOffset();
      const geoOffset = parseInt(geo.timezone);
      if (Math.abs(tzOffset + geoOffset * 60) > 120) { // More than 2 hours difference
        securityFlags.push({
          type: 'timezone_mismatch',
          severity: 'low',
          detail: `Browser timezone doesn't match IP location`
        });
      }
    }
    
    trackingData.securityFlags = securityFlags;
    
    // Store in Firebase
    // Store tracking data in Firebase
    const trackingRef = `sessions/${sessionCode}/tracking/${Date.now()}_${userId}`;
    // This would require Firebase Admin SDK setup on Vercel
    // For now, we'll send it back to the client to store
    trackingData.firebasePath = trackingRef;
    
    // Return response
    res.status(200).json({
      success: true,
      tracked: {
        sessionCode,
        userId,
        eventType,
        ip: trackingData.ip,
        location: trackingData.location?.city + ', ' + trackingData.location?.country,
        device: trackingData.device.browser + ' on ' + trackingData.device.os,
        vpnDetected: trackingData.vpn.isVPN,
        securityFlags: trackingData.securityFlags.length,
        timestamp: trackingData.timestamp
      },
      // Include full data in dev mode
      ...(process.env.NODE_ENV === 'development' && { fullData: trackingData })
    });
    
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track session',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
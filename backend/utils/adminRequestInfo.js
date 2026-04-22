exports.getRequestIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || null;
};

exports.getBrowserDetail = (req) => {
    return req.headers['user-agent'] || null;
};

exports.getDeviceType = (req) => {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    if (/mobile|android|iphone|ipod/i.test(userAgent)) {
        return 'Mobile';
    }

    if (/ipad|tablet/i.test(userAgent)) {
        return 'Tablet';
    }

    if (/windows|macintosh|linux/i.test(userAgent)) {
        return 'Desktop';
    }

    return 'Unknown';
};

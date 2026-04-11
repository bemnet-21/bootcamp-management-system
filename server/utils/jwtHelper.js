export const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

export const generateRefreshToken = (user) => {
    const payload = {
        id: user._id,
    }

    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

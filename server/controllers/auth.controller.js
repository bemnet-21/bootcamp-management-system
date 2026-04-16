import UserModel from "../models/User.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtHelper.js";
import jwt from "jsonwebtoken";
import transporter from "../utils/mailer.js";

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await UserModel.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (user.status === "Suspended") {
            return res.status(403).json({ 
                message: 'Your account is suspended. Please contact administration.' 
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            accessToken,   
            refreshToken  
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await UserModel.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken)  return res.status(401).json({ message: 'Invalid refresh token' });

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();
        res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
}

export const resetRequest = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = jwt.sign(
            { id: user._id }, 
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h3>Hello ${user.firstName},</h3>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ message: 'Internal server error' });

    }
}


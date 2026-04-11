import UserModel from "../models/User.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

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
        console.error("LOGIN_ERROR:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


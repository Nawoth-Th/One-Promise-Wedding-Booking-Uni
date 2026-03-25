import { Request, Response } from 'express';
import generateToken from '../../utils/generateToken';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Hardcoded credentials for the assignment requirement
    if (username === 'admin' && password === 'admin') {
        generateToken(res, 'admin_user_id');
        res.json({
            _id: 'admin_user_id',
            username: 'admin',
            isAdmin: true,
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

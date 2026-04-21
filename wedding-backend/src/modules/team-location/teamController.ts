/**
 * @file teamController.ts
 * @description Controller for managing the professional team (Photographers, Cinematographers, etc.).
 * Handles registration, profile updates, and active status toggling for staff.
 */

import { Request, Response } from 'express';
import { TeamMember } from './TeamMember';

/**
 * @desc    Fetch all Professional Team Members.
 * @route   GET /api/team
 * @access  Public/Admin
 */
export const getTeamMembers = async (req: Request, res: Response) => {
    try {
        const members = await TeamMember.find({});
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Register a new Team Member with validated data.
 * @route   POST /api/team
 * @access  Private/Admin
 */
export const createTeamMember = async (req: Request, res: Response) => {
    try {
        // Logic: Consistent phone sanitization at the controller level (Layered Security)
        if (req.body.phone) {
            req.body.phone = req.body.phone.replace(/\D/g, '');
        }
        const member = new TeamMember(req.body);
        const createdMember = await member.save();
        res.status(201).json(createdMember);
    } catch (error) {
        res.status(400).json({ message: 'Invalid team member data' });
    }
};

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Private
export const updateTeamMember = async (req: Request, res: Response) => {
    try {
        const member = await TeamMember.findById(req.params.id);

        if (member) {
            member.name = req.body.name || member.name;
            member.role = req.body.role || member.role;
            member.email = req.body.email || member.email;
            if (req.body.phone) {
                member.phone = req.body.phone.replace(/\D/g, '');
            }
            if (req.body.active !== undefined) {
                member.active = req.body.active;
            }

            const updatedMember = await member.save();
            res.json(updatedMember);
        } else {
            res.status(404).json({ message: 'Team member not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Private
export const deleteTeamMember = async (req: Request, res: Response) => {
    try {
        const member = await TeamMember.findByIdAndDelete(req.params.id);

        if (member) {
            res.json({ message: 'Team member removed' });
        } else {
            res.status(404).json({ message: 'Team member not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

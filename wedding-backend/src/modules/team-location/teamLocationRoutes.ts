import express from 'express';
import { getAvailability, updateAssignments } from './assignmentController';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from './teamController';
import { getLocations, addLocation, updateLocation, deleteLocation } from './locationController';
import { validateRequest } from '../../middleware/validateRequest';
import { teamMemberSchema, locationSchema, updateTeamMemberSchema, updateLocationSchema } from './teamLocationValidation';

const router = express.Router();

// Team Management
router.get('/team', getTeamMembers);
router.post('/team', validateRequest(teamMemberSchema), createTeamMember);
router.route('/team/:id')
    .put(validateRequest(updateTeamMemberSchema), updateTeamMember)
    .delete(deleteTeamMember);

// Location Management
router.get('/locations', getLocations);
router.post('/locations', validateRequest(locationSchema), addLocation);
router.route('/locations/:id')
    .put(validateRequest(updateLocationSchema), updateLocation)
    .delete(deleteLocation);

// Assignment & Availability
router.get('/availability', getAvailability);
router.put('/assign/:id', updateAssignments);

export default router;

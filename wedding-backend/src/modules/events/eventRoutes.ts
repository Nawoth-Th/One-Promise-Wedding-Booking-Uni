import express from 'express';
import { updateEventDetails, syncCalendar } from './eventController';

const router = express.Router();

router.put('/:id', updateEventDetails);
router.post('/:id/sync', syncCalendar);

export default router;

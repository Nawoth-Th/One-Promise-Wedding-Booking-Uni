import express from 'express';
import { updateEventDetails, syncCalendar, getEvents, createManualEvent, deleteManualEvent } from './eventController';

const router = express.Router();

router.get('/', getEvents);
router.post('/manual', createManualEvent);
router.delete('/manual/:id', deleteManualEvent);
router.put('/:id', updateEventDetails);
router.post('/:id/sync', syncCalendar);

export default router;

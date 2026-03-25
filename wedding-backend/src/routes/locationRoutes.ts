import { Router } from 'express';
import * as locationController from '../controllers/locationController';

const router = Router();

router.get('/', locationController.getLocations);
router.post('/', locationController.addLocation);
router.delete('/:id', locationController.deleteLocation);

export default router;

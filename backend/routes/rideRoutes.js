import express from 'express';
import { createRide, getRides, sendPairRequest, updatePairRequest } from '../controllers/rideController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createRide);
router.get('/', auth, getRides);
router.post('/:id/pair-request', auth, sendPairRequest);
router.put('/:id/pair-request', auth, updatePairRequest);

export default router;
import express from 'express';
import authRoutes from '../api/auth';
import contactsRoutes from '../api/contacts';
import statusRoutes from '../api/status';

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/contacts', contactsRoutes);
router.use('/api/status', statusRoutes);

export default router;

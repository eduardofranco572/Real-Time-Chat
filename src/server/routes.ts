import express from 'express';
import authRoutes from '../api/auth';
import contactsRoutes from '../api/contacts';
import statusRoutes from '../api/status';
import chatRoutes from '../api/chat';
import groupRoutes from '../api/group';

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/contacts', contactsRoutes);
router.use('/api/status', statusRoutes);
router.use('/api/chat', chatRoutes);
router.use('/api/group', groupRoutes);

export default router;

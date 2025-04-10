import express from 'express';
import { startAutomation } from '../controllers/accountController.js';

const router = express.Router();

// Route pour démarrer l’automatisation Gmail
router.post('/start-gmail', startAutomation);

export default router;
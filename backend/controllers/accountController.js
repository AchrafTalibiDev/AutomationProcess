import { getAccounts } from '../models/Account.js';
import { automateGmailKeyExtraction } from '../services/automationService.js';

export const startAutomation = async (req, res) => {
    try {
        const accounts = await getAccounts();

        if (!accounts || accounts.length === 0) {
            return res.status(404).json({ message: 'Aucun compte trouvé dans la base de données.' });
        }

        // Appel du script pour automatiser Gmail et récupérer la clé
        await automateGmailKeyExtraction(accounts);

        res.status(200).json({ message: 'Automatisation Gmail terminée avec succès.' });
    } catch (error) {
        console.error('Erreur dans startAutomation :', error.message);
        res.status(500).json({ message: 'Erreur lors de l’automatisation Gmail.' });
    }
};
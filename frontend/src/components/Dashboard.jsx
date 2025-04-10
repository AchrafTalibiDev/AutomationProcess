import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const accRes = await axios.get('http://localhost:5000/api/accounts');
        const logRes = await axios.get('http://localhost:5000/api/accounts/logs');
        setAccounts(accRes.data);
        setLogs(logRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGmailAutomation = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/accounts/start-gmail');
            await fetchData(); // actualiser les données après l'automatisation
        } catch (err) {
            console.error('Erreur lancement automatisation Gmail:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Dashboard Automatisation Gmail</h1>

            <div className="flex justify-center mb-6">
                <button
                    onClick={handleGmailAutomation}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300"
                    disabled={loading}
                >
                    {loading ? 'Lancement en cours...' : 'Lancer automatisation Gmail'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Comptes</h2>
                    <ul>
                        {accounts.map((acc) => (
                            <li key={acc.id} className="text-gray-600">{acc.username}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Logs</h2>
                    <ul>
                        {logs.map((log) => (
                            <li key={log.id} className="text-gray-600">
                                {log.timestamp}: {log.status} - {log.message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

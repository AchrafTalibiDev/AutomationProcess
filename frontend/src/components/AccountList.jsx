
import React from 'react';

const AccountList = ({ logs }) => {
    return (
        <div className="mt-4">
            <table className="table-auto w-full border">
                <thead>
                <tr>
                    <th className="border px-4 py-2">ID compte</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Message</th>
                    <th className="border px-4 py-2">Date</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((log) => (
                    <tr key={log.id}>
                        <td className="border px-4 py-2">{log.account_id}</td>
                        <td className="border px-4 py-2">{log.status}</td>
                        <td className="border px-4 py-2">{log.message}</td>
                        <td className="border px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AccountList;




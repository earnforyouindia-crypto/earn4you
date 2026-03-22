"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import { User, Shield, Ban, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                if (response.data.success) {
                    setUsers(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);


    const columns = [
        {
            header: 'User',
            accessor: 'username',
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <User size={16} />
                    </div>
                    <div>
                        <div className="font-medium text-white">{row.name || 'No Name'}</div>
                        <div className="text-xs text-slate-400">@{row.username}</div>
                    </div>
                </div>
            )
        },

        { header: 'Phone No', accessor: 'phone' },
        { header: 'Joined', accessor: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (row: any) => (
                <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${row.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {row.isActive && row.plan?.name && (
                        <span className="text-[10px] text-emerald-400/80 font-medium tracking-wide uppercase">
                            Plan: {row.plan.name}
                        </span>
                    )}
                </div>
            )
        }
    ];

    const downloadReport = () => {
        const activeUsers = users.filter(u => u.isActive);
        if (activeUsers.length === 0) {
            alert('No active users to report.');
            return;
        }

        const headers = ['Username', 'Name', 'Joined Date'];
        const csvRows = [headers.join(',')];

        for (const user of activeUsers) {
            const row = [
                user.username || 'N/A',
                user.name || 'N/A',
                new Date(user.createdAt).toLocaleDateString()
            ];
            csvRows.push(row.join(','));
        }

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `active_users_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="text-white p-6">Loading users...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <button
                    onClick={downloadReport}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    Download Active Users Report
                </button>
            </div>

            <DataTable
                title="Registered Users"
                columns={columns}
                data={users}
                searchPlaceholder="Search users..."
            />
        </div>
    );
};

export default AdminUsers;

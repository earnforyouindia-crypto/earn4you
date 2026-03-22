import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface Column {
    header: string;
    accessor: string;
    render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    title: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, title, searchPlaceholder = "Search...", emptyMessage = "No results found" }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-white">{title}</h3>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-slate-600 transition-colors w-64"
                        />
                    </div>
                    <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left bg-slate-900 border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800">
                            {columns.map((col, index) => (
                                <th key={index} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-800/50 transition-colors">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 text-slate-300 whitespace-nowrap">
                                            {col.render ? col.render(row) : (() => {
                                                const value = col.accessor.split('.').reduce((obj, key) => obj && obj[key], row);
                                                return value || 'N/A';
                                            })()}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;

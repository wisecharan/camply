import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/admin/reports');
            setReports(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportCSV = () => {
        if (!reports) return;

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Metric,Value\n"
            + `Total Students,${reports.total_students}\n`
            + `Approved Students,${reports.approved_students}\n`
            + `Total Companies,${reports.total_companies}\n`
            + `Approved Companies,${reports.approved_companies}\n`
            + `Placement Drives,${reports.total_drives}\n`
            + `Total Placements,${reports.total_placements}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "placement_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!reports) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>
    );

    const reportItems = [
        { label: "Total Registered Students", value: reports.total_students },
        { label: "Approved Students", value: reports.approved_students },
        { label: "Total Registered Companies", value: reports.total_companies },
        { label: "Approved Companies", value: reports.approved_companies },
        { label: "Total Placement Drives", value: reports.total_drives },
        { label: "Total Placed Students", value: reports.total_placements },
    ];

    return (
        <div className="font-sans max-w-4xl space-y-6">
            
            <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="pl-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">System Report Data</h2>
                </div>
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-black transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
                    Summary Statistics
                </h3>
                
                <div className="flex flex-col gap-2">
                    {reportItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-4 px-4 hover:bg-[#f9fafb] rounded-2xl transition-colors">
                            <span className="text-[15px] text-gray-600 font-medium">{item.label}</span>
                            <span className="text-lg font-bold text-gray-900 bg-gray-50 px-4 py-1 rounded-full border border-gray-100">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
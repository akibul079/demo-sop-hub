import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { User, UserRole } from '../../types';
import { Upload, Lock, Save, Globe, Moon, Sun, Monitor } from 'lucide-react';

export const ProfileSettings = ({ user }: { user: User }) => {
    const { updateProfile } = useAuth();
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
    const [department, setDepartment] = useState(user.department || '');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
    const [language, setLanguage] = useState('en');

    const handleSave = () => {
        updateProfile({ firstName, lastName, jobTitle, department, name: `${firstName} ${lastName}` });
        // In a real app, theme/language would be saved to user preferences or local storage
        alert('Profile settings updated successfully!');
    };

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 1.1 Profile & Identity */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Profile & Identity</h3>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden relative group cursor-pointer">
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Upload className="text-white" size={24} />
                            </div>
                        </div>
                        <button className="text-sm text-monday-primary font-medium hover:underline">Change Avatar</button>
                        <p className="text-xs text-gray-400">JPG/PNG max 2MB</p>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Display Name</label>
                            <input type="text" value={`${firstName} ${lastName}`} disabled className="w-full px-3 py-2 border border-monday-border bg-gray-50 rounded-md text-gray-500" />
                            <p className="text-xs text-gray-400">Used for mentions and comments.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <input type="email" value={user.email} disabled className="w-full px-3 py-2 border border-monday-border bg-gray-50 rounded-md text-gray-500" />
                                <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Job Title</label>
                            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option value="">Select Department...</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sales">Sales</option>
                                <option value="Support">Customer Support</option>
                                <option value="HR">Human Resources</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1.2 Interface Preferences */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Interface Preferences</h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Theme */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Theme</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${theme === 'light' ? 'border-monday-primary bg-blue-50 text-monday-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <Sun size={16} /> Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'border-monday-primary bg-blue-50 text-monday-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${theme === 'system' ? 'border-monday-primary bg-blue-50 text-monday-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <Monitor size={16} /> System
                                </button>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Language</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                            </div>
                        </div>

                        {/* Start Page */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Start Page</label>
                            <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option value="dashboard">Dashboard</option>
                                <option value="library">Library (All SOPs)</option>
                                <option value="my-tasks">My Tasks / Approvals</option>
                            </select>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sidebar Behavior</label>
                            <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option value="expanded">Always Expanded</option>
                                <option value="collapsed">Collapsed (Icons Only)</option>
                                <option value="auto">Auto-hide on Mobile</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1.3 Regional Settings */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Time Zone</label>
                        <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                            <option value="EST">EST (Eastern Standard Time)</option>
                            <option value="PST">PST (Pacific Standard Time)</option>
                            <option value="IST">IST (Indian Standard Time)</option>
                        </select>
                        <p className="text-xs text-gray-400">Crucial for execution logs.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Date Format</label>
                        <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (EU/Asia)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Time Format</label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="timefmt" defaultChecked /> 12-hour (1:00 PM)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="timefmt" /> 24-hour (13:00)
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">First Day of Week</label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="weekday" defaultChecked /> Monday
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="weekday" /> Sunday
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    className="px-8 py-2.5 bg-monday-primary text-white rounded-lg hover:bg-monday-primaryHover transition-colors font-medium shadow-md flex items-center gap-2"
                    onClick={handleSave}
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

        </div>
    );
};

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import banner from '../assets/profile-banner.png';
const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setProfile(res.data.user);
            } catch (err) {
                console.log(err);
            }
        }
        fetchProfile();
    }, []);

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="relative h-48 bg-gradient-to-r from-mint-500 to-mint-600 rounded-2xl overflow-hidden">
                {/* Banner */}
                <img src={banner} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative px-6 -mt-16">
                <div className="card max-w-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400">
                                {profile.username[0]}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h2>
                            <p className="text-gray-500">{profile.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-mint/10 text-mint-600 rounded-full text-sm font-medium capitalize">
                                {profile.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="card">
                    <h3 className="font-bold mb-4">Account Information</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                            <span>Joined</span>
                            <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                            <span>Job Title</span>
                            <span>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

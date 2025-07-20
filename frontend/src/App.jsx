// App.jsx
import React from 'react';
import HotelDetails from './components/HotelDetails';
import { HomeIcon } from '@heroicons/react/24/outline';

const App = () => {
    const handleBack = () => {
        console.log('Back button clicked - you can implement navigation here');
        // You can add navigation logic here later if needed
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Optional Header - you can remove this if you don't want it */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <span className="inline-flex items-center text-blue-600">
                        <HomeIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="ml-2 text-xl font-semibold text-gray-800">
                        Hotel Reservation
                    </span>
                </div>
            </header>

            {/* Main Content - Just HotelDetails */}
            <main>
                <HotelDetails
                    hotelId={100003163}
                    onBack={handleBack}
                    searchInfo={{
                        checkIn: new Date(),
                        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                        adults: 2,
                        children: 0,
                        rooms: 1
                    }}
                />
            </main>
        </div>
    );
};

export default App;
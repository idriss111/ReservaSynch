    // components/HotelSearch.jsx
    import React, { useState, useEffect } from 'react';
    import { Calendar as CalendarIcon, MapPin, Users, Plus, Minus, Search, ChevronDown } from 'lucide-react';
    import { DateRangePicker } from 'react-date-range';
    import { addDays } from 'date-fns';
    import {HomeIcon} from "@heroicons/react/24/outline";

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const HotelSearch = ({ onSearch }) => {
        const [searchData, setSearchData] = useState({
            destination: '',
            destinationCode: '',
            checkIn: '',
            checkOut: '',
            rooms: 1,
            adults: 2,
            children: 0
        });

        const [state, setState] = useState([
            {
                startDate: new Date(),
                endDate: addDays(new Date(), 7),
                key: 'selection'
            }
        ]);

        const [destinations, setDestinations] = useState([]);
        const [showDestinations, setShowDestinations] = useState(false);
        const [loadingDestinations, setLoadingDestinations] = useState(false);
        const [showDatePicker, setShowDatePicker] = useState(false);

        // Update searchData when date range changes
        useEffect(() => {
            if (state[0].startDate && state[0].endDate) {
                setSearchData(prev => ({
                    ...prev,
                    checkIn: formatDate(state[0].startDate),
                    checkOut: formatDate(state[0].endDate)
                }));
            }
        }, [state]);

        // Fetch destinations on component mount
        useEffect(() => {
            fetchDestinations();
        }, []);

        const fetchDestinations = async () => {
            setLoadingDestinations(true);
            try {
                const response = await fetch('http://localhost:8080/api/destinations');
                const data = await response.json();
                if (data.success && data.destinations) {
                    setDestinations(data.destinations);
                }
            } catch (error) {
                console.error('Error fetching destinations:', error);
            } finally {
                setLoadingDestinations(false);
            }
        };

        const handleDestinationSelect = async (destination) => {
            setSearchData({
                ...searchData,
                destination: destination.name,
                destinationCode: destination.code
            });
            setShowDestinations(false);
        };

        const handleSearch = async () => {
            if (!searchData.destinationCode) {
                alert('Please select a destination');
                return;
            }
            if (!searchData.checkIn || !searchData.checkOut) {
                alert('Please select check-in and check-out dates');
                return;
            }

            const payload = {
                stay: {
                    checkIn: searchData.checkIn,
                    checkOut: searchData.checkOut
                },
                occupancies: [{
                    rooms: searchData.rooms,
                    adults: searchData.adults,
                    children: searchData.children
                }],
                destination: {
                    code: searchData.destinationCode
                }
            };

            onSearch(payload, searchData);
        };

        const filteredDestinations = destinations.filter(dest =>
            dest.name.toLowerCase().includes(searchData.destination.toLowerCase()) ||
            dest.code.toLowerCase().includes(searchData.destination.toLowerCase())
        );

        return (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
                <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                    {/* Hotel icon */}
                    <span className="inline-flex items-center text-blue-600">
                  <HomeIcon className="h-6 w-6" aria-hidden="true" />
                 </span>

                    {/* Title */}
                    <span className="ml-2 text-3xl font-bold text-gray-800">
                      Room Finder
                  </span>
                </div>

                <div className="space-y-6">
                    {/* First Row: Destination and Date Picker */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Destination Search */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="inline w-4 h-4 mr-1 text-blue-600" />
                                Destination
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchData.destination}
                                    onChange={(e) => {
                                        setSearchData({ ...searchData, destination: e.target.value });
                                        setShowDestinations(true);
                                    }}
                                    onFocus={() => setShowDestinations(true)}
                                    placeholder="Where are you going?"
                                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                            </div>

                            {showDestinations && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                                    {loadingDestinations ? (
                                        <div className="p-4 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </div>
                                    ) : filteredDestinations.length > 0 ? (
                                        filteredDestinations.map(dest => (
                                            <div
                                                key={dest.code}
                                                onClick={() => handleDestinationSelect(dest)}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                            >
                                                <div className="font-semibold">{dest.name}</div>
                                                <div className="text-sm text-gray-500">{dest.code} • {dest.countryCode}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">No destinations found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Guests */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Users className="inline w-4 h-4 mr-1 text-blue-600" />
                                Guests & Rooms
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {/* Rooms */}
                                <div className="border-2 border-gray-200 rounded-xl px-3 py-2">
                                    <span className="text-xs text-gray-500 block">Rooms</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <button
                                            onClick={() => setSearchData({ ...searchData, rooms: Math.max(1, searchData.rooms - 1) })}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-semibold">{searchData.rooms}</span>
                                        <button
                                            onClick={() => setSearchData({ ...searchData, rooms: searchData.rooms + 1 })}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Adults */}
                                <div className="border-2 border-gray-200 rounded-xl px-3 py-2">
                                    <span className="text-xs text-gray-500 block">Adults</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <button
                                            onClick={() => setSearchData({ ...searchData, adults: Math.max(1, searchData.adults - 1) })}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-semibold">{searchData.adults}</span>
                                        <button
                                            onClick={() => setSearchData({ ...searchData, adults: searchData.adults + 1 })}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Children */}
                                <div className="border-2 border-gray-200 rounded-xl px-3 py-2">
                                    <span className="text-xs text-gray-500 block">Children</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <button
                                            onClick={() => setSearchData({ ...searchData, children: Math.max(0, searchData.children - 1) })}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-semibold">{searchData.children}</span>
                                        <button
                                            onClick={() => setSearchData({ ...searchData, children: searchData.children + 1 })}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        {/* Date Range Picker */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <CalendarIcon className="inline w-4 h-4 mr-1 text-blue-600" />
                                Select Your Travel Dates
                            </label>
                            <div className="border-2 border-gray-200 rounded-xl p-4 flex justify-center">
                                <DateRangePicker
                                    onChange={item => setState([item.selection])}
                                    showSelectionPreview={false}
                                    moveRangeOnFirstSelection={false}
                                    months={2}
                                    rangeColors={['#03c09b']}
                                    ranges={state}
                                    direction="horizontal"
                                    preventSnapRefocus={true}
                                    calendarFocus="backwards"
                                    minDate={new Date()}
                                />
                            </div>
                        </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={!searchData.destinationCode}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    >
                        <Search className="w-5 h-5" />
                        Search Hotels
                    </button>
                </div>

                {/* Click outside handler for destination dropdown */}
                {showDestinations && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowDestinations(false)} />
                )}
            </div>
        );
    };

    export default HotelSearch;
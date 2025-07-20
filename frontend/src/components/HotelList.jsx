// components/HotelList.jsx
import React from 'react';
import { MapPin, Star, Wifi, Coffee, Car, Users, Bed, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

// Dynamic destination photos mapping
const getDestinationPhoto = (destination, hotelLocation) => {
    const destinationPhotos = {
        // Spain - Balearic Islands
        'PMI': 'https://images.unsplash.com/photo-1562979314-bee7453a5a37?w=800&h=600&fit=crop&crop=center', // Palma Cathedral
        'PALMA': 'https://images.unsplash.com/photo-1562979314-bee7453a5a37?w=800&h=600&fit=crop&crop=center',
        'MALLORCA': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop&crop=center',
        'IBIZA': 'https://images.unsplash.com/photo-1539650116574-75c0c6d76647?w=800&h=600&fit=crop&crop=center',
        'MENORCA': 'https://images.unsplash.com/photo-1626480106933-d98c73fe977b?w=800&h=600&fit=crop&crop=center',

        // Spain - Mainland
        'BARCELONA': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop&crop=center', // Sagrada Familia
        'MADRID': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&crop=center',
        'SEVILLE': 'https://images.unsplash.com/photo-1539650116574-75c0c6d76647?w=800&h=600&fit=crop&crop=center',
        'VALENCIA': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
        'BILBAO': 'https://images.unsplash.com/photo-1544550141-7eca2e2d7e9d?w=800&h=600&fit=crop&crop=center',

        // Spain - Canary Islands
        'LAS PALMAS': 'https://images.unsplash.com/photo-1509650436463-4b26d751e376?w=800&h=600&fit=crop&crop=center',
        'TENERIFE': 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=600&fit=crop&crop=center',
        'GRAN CANARIA': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center',

        // France
        'PARIS': 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop&crop=center', // Eiffel Tower
        'NICE': 'https://images.unsplash.com/photo-1539650116574-75c0c6d76647?w=800&h=600&fit=crop&crop=center',
        'LYON': 'https://images.unsplash.com/photo-1524071074880-f8ea0c61d5c7?w=800&h=600&fit=crop&crop=center',
        'MARSEILLE': 'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800&h=600&fit=crop&crop=center',
        'CANNES': 'https://images.unsplash.com/photo-1598894000815-24dd8afad7ad?w=800&h=600&fit=crop&crop=center',

        // Italy
        'ROME': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&crop=center', // Colosseum
        'MILAN': 'https://images.unsplash.com/photo-1513581166391-887928ac3dbc?w=800&h=600&fit=crop&crop=center',
        'VENICE': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop&crop=center',
        'FLORENCE': 'https://images.unsplash.com/photo-1567678480132-98e6e3ca1f03?w=800&h=600&fit=crop&crop=center',
        'NAPLES': 'https://images.unsplash.com/photo-1544413164-48f17bb616a8?w=800&h=600&fit=crop&crop=center',

        // Germany
        'BERLIN': 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&h=600&fit=crop&crop=center',
        'MUNICH': 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop&crop=center',
        'HAMBURG': 'https://images.unsplash.com/photo-1524871104842-8b16bac473dd?w=800&h=600&fit=crop&crop=center',
        'COLOGNE': 'https://images.unsplash.com/photo-1509650436463-4b26d751e376?w=800&h=600&fit=crop&crop=center',

        // UK
        'LONDON': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=center', // Big Ben
        'EDINBURGH': 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800&h=600&fit=crop&crop=center',
        'MANCHESTER': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop&crop=center',

        // Portugal
        'LISBON': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop&crop=center',
        'PORTO': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop&crop=center',

        // Greece
        'ATHENS': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&crop=center',
        'SANTORINI': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&crop=center',
        'MYKONOS': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop&crop=center',

        // Netherlands
        'AMSTERDAM': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop&crop=center',

        // Austria
        'VIENNA': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop&crop=center',
        'SALZBURG': 'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800&h=600&fit=crop&crop=center',

        // Czech Republic
        'PRAGUE': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=600&fit=crop&crop=center',

        // Turkey
        'ISTANBUL': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop&crop=center',

        // Default fallback
        'DEFAULT': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center'
    };

    // Try to match destination or hotel location
    const searchKey = (destination || hotelLocation || '').toUpperCase();

    // Direct match
    if (destinationPhotos[searchKey]) {
        return destinationPhotos[searchKey];
    }

    // Partial match
    for (const [key, photo] of Object.entries(destinationPhotos)) {
        if (searchKey.includes(key) || key.includes(searchKey)) {
            return photo;
        }
    }

    return destinationPhotos.DEFAULT;
};

const HotelList = ({ hotels, loading, onHotelSelect, searchInfo }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div className="absolute top-0 animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                </div>
                <span className="mt-4 text-lg text-gray-600 font-medium">Searching for hotels...</span>
            </div>
        );
    }

    if (!hotels || hotels.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <MapPin className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-700">No hotels found</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Try adjusting your search criteria or select a different destination
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-900">
                    {hotels.length} Hotels Found in {searchInfo.destination}
                </h2>
                <p className="text-gray-600 mt-2 flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(searchInfo.checkIn).toLocaleDateString()} - {new Date(searchInfo.checkOut).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {searchInfo.adults} Adults {searchInfo.children > 0 && `• ${searchInfo.children} Children`}
                    </span>
                    <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {searchInfo.rooms} Room{searchInfo.rooms > 1 ? 's' : ''}
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hotels.map((hotel) => {
                    const destinationPhoto = getDestinationPhoto(searchInfo.destination, hotel.destinationName);

                    return (
                        <div
                            key={hotel.code}
                            onClick={() => onHotelSelect(hotel)}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group transform hover:-translate-y-1"
                        >
                            {/* Hotel Image with Destination Photo */}
                            <div className="h-56 relative overflow-hidden">
                                <img
                                    src={destinationPhoto}
                                    alt={`${searchInfo.destination || hotel.destinationName} destination`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                <div className="absolute top-4 left-4">
                                    <span className="bg-white bg-opacity-95 px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-md backdrop-blur-sm">
                                        {hotel.categoryName || '4 STARS'}
                                    </span>
                                </div>

                                <div className="absolute top-4 right-4 flex gap-1">
                                    {[...Array(parseInt(hotel.categoryName?.match(/\d+/)?.[0] || 4))].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                                    ))}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                    <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">{hotel.name}</h3>
                                    <p className="text-white/80 text-sm flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {hotel.zoneName}, {hotel.destinationName}
                                    </p>
                                </div>
                            </div>

                            {/* Hotel Details */}
                            <div className="p-6">
                                {/* Amenities */}
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Wifi className="w-3 h-3" />
                                        WiFi
                                    </span>
                                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Coffee className="w-3 h-3" />
                                        Breakfast
                                    </span>
                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Car className="w-3 h-3" />
                                        Parking
                                    </span>
                                </div>

                                {/* Price and Details */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {hotel.rooms?.length || 0} room types available
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm text-gray-500">From</span>
                                            <p className="text-3xl font-bold text-blue-600">
                                                €{hotel.rooms?.[0]?.rates?.[0]?.net || hotel.minRate || 'N/A'}
                                            </p>
                                            <span className="text-sm text-gray-500">in Total</span>
                                        </div>
                                    </div>
                                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform group-hover:scale-105 shadow-md">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HotelList;
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Star, Wifi, Coffee, Car, Clock,
    Bed, Calendar as CalendarIcon, Check, X, ChevronLeft,
    ChevronRight, Heart, Share, Users, Baby, Dog,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { DateRangePicker } from 'react-date-range';
import { addDays, format, isSameDay } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const HotelDetails = ({ hotelId = 100003163, onBack }) => {
    // State management
    const [hotel, setHotel] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [pricing, setPricing] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date and guest state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const [dateRange, setDateRange] = useState([{
        startDate: addDays(new Date(), 1),
        endDate: addDays(new Date(), 3),
        key: 'selection'
    }]);

    const [guests, setGuests] = useState({
        adults: 2,
        children: 0,
        babies: 0,
        pets: 0
    });

    // Fetch data from your backend
    useEffect(() => {
        fetchHotelData();
        fetchImages();
        fetchAvailability();
    }, [hotelId]);

    useEffect(() => {
        if (dateRange[0].startDate && dateRange[0].endDate) {
            fetchPricing();
        }
    }, [dateRange, guests]);

    const fetchHotelData = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}`);
            const data = await response.json();
            setHotel(data);
        } catch (error) {
            console.error('Error fetching hotel:', error);
        }
    };

    const fetchImages = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}/images/urls`);
            const imageUrls = await response.json();
            setImages(imageUrls);
        } catch (error) {
            console.error('Error fetching images:', error);
            setImages([]);
        }
    };

    const fetchPricing = async () => {
        try {
            const checkin = format(dateRange[0].startDate, 'yyyy-MM-dd');
            const checkout = format(dateRange[0].endDate, 'yyyy-MM-dd');
            const totalGuests = guests.adults + guests.children;

            const response = await fetch(
                `http://localhost:8080/api/hotels/${hotelId}/pricing/custom?checkin=${checkin}&checkout=${checkout}&guests=${totalGuests}`
            );
            const data = await response.json();
            setPricing(data);
        } catch (error) {
            console.error('Error fetching pricing:', error);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}/availability/checkin-dates`);
            const dates = await response.json();
            setAvailability(dates.map(date => new Date(date)));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching availability:', error);
            setLoading(false);
        }
    };

    const updateGuests = (type, increment) => {
        setGuests(prev => ({
            ...prev,
            [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1)
        }));
    };

    const calculateNights = () => {
        if (!dateRange[0].startDate || !dateRange[0].endDate) return 0;
        return Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24));
    };

    const formatGuestText = () => {
        const parts = [];
        if (guests.adults > 0) parts.push(`${guests.adults} Erwachsene`);
        if (guests.children > 0) parts.push(`${guests.children} Kinder`);
        if (guests.babies > 0) parts.push(`${guests.babies} Baby${guests.babies > 1 ? 's' : ''}`);
        if (guests.pets > 0) parts.push(`${guests.pets} Haustier${guests.pets > 1 ? 'e' : ''}`);
        return parts.join(', ') || '1 Gast';
    };

    const isDateAvailable = (date) => {
        return availability.some(availableDate => isSameDay(availableDate, date));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Zurück</span>
                        </button>

                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Share className="w-4 h-4" />
                                <span className="hidden sm:inline">Teilen</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="hidden sm:inline">Speichern</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hotel Title */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                        {hotel?.hotelName || 'Luxury Villa'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                            <span className="font-medium">4.8</span>
                            <span className="underline cursor-pointer hover:text-gray-900">123 Bewertungen</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="underline cursor-pointer hover:text-gray-900">
                {hotel?.cityName}, {hotel?.countryName}
              </span>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
                        {/* Main Image */}
                        <div className="relative md:row-span-2">
                            <img
                                src={images[currentImageIndex] || '/api/placeholder/600/400'}
                                alt="Hotel main view"
                                className="w-full h-96 md:h-full object-cover cursor-pointer hover:brightness-105 transition-all"
                                onClick={() => setCurrentImageIndex(0)}
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {images.slice(1, 5).map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={image}
                                        alt={`Hotel view ${index + 2}`}
                                        className="w-full h-48 object-cover cursor-pointer hover:brightness-105 transition-all"
                                        onClick={() => setCurrentImageIndex(index + 1)}
                                    />
                                    {index === 3 && images.length > 5 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                                +{images.length - 5} Fotos anzeigen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Host Info */}
                        <div className="border-b border-gray-200 pb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Ganze Unterkunft · Villa
                                    </h2>
                                    <p className="text-gray-600">6 Gäste · 3 Schlafzimmer · 3 Betten · 2 Badezimmer</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    H
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="border-b border-gray-200 pb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Was dieser Ort bietet</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: Wifi, label: 'WLAN' },
                                    { icon: Coffee, label: 'Küche' },
                                    { icon: Car, label: 'Kostenloser Parkplatz' },
                                    { icon: Clock, label: '24/7 Check-in' },
                                    { icon: Bed, label: 'Bettwäsche' },
                                    { icon: Dog, label: 'Haustiere erlaubt' }
                                ].map((amenity, index) => {
                                    const IconComponent = amenity.icon;
                                    return (
                                        <div key={index} className="flex items-center gap-3">
                                            <IconComponent className="w-5 h-5 text-gray-600" />
                                            <span>{amenity.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="border border-gray-300 rounded-xl shadow-xl p-6 bg-white">
                                {/* Price Header */}
                                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-2xl font-semibold">
                    €{pricing?.price?.replace('€', '') || '51'}
                  </span>
                                    <span className="text-gray-600">Nacht</span>
                                    {pricing?.slasherPrice && (
                                        <span className="text-gray-400 line-through text-lg ml-2">
                      €{pricing.slasherPrice.replace('€', '')}
                    </span>
                                    )}
                                </div>

                                {/* Date Selection */}
                                <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
                                    <div className="grid grid-cols-2">
                                        {/* Check-in */}
                                        <button
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            className="border-r border-gray-300 p-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                                Check-in
                                            </div>
                                            <div className="text-sm">
                                                {format(dateRange[0].startDate, 'dd.MM.yyyy')}
                                            </div>
                                        </button>

                                        {/* Check-out */}
                                        <button
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            className="p-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                                Check-out
                                            </div>
                                            <div className="text-sm">
                                                {format(dateRange[0].endDate, 'dd.MM.yyyy')}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Date Picker */}
                                {showDatePicker && (
                                    <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                                        <DateRangePicker
                                            ranges={dateRange}
                                            onChange={(item) => setDateRange([item.selection])}
                                            showSelectionPreview={true}
                                            moveRangeOnFirstSelection={false}
                                            months={1}
                                            direction="vertical"
                                            rangeColors={['#e11d48']}
                                            minDate={new Date()}
                                            dayContentRenderer={(day) => (
                                                <div className={`${!isDateAvailable(day) ? 'text-gray-300 line-through' : ''}`}>
                                                    {format(day, 'd')}
                                                </div>
                                            )}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {/* Guest Selection */}
                                <div className="relative mb-6">
                                    <button
                                        onClick={() => setShowGuestPicker(!showGuestPicker)}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                                Gäste
                                            </div>
                                            <div className="text-sm">{formatGuestText()}</div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Guest Picker Dropdown */}
                                    {showGuestPicker && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
                                            {[
                                                { key: 'adults', label: 'Erwachsene', sublabel: 'Ab 13 Jahren', icon: Users },
                                                { key: 'children', label: 'Kinder', sublabel: '2-12 Jahre', icon: Users },
                                                { key: 'babies', label: 'Kleinkinder', sublabel: 'Unter 2 Jahren', icon: Baby },
                                                { key: 'pets', label: 'Haustiere', sublabel: 'Servicetiere?', icon: Dog }
                                            ].map(({ key, label, sublabel, icon: Icon }) => (
                                                <div key={key} className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="w-5 h-5 text-gray-600" />
                                                        <div>
                                                            <div className="font-medium">{label}</div>
                                                            <div className="text-sm text-gray-500">{sublabel}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateGuests(key, false)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                                                            disabled={(key === 'adults' && guests[key] <= 1) || guests[key] === 0}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{guests[key]}</span>
                                                        <button
                                                            onClick={() => updateGuests(key, true)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Reserve Button */}
                                <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg">
                                    Reservieren
                                </button>

                                <p className="text-center text-sm text-gray-600 mt-3">
                                    Du musst noch nichts bezahlen
                                </p>

                                {/* Price Breakdown */}
                                {pricing && calculateNights() > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="underline">€{pricing.price?.replace('€', '') || '51'} × {calculateNights()} Nächte</span>
                                            <span>€{((parseInt(pricing.price?.replace('€', '') || '51')) * calculateNights()).toFixed(2)}</span>
                                        </div>

                                        {pricing.totalPriceBreakup?.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span>{item.title}</span>
                                                <span className={item.price.includes('-') ? 'text-green-600' : ''}>
                          {item.price}
                        </span>
                                            </div>
                                        ))}

                                        <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
                                            <span>Gesamtbetrag</span>
                                            <span>€{pricing.price?.replace('€', '') || '141,33'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;
import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, MapPin, Star, Wifi, Coffee, Car, Clock,
    Bed, Check, X, ChevronLeft, ChevronRight, Heart, Share,
    Users, Baby, Dog, ChevronDown, ChevronUp, Shield,
    AlertTriangle, Wind, Home, CreditCard, HeadphonesIcon,
    Phone, Banknote, Sparkles, Bath, Ruler, UserCheck , AlertCircle, CalendarX
} from 'lucide-react';
import { addDays, format, isSameDay, isWeekend, parseISO } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const HotelDetailss = ({ hotelId = 100003163, onBack, searchInfo }) => {
    // State management , Hooks:
    const [hotel, setHotel] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [pricing, setPricing] = useState(null);
    const [availableCheckinDates, setAvailableCheckinDates] = useState([]);
    const [availableCheckoutDates, setAvailableCheckoutDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCheckin, setSelectedCheckin] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState({
        towels: false,
        pets: false
    });
    const [showExtrasPicker, setShowExtrasPicker] = useState(false);
    const [availabilityPeriods, setAvailabilityPeriods] = useState(new Map()); // Cache for different periods
    const [currentAvailabilityStart, setCurrentAvailabilityStart] = useState(null);
    const [currentAvailabilityEnd, setCurrentAvailabilityEnd] = useState(null);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);



    // Date and guest state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const isValidDate = d => d instanceof Date && !isNaN(d);
    const fmt = (d, p = 'dd.MM.yyyy') => (isValidDate(d) ? format(d, p) : '—');
    const EMPTY_RANGE = { startDate: null, endDate: null, key: 'selection' };

    const [dateRange, setDateRange] = useState([EMPTY_RANGE]);
    const hasRealRange =
        !!selectedCheckin && !!dateRange[0].endDate && dateRange[0].endDate > selectedCheckin;

    const pickerRanges = [{
        // give it something to render, but we’ll hide the highlight unless hasRealRange
        startDate: selectedCheckin || new Date(),
        endDate: dateRange[0].endDate || selectedCheckin || new Date(),
        key: 'selection'
    }];

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
    useEffect(() => {
        if (guests.pets === 0 && selectedExtras.pets) {
            setSelectedExtras(prev => ({
                ...prev,
                pets: false
            }));
        }
    }, [guests.pets, selectedExtras.pets]);



    const fetchHotelData = async () => {
        try {
            // const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}`);

            const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}`);
            const data = await response.json();
            setHotel(data);
        } catch (error) {
            console.error('Error fetching hotel:', error);
        }
    };

    const fetchImages = async () => {
        try {
            // const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}/images/urls`);

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
            //  const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}/pricing/dates?checkin=${checkin}&checkout=${checkout}`);
            const response = await fetch(
                `http://localhost:8080/api/hotels/${hotelId}/pricing/dates?checkin=${checkin}&checkout=${checkout}`
            );

            if (!response.ok) {
                console.log('Pricing not available for these dates');
                setPricing(null);
                return;
            }

            const data = await response.json();
            setPricing(data);
        } catch (error) {
            console.error('Error fetching pricing:', error);
            setPricing(null);
        }
    };

    // Is this day a Belvilla check-in date?
    const isBelvillaCheckinDay = (date) =>
        availableCheckinDates.some(d => isSameDay(d, date));

    const fetchAvailability = async () => {
        const today = new Date();
        await fetchAvailabilityForPeriod(today);

        // If we have existing check-in date, fetch checkout dates for it
        if (dateRange[0].startDate) {
            await fetchCheckoutDates(dateRange[0].startDate);
        }

        setLoading(false);
    };
    const fetchAvailabilityForPeriod = async (startDate) => {
        const period = calculateAvailabilityPeriod(startDate);

        // Check if we already have this period cached
        if (availabilityPeriods.has(period.key)) {
            const cachedData = availabilityPeriods.get(period.key);
            setAvailableCheckinDates(cachedData.checkinDates);
            setCurrentAvailabilityStart(period.start);
            setCurrentAvailabilityEnd(period.end);
            return;
        }

        setIsLoadingAvailability(true);

        try {
            // Format start date for API - your existing endpoint expects 'start' and 'months'
            const startParam = format(period.start, 'yyyy-MM-dd');
            //  const response = await fetch(
            // `http://localhost:8080/api/hotels/${hotelId}/availability/checkin-dates?start=${startParam}&months=3`
            // );


            const response = await fetch(
                `http://localhost:8080/api/hotels/${hotelId}/availability/checkin-dates?start=${startParam}&months=3`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch availability');
            }

            const dates = await response.json();
            const checkinDates = dates.map(date => new Date(date));

            // Cache the data
            setAvailabilityPeriods(prev => new Map(prev).set(period.key, {
                checkinDates,
                period
            }));

            setAvailableCheckinDates(checkinDates);
            setCurrentAvailabilityStart(period.start);
            setCurrentAvailabilityEnd(period.end);

        } catch (error) {
            console.error('Error fetching availability for period:', error);
            setAvailableCheckinDates([]);
        } finally {
            setIsLoadingAvailability(false);
        }
    };




    const calculateAvailabilityPeriod = (date) => {
        console.log('🔍 Input date for calculation:', date); // ADD THIS
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        console.log('📅 Calculated start of month:', startOfMonth); // ADD THIS
        const endDate = new Date(startOfMonth);
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setDate(0); // Last day of the 3rd month

        return {
            start: startOfMonth,
            end: endDate,
            key: `${startOfMonth.getFullYear()}-${startOfMonth.getMonth()}`
        };
    };
    const isDateInLoadedPeriod = (date) => {
        if (!currentAvailabilityStart || !currentAvailabilityEnd) return false;
        return date >= currentAvailabilityStart && date <= currentAvailabilityEnd;
    };

    // Function to check and load availability when user navigates calendar
    const checkAndLoadAvailabilityForDate = async (date) => {
        if (!isDateInLoadedPeriod(date)) {
            await fetchAvailabilityForPeriod(date);
        }
    };
    const ROOMPOT_ARRIVAL_DATES = [
        "26-09-2025","29-09-2025","03-10-2025","06-10-2025","10-10-2025","13-10-2025","17-10-2025","20-10-2025","24-10-2025","27-10-2025","31-10-2025","03-11-2025","07-11-2025","10-11-2025","14-11-2025","17-11-2025","21-11-2025","24-11-2025","28-11-2025","01-12-2025","05-12-2025","08-12-2025","12-12-2025","15-12-2025","19-12-2025","22-12-2025","24-12-2025","29-12-2025","02-01-2026","05-01-2026","09-01-2026","12-01-2026","16-01-2026","19-01-2026","23-01-2026","26-01-2026","30-01-2026","02-02-2026","06-02-2026","09-02-2026","13-02-2026","16-02-2026","20-02-2026","23-02-2026","27-02-2026","02-03-2026","06-03-2026","09-03-2026","13-03-2026","16-03-2026","20-03-2026","23-03-2026","27-03-2026","30-03-2026","03-04-2026","07-04-2026","10-04-2026","13-04-2026","17-04-2026","20-04-2026","24-04-2026","27-04-2026","30-04-2026","04-05-2026","08-05-2026","11-05-2026","13-05-2026","18-05-2026","22-05-2026","26-05-2026","29-05-2026","01-06-2026","03-06-2026","05-06-2026","08-06-2026","12-06-2026","15-06-2026","19-06-2026","22-06-2026","26-06-2026","29-06-2026","03-07-2026","06-07-2026","10-07-2026","13-07-2026","17-07-2026","20-07-2026","24-07-2026","27-07-2026","31-07-2026","03-08-2026","07-08-2026","10-08-2026","14-08-2026","17-08-2026","21-08-2026","24-08-2026","28-08-2026","31-08-2026","04-09-2026","07-09-2026","11-09-2026","14-09-2026","18-09-2026","21-09-2026","25-09-2026","28-09-2026","02-10-2026","05-10-2026","09-10-2026","12-10-2026","16-10-2026","19-10-2026","23-10-2026","26-10-2026","30-10-2026","02-11-2026","06-11-2026","09-11-2026","13-11-2026","16-11-2026","20-11-2026","23-11-2026","27-11-2026","30-11-2026","04-12-2026","07-12-2026","11-12-2026","14-12-2026","18-12-2026","23-12-2026","28-12-2026","31-12-2026","04-01-2027"
    ].map(dateStr => {
        const [day, month, year] = dateStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    });
    const isRoompotArrivalDay = (date) => {
        return ROOMPOT_ARRIVAL_DATES.some(arrivalDate =>
            isSameDay(arrivalDate, date)
        );
    };

    const getNextArrivalDay = (fromDate) => {
        return ROOMPOT_ARRIVAL_DATES.find(arrivalDate => arrivalDate > fromDate);
    };

    const handleMonthNavigation = async (focusedRange, preview) => {
        if (preview && preview.startDate) {
            await checkAndLoadAvailabilityForDate(preview.startDate);
        }
    };
    const preloadNextPeriodIfNeeded = async (currentDate) => {
        if (!currentAvailabilityEnd) return;

        // If user is within 2 weeks of the end, preload next period
        const twoWeeksBeforeEnd = new Date(currentAvailabilityEnd);
        twoWeeksBeforeEnd.setDate(twoWeeksBeforeEnd.getDate() - 14);

        if (currentDate >= twoWeeksBeforeEnd) {
            const nextPeriodStart = new Date(currentAvailabilityEnd);
            nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);

            // Load next period in background
            fetchAvailabilityForPeriod(nextPeriodStart);
        }
    };

    const fetchCheckoutDates = async (checkinDate) => {

        try {
            const checkin = format(checkinDate, 'yyyy-MM-dd');
            //  const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}/availability/checkout-dates?checkin=${checkin}`);
            const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}/availability/checkout-dates?checkin=${checkin}`);

            if (!response.ok) {
                console.log('No checkout dates available for this check-in');
                setAvailableCheckoutDates([]);
                return;
            }

            const checkoutDates = await response.json();
            setAvailableCheckoutDates(checkoutDates.map(date => new Date(date)));
            setSelectedCheckin(checkinDate);
        } catch (error) {
            console.error('Error fetching checkout dates:', error);
            setAvailableCheckoutDates([]);
        }
    };

    const updateGuests = (type, increment) => {
        setGuests(prev => ({
            ...prev,
            [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1)
        }));
    };
    // here I calculate number of nights
    const calculateNights = () => {
        if (!isValidDate(dateRange[0].startDate) || !isValidDate(dateRange[0].endDate)) return 0;
        return Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24));
    };

    // here I calculate the price of extras
    const calculateExtrasTotal = () => {
        let total = 0;

        // Handtücher calculation (excluding pets)
        if (selectedExtras.towels) {
            const personsCount = guests.adults + guests.children + guests.babies;
            total += 8 * personsCount;
        }
        if (selectedExtras.pets && guests.pets > 0) {
            total += 7 * guests.pets* calculateNights();
        }

        return total;
    };

    // Calculating total price with extras
    const calculateTotalWithExtras = () => {
        const basePrice = parseFloat(pricing?.price?.replace(/[^0-9.]/g, '') || '0');
        const extrasTotal = calculateExtrasTotal();
        return basePrice + extrasTotal;
    };

    const formatGuestText = () => {
        const parts = [];
        if (guests.adults > 0) parts.push(`${guests.adults} Erwachsene`);
        if (guests.children > 0) parts.push(`${guests.children} Kinder`);
        if (guests.babies > 0) parts.push(`${guests.babies} Baby${guests.babies > 1 ? 's' : ''}`);
        return parts.join(', ') || '1 Gast';
    };

    const isDateUnavailable = (date) => {
        // Past dates are always unavailable
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            return true;
        }

        // If date is outside loaded period, consider it unavailable
        // (it will be loaded when user navigates to it)
        if (!isDateInLoadedPeriod(date)) {
            return true; // Will trigger loading when user navigates
        }

        // If we haven't selected a check-in yet
        if (!selectedCheckin) {
            // Only available check-in dates are selectable
            const isAvailableCheckin = availableCheckinDates.some(availableDate =>
                isSameDay(availableDate, date)
            );
            return !isAvailableCheckin;
        } else {
            // If we have selected a check-in
            // The check-in date itself should remain available (for deselection)
            if (isSameDay(date, selectedCheckin)) {
                return false;
            }

            // For checkout dates, check if it's in the available checkout dates
            const isAvailableCheckout = availableCheckoutDates.some(availableDate =>
                isSameDay(availableDate, date)
            );

            // Dates before check-in are unavailable
            if (date <= selectedCheckin) {
                return true;
            }

            // Return true if it's NOT an available checkout date
            return !isAvailableCheckout;
        }
    };


    const getDisabledDates = () => {
        const disabledDates = [];
        const startDate = new Date();
        const endDate = addDays(startDate, 90); // 3 months ≈ 90 daysRetryClaude can make mistakes. Please double-check responses.

        for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
            if (isDateUnavailable(d)) {
                disabledDates.push(d);
            }
        }

        return disabledDates;
    };


    const customDayContent = (day) => {
        const isCheckinDate  = selectedCheckin && isSameDay(day, selectedCheckin);
        const isCheckoutDate = dateRange[0].endDate && isSameDay(day, dateRange[0].endDate);
        const isToday        = isSameDay(day, new Date());
        const isInRange =
            selectedCheckin && dateRange[0].endDate && day > selectedCheckin && day < dateRange[0].endDate;

        const isRoompotArrival   = isRoompotArrivalDay(day);
        const isBelvillaCheckin  = availableCheckinDates.some(d => isSameDay(d, day));
        const isBelvillaOnly     = isBelvillaCheckin && !isRoompotArrival;

        let isNotArrival = false;   // light green, unclickable
        let isNotBookable = false;  // pink, unclickable

        // Past dates → block
        const today = new Date(); today.setHours(0,0,0,0);
        if (day < today) {
            isNotBookable = false;          // <- was false
        } else if (!isDateInLoadedPeriod(day)) {
            isNotBookable = true;
        } else {
            if (isBelvillaOnly) {
                isNotArrival = true;
            } else if (isRoompotArrival) {
                // keep clickable
            } else if (selectedCheckin && isRoompotArrivalDay(selectedCheckin)) {
                // between selected Roompot arrival and the next Roompot arrival → green & unclickable
                const nextArrival = getNextArrivalDay(selectedCheckin);
                const isBetween =
                    day > selectedCheckin &&
                    (nextArrival ? day < nextArrival : day <= addDays(selectedCheckin, 14));

                if (isBetween) {
                    isNotArrival = true;        // <-- key change: use the unclickable green state
                } else {
                    // anything else after Roompot check-in that backend didn't allow → block
                    const okFromBackend = availableCheckoutDates.some(d => isSameDay(d, day));
                    if (!okFromBackend) isNotBookable = true;
                }
            } else {
                // Belvilla check-in selected → only backend-approved checkouts are clickable
                const okFromBackend = availableCheckoutDates.some(d => isSameDay(d, day));
                if (!okFromBackend) isNotBookable = true;
            }
        }

        // Shield to catch pointer events on unclickable days (works even if :has() isn't supported)
        const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

        return (
            <div
                className={`
        relative w-full h-full flex items-center justify-center
        ${isInRange ? 'in-range-day' : ''}
        ${isCheckinDate || isCheckoutDate ? 'selected-day' : ''}
        ${isNotArrival ? 'not-arrival-day' : ''}
        ${isNotBookable ? 'not-bookable-day' : ''}
        ${isRoompotArrival ? 'roompot-arrival-day' : ''}
      `}
                role="presentation"
            >
                {(isNotArrival || isNotBookable) && (
                    <div
                        className="absolute inset-0 z-10"
                        onPointerDown={stop}
                        onMouseDown={stop}
                        onTouchStart={stop}
                        onClick={stop}
                        aria-hidden="true"
                    />
                )}
                <span className={`${isNotBookable ? 'text-gray-400' : 'text-gray-900'} ${isToday ? 'font-bold' : ''} ${(isCheckinDate || isCheckoutDate) ? 'text-white font-bold' : ''}`}>
        {format(day, 'd')}
      </span>
            </div>
        );
    };



    const handleDateChange = async (item) => {
        const newStartDate = item.selection.startDate;
        const newEndDate = item.selection.endDate;

        // If selecting a check-in date (no check-in selected yet or selecting a new one)
        if (!selectedCheckin || newStartDate.getTime() !== selectedCheckin.getTime()) {
            // Fetch valid checkout dates for this check-in
            await fetchCheckoutDates(newStartDate);
            setSelectedCheckin(newStartDate);

            // Set just the start date initially
            setDateRange([{
                startDate: newStartDate,
                endDate: newStartDate,
                key: 'selection'
            }]);
        } else {
            // We're selecting a checkout date
            // Check if this specific checkout date is available
            // We're selecting a checkout date
            // Accept either backend-provided checkouts OR a valid Roompot window day
            const isValidCheckoutFromBackend = availableCheckoutDates.some(date =>
                isSameDay(date, newEndDate)
            );

            const isValidRoompotCheckout =
                selectedCheckin &&
                isRoompotArrivalDay(selectedCheckin) &&
                (() => {
                    const nextArrivalDay = getNextArrivalDay(selectedCheckin);
                    if (nextArrivalDay) {
                        return newEndDate > selectedCheckin && newEndDate < nextArrivalDay;
                    }
                    const maxCheckoutDate = new Date(selectedCheckin);
                    maxCheckoutDate.setDate(maxCheckoutDate.getDate() + 14);
                    return newEndDate > selectedCheckin && newEndDate <= maxCheckoutDate;
                })();

            const isValidCheckout = (isValidCheckoutFromBackend || isValidRoompotCheckout) && (newEndDate > selectedCheckin);

            if (isValidCheckout) {
                setDateRange([{
                    startDate: selectedCheckin,
                    endDate: newEndDate,
                    key: 'selection'
                }]);

                // Force a re-render to ensure styles are applied
                requestAnimationFrame(() => {
                    setDateRange([{ startDate: selectedCheckin, endDate: newEndDate, key: 'selection' }]);
                });

            }



        }
    };
    const handleReservation = () => {
        // Format dates for URL (DD/MM/YYYY format for European sites)
        const checkinFormatted = format(dateRange[0].startDate, 'dd/MM/yyyy');  // ← Changed this
        const checkoutFormatted = format(dateRange[0].endDate, 'dd/MM/yyyy');   // ← Changed this

        // Calculate total guests (excluding pets for booking)
        const totalGuests = guests.adults + guests.children + guests.babies;

        // Encode dates for URL
        const checkinEncoded = encodeURIComponent(checkinFormatted);
        const checkoutEncoded = encodeURIComponent(checkoutFormatted);

        // Build dynamic URL
        const belvilla_url = `https://nl.belvilla.be/be/${hotelId}/?checkin=${checkinEncoded}&checkout=${checkoutEncoded}&flexibleDaysCount=3&guests=${totalGuests}&rooms=1&rooms_config=1-${totalGuests}&selected_rcid=1`;

        // Redirect to Belvilla
        window.open(belvilla_url, '_blank');
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
            {/* Header  Starting */}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hotel Title */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {hotel?.hotelName || 'Luxury Villa'}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        {/* Rating Section */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md">
                                <Star className="w-4 h-4 fill-current" />
                                <span>4.0</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">Sehr gut</span>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="underline cursor-pointer hover:text-gray-900 transition-colors">
                            47 Bewertungen
                        </span>
                                    <span>•</span>
                                    <span className="underline cursor-pointer hover:text-gray-900 transition-colors">
                            14 Rezensionen
                        </span>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-rose-500" />
                            <span className="underline cursor-pointer hover:text-gray-900 transition-colors font-medium">
                                  Bredene, Belgium coast, Flanders, West Flanders, Belgium
                                </span>
                        </div>
                    </div>

                    {/* Star Rating Visual */}
                    <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">von 5 Sternen</span>
                    </div>
                </div>


                {/* Image Gallery */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
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
                        <div className="border-b border-gray-200 pb-8">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">                                <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl">
                                            <Home className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Ganze Unterkunft · Villa
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-4">
                                        {/* Guests */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">6</div>
                                                <div className="text-xs text-gray-600">Gäste</div>
                                            </div>
                                        </div>

                                        {/* Bedrooms */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Bed className="w-4 h-4 text-purple-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">3</div>
                                                <div className="text-xs text-gray-600">Schlafzimmer</div>
                                            </div>
                                        </div>

                                        {/* Beds */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Bed className="w-4 h-4 text-green-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">3</div>
                                                <div className="text-xs text-gray-600">Betten</div>
                                            </div>
                                        </div>

                                        {/* Bathrooms */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Bath className="w-4 h-4 text-cyan-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">2</div>
                                                <div className="text-xs text-gray-600">Badezimmer</div>
                                            </div>
                                        </div>

                                        {/* Area */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Ruler className="w-4 h-4 text-orange-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">95m²</div>
                                                <div className="text-xs text-gray-600">Fläche</div>
                                            </div>
                                        </div>

                                        {/* Check-in */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Clock className="w-4 h-4 text-emerald-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">4-5 PM</div>
                                                <div className="text-xs text-gray-600">Check-in</div>
                                            </div>
                                        </div>

                                        {/* Check-out */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                            <Clock className="w-4 h-4 text-red-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">10 AM</div>
                                                <div className="text-xs text-gray-600">Check-out</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                                {/* Property Highlights */}

                            </div>
                        </div>

                        {/*Was Deiser Ort bietet */}
                        <div className="border-b border-gray-200 pb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-rose-500" />
                                Was dieser Ort bietet
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    {
                                        icon: Bed,
                                        label: 'Bettwäsche',
                                        description: 'Hochwertige Bettwäsche inklusive',
                                        color: 'text-blue-600',
                                        bgColor: 'bg-blue-50'
                                    },
                                    {
                                        icon: Banknote,
                                        label: 'Kurtaxe',
                                        description: 'Lokale Tourismussteuer',
                                        color: 'text-green-600',
                                        bgColor: 'bg-green-50'
                                    },
                                    {
                                        icon: Sparkles,
                                        label: 'Endreinigung',
                                        description: 'Professionelle Reinigung',
                                        color: 'text-purple-600',
                                        bgColor: 'bg-purple-50'
                                    },
                                    {
                                        icon: CreditCard,
                                        label: 'Buchungskosten',
                                        description: 'Sichere Zahlungsabwicklung',
                                        color: 'text-orange-600',
                                        bgColor: 'bg-orange-50'
                                    },
                                    {
                                        icon: HeadphonesIcon,
                                        label: 'Unterstützung Bleiben',
                                        description: '24/7 Gästebetreuung',
                                        color: 'text-rose-600',
                                        bgColor: 'bg-rose-50'
                                    },
                                    {
                                        icon: Phone,
                                        label: 'Reiseunterstützung',
                                        description: 'Hilfe bei der Reiseplanung',
                                        color: 'text-indigo-600',
                                        bgColor: 'bg-indigo-50'
                                    }
                                ].map((service, index) => {
                                    const IconComponent = service.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="group relative p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`${service.bgColor} ${service.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                                                        {service.label}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Hover effect overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Additional Features */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Weitere Ausstattung</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { icon: Wifi, label: 'WLAN', color: 'text-blue-500' },
                                        { icon: Coffee, label: 'Küche', color: 'text-amber-600' },
                                        { icon: Car, label: 'Parkplatz', color: 'text-gray-600' },
                                        { icon: Dog, label: 'Haustiere OK', color: 'text-green-600' }
                                    ].map((feature, index) => {
                                        const IconComponent = feature.icon;
                                        return (
                                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                <IconComponent className={`w-4 h-4 ${feature.color}`} />
                                                <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>



                        </div>
                        {/* Policies */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Wichtige Hinweise</h3>
                            <div className="space-y-3">
                                {[
                                    "Die Wohnung kann in Bezug auf die Einrichtung etwas von den gezeigten Fotos abweichen, das Komfortniveau ist jedoch wie beschrieben",
                                    "Reservierungen für Gruppen oder Gesellschaften von Personen unter 21 Jahren sind nicht gestattet",
                                    "Dieses Ferienhaus steht nur für Erholungszwecke zur Verfügung. Buchungen im Namen von Unternehmen werden storniert und eventuell anfallende Stornogebühren werden berechnet",
                                    "Haustiere müssen aufgrund der Verfügbarkeit während des Buchungsprozesses angegeben werden, das finden Sie unter Extras in Booking Card"
                                ].map((policy, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{policy}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="border-b border-gray-200 pb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Stornierungsbedingungen</h3>

                            <div className="space-y-3">
                                {[
                                    "Bei einem Rücktritt bis zum einschließlich 43. Tag vor dem vereinbarten Mietbeginn 30% des Reisepreises.",
                                    "Bei einem Rücktritt vom 42. bis zum einschließlich 29. Tag vor dem vereinbarten Mietbeginn 60% des Reisepreises.",
                                    "Bei einem Rücktritt vom 28. bis zum einschließlich letzten Tag vor dem vereinbarten Mietbeginn 90% des Reisepreises.",
                                    "Bei späterem Rücktritt oder bei Nichtantritt der Reise wird der gesamte Reisepreis berechnet."
                                ].map((policy, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{policy}</p>
                                    </div>
                                ))}
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
                                            {pricing?.price
                                                ? `€${pricing.price.replace('€', '')}`
                                                : 'Verfügbaren Zeitraum wählen'}
                                        </span>
                                    {pricing?.price && (
                                        <span className="text-gray-600">exkl. Zusatzleistungen</span>
                                    )}
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
                                            onClick={() => {
                                                setSelectedCheckin(null);
                                                setAvailableCheckoutDates([]);
                                                setShowDatePicker(true);
                                            }}
                                            className="border-r border-gray-300 p-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                                Check-in
                                            </div>
                                            <div className="text-sm">
                                                {fmt(dateRange[0].startDate)}
                                            </div>

                                        </button>

                                        {/* Check-out */}
                                        <button
                                            onClick={() => setShowDatePicker(true)}
                                            className="p-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                                Check-out
                                            </div>
                                            <div className="text-sm">
                                                {fmt(dateRange[0].endDate)}                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Airbnb-Style Date Picker Popup */}
                                {/* Modal Component */}
                                {showDatePicker && (
                                    <div className="modal-portal">
                                        {/* Overlay */}
                                        <div
                                            className="modal-overlay"
                                            onClick={() => setShowDatePicker(false)}
                                        />

                                        {/* Calendar Modal */}
                                        <div className="modal-container">
                                            <div className="modal-content">
                                                {/* Close button */}
                                                <button
                                                    onClick={() => setShowDatePicker(false)}
                                                    className="modal-close-btn"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>

                                                {/* Calendar Header */}
                                                <div className="modal-header">
                                                    <div className="text-sm text-gray-600">
                                                        {calculateNights()} Nächte
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {fmt(dateRange[0].startDate, 'dd. MMM. yyyy')} - {fmt(dateRange[0].endDate, 'dd. MMM. yyyy')}
                                                    </div>
                                                </div>

                                                {/* Instructions */}
                                                {!selectedCheckin && (
                                                    <div className="modal-instruction modal-instruction-blue">
                                                        Bitte wählen Sie zuerst ein Check‑in‑Datum. Die Verfügbarkeiten sind nicht markiert.
                                                    </div>
                                                )}
                                                {selectedCheckin && availableCheckoutDates.length > 0 && (
                                                    <div className="modal-instruction modal-instruction-green">
                                                        Check-in ausgewählt. Bitte wählen Sie nun ein Check-out Datum(nicht markiert).
                                                    </div>
                                                )}

                                                {/* Date Range Picker Container */}
                                                <div className="calendar-wrapper">
                                                    <div className="airbnb-calendar-container">
                                                        <DateRangePicker
                                                            ranges={pickerRanges}
                                                            rangeColors={hasRealRange ? ['#00BB77'] : ['transparent']}
                                                            moveRangeOnFirstSelection={false}
                                                            onChange={handleDateChange}
                                                            onShownDateChange={(shownDate) => {
                                                                console.log('📅 Month changed to:', shownDate);
                                                                if (shownDate) {
                                                                    checkAndLoadAvailabilityForDate(shownDate);
                                                                }
                                                            }}
                                                            showSelectionPreview={true}
                                                            months={1}
                                                            direction="horizontal"
                                                            minDate={new Date()}
                                                            disabledDay={(date) => {
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                if (date < today) return true;
                                                                if (!isDateInLoadedPeriod(date)) return true;
                                                                return false;
                                                            }}
                                                            dayContentRenderer={customDayContent}
                                                            monthDisplayFormat="MMMM yyyy"
                                                            staticRanges={[]}
                                                            inputRanges={[]}
                                                            preventSnapRefocus={true}
                                                            calendarFocus="forwards"
                                                            weekStartsOn={1}
                                                        />


                                                    </div>
                                                </div>

                                                {/* Calendar Footer */}
                                                <div className="modal-footer">
                                                    <button
                                                        onClick={() => {
                                                            setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
                                                            setSelectedCheckin(null);
                                                            setAvailableCheckoutDates([]);
                                                            setPricing(null);
                                                        }}

                                                        className="reset-btn"
                                                    >
                                                        Reisedaten zurücksetzen
                                                    </button>

                                                    <button
                                                        onClick={() => setShowDatePicker(false)}
                                                        className="close-btn"
                                                    >
                                                        Schließen
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Updated Styles */}
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
       /* =========================
   STATE STYLES (unchanged colors)
   ========================= */

/* Roompot arrival (primary) */
.airbnb-calendar-container .roompot-arrival-day {
  background: #22c55e !important;
  color: #fff !important;
  border: 2px solid #16a34a !important;
  font-weight: 700 !important;
}
.airbnb-calendar-container .roompot-arrival-day:hover {
  background: #16a34a !important;
  transform: scale(1.02) !important; /* slightly reduced for smoother hover */
}

/* Checkout window (kept clickable) */
.airbnb-calendar-container .checkout-window-day {
  background: rgba(34, 197, 94, 0.15) !important;
  border: 1px solid rgba(34, 197, 94, 0.5) !important;
  color: #15803d !important;
}

/* Not-arrival day: block interaction via :has(), with fallback class */
@supports selector(.rdrDay:has(*)) {
  .airbnb-calendar-container .rdrDay:has(.not-arrival-day) {
    pointer-events: none !important;
    cursor: not-allowed !important;
    background: rgba(34, 197, 94, 0.15) !important;
    color: #15803d !important;
    border: 1px solid rgba(34, 197, 94, 0.5) !important;
  } 
}


/* Fallback if :has() not supported (use from JS on the cell when needed) */
.airbnb-calendar-container .rdrDay.not-arrival-cell {
  pointer-events: none !important;
  cursor: not-allowed !important;
  background: rgba(34, 197, 94, 0.15) !important;
  color: #15803d !important;
  border: 1px solid rgba(34, 197, 94, 0.5) !important;
}

/* Not bookable day */
.airbnb-calendar-container .rdrDay:has(.not-bookable-day) {
  pointer-events: none !important;
  cursor: not-allowed !important;
  background: rgba(244, 143, 177, 0.4) !important;
  border: 1px solid rgba(244, 143, 177, 0.6) !important;
}

/* =========================
   MODAL FOUNDATION
   ========================= */

.modal-portal {
  position: fixed !important;
  inset: 0 !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: linear-gradient(135deg, rgba(0,0,0,.4), rgba(0,0,0,.6)) !important;
  z-index: 99998 !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  animation: fadeIn .3s ease-out !important;
}
@keyframes fadeIn { from {opacity:0} to {opacity:1} }
@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%,-45%) scale(.95); }
  to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
}
.modal-container {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: auto !important;
  max-width: calc(100vw - 2rem) !important;
  z-index: 99999 !important;
  animation: slideUp .4s cubic-bezier(.34,1.56,.64,1) !important;
}
.modal-content {
  background: linear-gradient(135deg,#fff,#fafafa) !important;
  border-radius: 20px !important;
  box-shadow:
    0 25px 50px -12px rgba(0,0,0,.25),
    0 0 0 1px rgba(255,255,255,.8),
    inset 0 1px 0 rgba(255,255,255,.9) !important;
  border: 1px solid rgba(255,255,255,.2) !important;
  padding: 0 !important;
  padding-top: 5rem !important;
  max-width: fit-content !important;
  width: fit-content !important;
  max-height: 85vh !important;
  overflow-y: auto !important;
  position: relative !important;
  -webkit-overflow-scrolling: touch !important;
}

/* Close button */
.modal-close-btn {
  position: absolute !important;
  top: 1.5rem !important;
  right: 1.5rem !important;
  z-index: 10 !important;
  padding: .75rem !important;
  background: rgba(255,255,255,.9) !important;
  border: 1px solid rgba(0,0,0,.1) !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  transition: all .3s cubic-bezier(.34,1.56,.64,1) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.1) !important;
}
.modal-close-btn:hover {
  background: rgba(248,250,252,.95) !important;
  border-color: rgba(0,0,0,.2) !important;
  transform: scale(1.1) rotate(90deg) !important;
  box-shadow: 0 6px 20px rgba(0,0,0,.15) !important;
}

/* Header + instructions */
.modal-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 1.5rem !important;
  padding: 0 2rem 1.5rem !important;
  border-bottom: 1px solid rgba(0,0,0,.08) !important;
  background: linear-gradient(90deg, rgba(92,230,92,.05), rgba(0,154,0,.05)) !important;
}
.modal-header div {
  font-weight: 600 !important;
  color: #374151 !important;
  font-size: .95rem !important;
}
.modal-instruction {
  margin: 0 2rem 1.5rem !important;
  padding: 1rem 1.25rem !important;
  border-radius: 12px !important;
  font-size: .9rem !important;
  text-align: center !important;
  font-weight: 500 !important;
  position: relative !important;
  overflow: hidden !important;
}
.modal-instruction::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 0 0 -100% !important;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent) !important;
  animation: shimmer 2s infinite !important;
}
@keyframes shimmer { 0%{left:-100%} 100%{left:100%} }
.modal-instruction-blue {
  background: linear-gradient(135deg,#eff6ff,#dbeafe) !important;
  color: #1e40af !important;
  border: 1px solid #93c5fd !important;
  box-shadow: 0 4px 6px -1px rgba(59,130,246,.1) !important;
}
.modal-instruction-green {
  background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important;
  color: #166534 !important;
  border: 1px solid #86efac !important;
  box-shadow: 0 4px 6px -1px rgba(34,197,94,.1) !important;
}
.calendar-wrapper {
  width: fit-content !important;
  display: flex !important;
  justify-content: center !important;
  margin: 0 auto !important;
  padding: 0 1rem !important;
}

/* Footer */
.modal-footer {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 1.5rem 2rem !important;
  border-top: 1px solid rgba(0,0,0,.08) !important;
  margin-top: 1.5rem !important;
  background: linear-gradient(90deg, rgba(249,250,251,.8), rgba(243,244,246,.8)) !important;
}
.reset-btn {
  font-size: .9rem !important;
  color: #6b7280 !important;
  text-decoration: underline !important;
  background: none !important;
  border: none !important;
  cursor: pointer !important;
  transition: all .3s ease !important;
  padding: .75rem 1rem !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
}
.reset-btn:hover {
  color: #374151 !important;
  background: rgba(0,0,0,.05) !important;
  text-decoration: none !important;
  transform: translateY(-1px) !important;
}
.close-btn {
  background: linear-gradient(135deg,#1f2937,#374151) !important;
  color: #fff !important;
  padding: .875rem 2rem !important;
  border-radius: 12px !important;
  font-size: .9rem !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer !important;
  transition: all .3s cubic-bezier(.34,1.56,.64,1) !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1) !important;
  position: relative !important;
  overflow: hidden !important;
}
.close-btn::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 0 0 -100% !important;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent) !important;
  transition: left .5s ease !important;
}
.close-btn:hover::before { left: 100% !important; }
.close-btn:hover {
  background: linear-gradient(135deg,#374151,#4b5563) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 15px -3px rgba(0,0,0,.2) !important;
}

/* =========================
   CALENDAR (react-date-range)
   ========================= */

.airbnb-calendar-container {
  position: relative !important;
  z-index: 1 !important;
  background: linear-gradient(135deg,#ffffff,#fafafa) !important;
  border-radius: 16px !important;
  width: fit-content !important;
  min-width: 320px !important;
  margin: 0 auto !important;
  padding: 1.5rem !important;
  box-shadow:
    0 10px 25px -5px rgba(0,0,0,.1),
    0 0 0 1px rgba(0,0,0,.05) !important;
  border: 1px solid rgba(255,255,255,.2) !important;
}
.airbnb-calendar-container > div { margin: 0 !important; padding: 0 !important; }
.airbnb-calendar-container .rdrCalendarWrapper {
  width: 100% !important; min-width: 280px !important; box-sizing: border-box !important;
}
.airbnb-calendar-container .rdrDateRangeWrapper,
.airbnb-calendar-container .rdrDateRangePickerWrapper {
  border: none !important; margin: 0 !important; padding: 0 !important;
}
.airbnb-calendar-container .rdrDefinedRangesWrapper,
.airbnb-calendar-container .rdrDateDisplayWrapper {
  display: none !important;
}

/* Months */
.airbnb-calendar-container .rdrMonths {
  margin: 0 !important; padding: 0 !important; display: flex !important; gap: 2rem !important;
}
.airbnb-calendar-container .rdrMonth {
  padding: 1rem !important; margin: 0 !important;
  background: rgba(255,255,255,.7) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.05) !important;
  backdrop-filter: blur(10px) !important;
  width: 100% !important; min-width: 280px !important; box-sizing: border-box !important;
}
.airbnb-calendar-container .rdrMonthAndYearWrapper { width: 100% !important; box-sizing: border-box !important; }
.airbnb-calendar-container .rdrMonthAndYearPickers {
  font-weight: 700 !important; font-size: 1.125rem !important; color: #1f2937 !important; letter-spacing: -0.025em !important;
}

/* Nav buttons */
.airbnb-calendar-container .rdrNextPrevButton {
  background: linear-gradient(135deg,#fff,#f8fafc) !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 50% !important;
  width: 2.5rem !important; height: 2.5rem !important;
  transition: all .3s cubic-bezier(.34,1.56,.64,1) !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  box-shadow: 0 2px 4px rgba(0,0,0,.1) !important; position: relative !important; overflow: hidden !important;
}
.airbnb-calendar-container .rdrNextPrevButton::before {
  content: '' !important; position: absolute !important; top: 50% !important; left: 50% !important;
  width: 0 !important; height: 0 !important; background: rgba(92,230,92,.1) !important; border-radius: 50% !important;
  transition: all .3s ease !important; transform: translate(-50%,-50%) !important;
}
.airbnb-calendar-container .rdrNextPrevButton:hover::before { width: 100% !important; height: 100% !important; }
.airbnb-calendar-container .rdrNextPrevButton:hover {
  background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important;
  border-color: #5CE65C !important; transform: scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(92,230,92,.25) !important;
}

/* Week header */
.airbnb-calendar-container .rdrWeekDays {
  padding: .25rem 0 !important; margin-bottom: .25rem !important;
  background: rgba(255,255,255,.6) !important; border-radius: 8px !important; border: 1px solid rgba(0,0,0,.05) !important;
  display: grid !important; grid-template-columns: repeat(7,1fr) !important; gap: 0 !important; width: 100% !important;
}
.airbnb-calendar-container .rdrWeekDay {
  color: #5e5e5e !important; font-weight: 900 !important; font-size: .75rem !important;
  text-transform: uppercase !important; letter-spacing: .05em !important;
  height: 2rem !important; display: flex !important; align-items: center !important; justify-content: center !important;
}

/* Days grid */
.airbnb-calendar-container .rdrDays {
  display: grid !important; grid-template-columns: repeat(7,1fr) !important; gap: .125rem !important; width: 100% !important;
}

/* Day cell */
.airbnb-calendar-container .rdrDay {
  height: 2.5rem !important; width: 100% !important; line-height: 2.5rem !important; margin: 0 !important;
  border-radius: 10px !important; position: relative !important; cursor: pointer !important;
  transition: all .25s cubic-bezier(.34,1.56,.64,1) !important;
  border: 2px solid transparent !important;
  background: rgba(245,255,245,.8) !important;
  overflow: hidden !important; box-sizing: border-box !important;
  color: #374151 !important; /* force override any inline color */
}
.airbnb-calendar-container .rdrDay::before {
  content: '' !important; position: absolute !important; top: 50% !important; left: 50% !important;
  width: 0 !important; height: 0 !important; background: rgba(92,230,92,.1) !important; border-radius: 50% !important;
  transition: all .3s ease !important; transform: translate(-50%,-50%) !important; z-index: 0 !important;
}
.airbnb-calendar-container .rdrDay:hover::before { width: 120% !important; height: 120% !important; }
.airbnb-calendar-container .rdrDay:hover {
  background: rgba(255,255,255,.95) !important;
  transform: scale(1.02) translateY(-0.5px) !important;
  box-shadow: 0 2px 6px rgba(0,0,0,.10) !important;
  border-color: rgba(92,230,92,.3) !important;
  color: #166534 !important;
}
.airbnb-calendar-container .rdrDay:active { transform: scale(.95) !important; transition: transform .1s ease !important; }

/* Day number */
.airbnb-calendar-container .rdrDayNumber {
  font-weight: 500 !important; color: #374151 !important; font-size: .875rem !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  width: 100% !important; height: 100% !important; border-radius: 8px !important;
  transition: all .2s ease !important; position: relative !important; z-index: 1 !important;
}

/* Today */
.airbnb-calendar-container .rdrDayToday {
  background: linear-gradient(135deg,#fef3c7,#fde68a) !important;
  border: 2px solid #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245,158,11,.2) !important;
}
.airbnb-calendar-container .rdrDayToday .rdrDayNumber { font-weight: 700 !important; color: #92400e !important; }
.airbnb-calendar-container .rdrDayToday .rdrDayNumber:after { display: none !important; }

/* Hovered */
.airbnb-calendar-container .rdrDayHovered {
  background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important;
  border: 2px solid #5CE65C !important;
  box-shadow: 0 2px 8px rgba(92,230,92,.2) !important;
  color: #166534 !important;
}

/* Selected edges + active */
.airbnb-calendar-container .rdrDayActive [style*="rgb(236, 72, 153)"],
.airbnb-calendar-container .rdrDayEndEdge,
.airbnb-calendar-container .rdrDayEndEdge.rdrDayActive {
  background: linear-gradient(135deg,#5CE65C,#009A00) !important;
  color: #fff !important; border: 2px solid #009A00 !important;
  box-shadow: 0 4px 15px rgba(92,230,92,.4), 0 0 0 3px rgba(92,230,92,.2) !important;
  transform: scale(1.05) !important;
}
.airbnb-calendar-container .rdrDayActive .rdrDayNumber,
.airbnb-calendar-container .rdrDayStartEdge .rdrDayNumber,
.airbnb-calendar-container .rdrDayEndEdge .rdrDayNumber {
color: inherit !important;
}

/* In-range */
.airbnb-calendar-container .rdrDayInRange {
  background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important;
  color: #166534 !important; border: 1px solid #86efac !important;
  box-shadow: inset 0 1px 3px rgba(92,230,92,.1) !important;
}
.airbnb-calendar-container .rdrDayInRange .rdrDayNumber { color: #166534 !important; font-weight: 600 !important; }

/* Disabled */
.airbnb-calendar-container .rdrDayDisabled {
  color: #303030 !important; cursor: not-allowed !important; position: relative !important;
  background: linear-gradient(135deg,#f9fafb,#f3f4f6) !important;
  border: 1px solid #e5e7eb !important; opacity: .6 !important; pointer-events: none !important;
}
.airbnb-calendar-container .rdrDayDisabled::before,
.airbnb-calendar-container .rdrDayDisabled .rdrDayNumber:after { display: none !important; }
.airbnb-calendar-container .rdrDayDisabled::after {
  content: '' !important; position: absolute !important; top: 50% !important; left: 50% !important;
  width: 1.5rem !important; height: .125rem !important; background: #2b2b2b !important;
  transform: translate(-50%, -50%) rotate(45deg) !important; pointer-events: none !important; z-index: 2 !important; border-radius: 1px !important;
}
.airbnb-calendar-container .rdrDayDisabled.rdrDayActive,
.airbnb-calendar-container .rdrDayDisabled.rdrDayStartEdge,
.airbnb-calendar-container .rdrDayDisabled.rdrDayEndEdge,
.airbnb-calendar-container .rdrDayDisabled.rdrDayInRange {
  background: linear-gradient(135deg,#f9fafb,#f3f4f6) !important;
  color: #d1d5db !important; border: 1px solid #e5e7eb !important; box-shadow: none !important; transform: none !important;
}

/* Month name */
.airbnb-calendar-container .rdrMonthName {
  font-weight: 700 !important; font-size: 1.125rem !important; color: #1f2937 !important; letter-spacing: -0.025em !important;
}

/* Focus */
.airbnb-calendar-container .rdrDay:focus {
  outline: none !important;
  border: 2px solid #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59,130,246,.2) !important;
}

/* =========================
   RESPONSIVE
   ========================= */

@media (max-width: 1024px) and (min-width: 769px) {
  .modal-container { padding: 1rem !important; max-width: calc(100vw - 2rem) !important; }
  .airbnb-calendar-container .rdrMonths { gap: 1.5rem !important; }
}

@media (max-width: 768px) {
  .modal-container {
    left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important;
    padding: .5rem !important; width: calc(100vw - 1rem) !important; max-width: calc(100vw - 1rem) !important;
    height: auto !important; max-height: calc(100vh - 1rem) !important;
  }
  .modal-content {
    padding: 0 !important; padding-top: 3rem !important; margin: 0 !important; width: 100% !important; max-width: 100% !important;
    border-radius: 12px !important; max-height: calc(100vh - 1rem) !important; overflow-y: auto !important; display: flex !important; flex-direction: column !important;
  }
  .modal-close-btn { top: .75rem !important; right: .75rem !important; padding: .5rem !important; width: 2rem !important; height: 2rem !important; z-index: 1000 !important; }
  .modal-header { padding: 0 1rem .75rem 1rem !important; font-size: .875rem !important; flex-shrink: 0 !important; }
  .modal-instruction { margin: 0 1rem .75rem 1rem !important; padding: .75rem !important; font-size: .813rem !important; flex-shrink: 0 !important; }
  .calendar-wrapper { padding: 0 .5rem !important; overflow-x: auto !important; flex: 1 !important; display: flex !important; justify-content: center !important; }
  .modal-footer {
    padding: .75rem 1rem !important; flex-direction: column !important; gap: .75rem !important; flex-shrink: 0 !important;
    border-top: 1px solid rgba(0,0,0,.08) !important; background: rgba(249,250,251,.95) !important;
  }
  .reset-btn { order: 2 !important; width: 100% !important; text-align: center !important; padding: .75rem !important; }
  .close-btn { order: 1 !important; width: 100% !important; padding: .875rem !important; }

  .airbnb-calendar-container {
    padding: .75rem !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; border-radius: 8px !important; overflow: hidden !important; min-width: 280px !important;
  }
  .airbnb-calendar-container .rdrMonthAndYearWrapper { width: 100% !important; box-sizing: border-box !important; }
  .airbnb-calendar-container .rdrMonths { flex-direction: column !important; gap: 1rem !important; width: 100% !important; }
  .airbnb-calendar-container .rdrMonth { width: 100% !important; max-width: 100% !important; padding: .5rem !important; margin: 0 !important; box-sizing: border-box !important; min-width: 260px !important; }
  .airbnb-calendar-container .rdrMonthAndYearPickers { font-size: .875rem !important; }
  .airbnb-calendar-container .rdrNextPrevButton { width: 1.75rem !important; height: 1.75rem !important; }
  .airbnb-calendar-container .rdrWeekDays { display: grid !important; grid-template-columns: repeat(7,1fr) !important; gap: 0 !important; width: 100% !important; padding: .25rem 0 !important; margin-bottom: .25rem !important; }
  .airbnb-calendar-container .rdrWeekDay {
    width: 100% !important; text-align: center !important; padding: 0 !important; margin: 0 !important; font-size: .6rem !important; height: 1.5rem !important;
    display: flex !important; align-items: center !important; justify-content: center !important; box-sizing: border-box !important;
  }
  .airbnb-calendar-container .rdrDay {
    width: 100% !important; height: 2.25rem !important; margin: 0 !important; padding: 0 !important; display: flex !important; align-items: center !important;
    justify-content: center !important; box-sizing: border-box !important; border-radius: 6px !important;
  }
  .airbnb-calendar-container .rdrDay span {
    width: calc(100% - 4px) !important; height: calc(100% - 4px) !important; display: flex !important; align-items: center !important; justify-content: center !important; margin: 2px !important;
  }
  .airbnb-calendar-container .rdrDayNumber { font-size: .75rem !important; }
  .airbnb-calendar-container .rdrCalendarWrapper { width: 100% !important; box-sizing: border-box !important; min-width: 260px !important; }
  .airbnb-calendar-container .rdrDays { display: grid !important; grid-template-columns: repeat(7,1fr) !important; gap: .125rem !important; width: 100% !important; box-sizing: border-box !important; }
}

@media (max-width: 480px) {
  .modal-container { padding: .25rem !important; width: calc(100vw - .5rem) !important; max-width: calc(100vw - .5rem) !important; max-height: calc(100vh - .5rem) !important; }
  .modal-content { padding-top: 2.5rem !important; border-radius: 8px !important; max-height: calc(100vh - .5rem) !important; }
  .modal-close-btn { top: .5rem !important; right: .5rem !important; padding: .375rem !important; width: 1.75rem !important; height: 1.75rem !important; }
  .modal-header { padding: 0 .75rem .5rem .75rem !important; font-size: .813rem !important; }
  .modal-instruction { margin: 0 .75rem .5rem .75rem !important; padding: .5rem !important; font-size: .75rem !important; }
  .calendar-wrapper { padding: 0 .25rem !important; }
  .modal-footer { padding: .5rem .75rem !important; gap: .5rem !important; }
  .airbnb-calendar-container { padding: .5rem !important; min-width: 250px !important; }
  .airbnb-calendar-container .rdrMonths { gap: .75rem !important; }
  .airbnb-calendar-container .rdrMonth { padding: .375rem !important; min-width: 230px !important; }
  .airbnb-calendar-container .rdrMonthAndYearWrapper { height: 2.25rem !important; padding: 0 .375rem !important; }
  .airbnb-calendar-container .rdrMonthAndYearPickers { font-size: .813rem !important; }
  .airbnb-calendar-container .rdrNextPrevButton { width: 1.5rem !important; height: 1.5rem !important; }
  .airbnb-calendar-container .rdrDay { height: 2rem !important; margin: 0 !important; }
  .airbnb-calendar-container .rdrDayNumber { font-size: .688rem !important; }
  .airbnb-calendar-container .rdrWeekDay { font-size: .563rem !important; height: 1.25rem !important; }
  .airbnb-calendar-container .rdrCalendarWrapper { min-width: 230px !important; }
  .airbnb-calendar-container .rdrDays { gap: .0625rem !important; }
}

@media (max-width: 375px) {
  .airbnb-calendar-container { min-width: 240px !important; }
  .airbnb-calendar-container .rdrMonth { min-width: 220px !important; }
  .airbnb-calendar-container .rdrCalendarWrapper { min-width: 220px !important; }
  .airbnb-calendar-container .rdrDay { height: 1.875rem !important; }
  .airbnb-calendar-container .rdrDayNumber { font-size: .625rem !important; }
}

/* Landscape mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .modal-content { max-height: calc(100vh - .5rem) !important; }
  .modal-footer { flex-direction: row !important; justify-content: space-between !important; }
  .reset-btn { order: 1 !important; width: auto !important; }
  .close-btn { order: 2 !important; width: auto !important; min-width: 6rem !important; }
}

/* Large screens */
@media (min-width: 1440px) {
  .modal-container { max-width: 1200px !important; }
  .airbnb-calendar-container .rdrMonths { gap: 3rem !important; }
  .airbnb-calendar-container { min-width: 350px !important; }
}

/* =========================
   COMPAT / A11Y / PRINT
   ========================= */

@supports (-webkit-appearance: none) {
  .modal-content { -webkit-overflow-scrolling: touch !important; }
  .airbnb-calendar-container { -webkit-transform: translateZ(0) !important; }
}
@-moz-document url-prefix() {
  .modal-content { scrollbar-width: thin !important; scrollbar-color: rgba(0,0,0,.2) transparent !important; }
}
@supports (-ms-ime-align: auto) {
  .modal-container { display: -ms-flexbox !important; -ms-flex-align: center !important; -ms-flex-pack: center !important; }
}

/* Motion + color scheme */
@media (prefers-reduced-motion: reduce) {
  .airbnb-calendar-container .rdrDay:hover { transform: none !important; }
  .modal-overlay, .modal-container, .close-btn, .reset-btn { animation: none !important; transition: none !important; }
}
@media (prefers-color-scheme: dark) {
  .modal-content { background: linear-gradient(135deg,#1f2937,#374151) !important; color: #f9fafb !important; }
  .airbnb-calendar-container { background: linear-gradient(135deg,#374151,#4b5563) !important; }
  .airbnb-calendar-container .rdrMonth { background: rgba(55,65,81,.7) !important; border-color: rgba(255,255,255,.1) !important; }
  .airbnb-calendar-container .rdrDay { background: rgba(31,41,55,.8) !important; color: #f9fafb !important; }
  .airbnb-calendar-container .rdrDayNumber { color: #f9fafb !important; }
  .modal-instruction-blue { background: linear-gradient(135deg,#1e3a8a,#1e40af) !important; color: #dbeafe !important; border-color: #3b82f6 !important; }
  .modal-instruction-green { background: linear-gradient(135deg,#14532d,#166534) !important; color: #bbf7d0 !important; border-color: #22c55e !important; }
}

/* Print */
@media print {
  .modal-portal, .modal-overlay { display: none !important; }
  .rdrDayInRange { background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important; position: relative !important; }
  .rdrDayInRange.rdrDayDisabled { background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important; position: relative !important; }
  .rdrDayInRange.rdrDayDisabled::after {
    content: '' !important; position: absolute !important; top: 50% !important; left: 50% !important;
    width: 1.5rem !important; height: .125rem !important; background: #ef4444 !important;
    transform: translate(-50%, -50%) rotate(45deg) !important; pointer-events: none !important; z-index: 2 !important;
  }
  .rdrDayInRange.rdrDayDisabled .rdrDayNumber { color: #9ca3af !important; text-decoration: line-through !important; }
}
/* Make out-of-month cells clickable again */
.airbnb-calendar-container .rdrDay.rdrDayPassive,
.airbnb-calendar-container .rdrDay.rdrDayPassive * {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Optional: don’t fade the number on passive days */
.airbnb-calendar-container .rdrDay.rdrDayPassive .rdrDayNumber,
.airbnb-calendar-container .rdrDay.rdrDayPassive .rdrDayNumber > span {
  opacity: 1 !important;
  color: inherit !important;
}


            
                                                       
                                                    `
                                        }} />
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
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${
                                                showGuestPicker ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {showGuestPicker && (() => {
                                        // Compute total guests (adults + children + babies + pets)
                                        const totalGuests = Object.values(guests).reduce(
                                            (sum, n) => sum + n,
                                            0
                                        ); // MDN: Array.prototype.reduce citehttps://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

                                        return (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
                                                {[
                                                    {
                                                        key: 'adults',
                                                        label: 'Erwachsene',
                                                        sublabel: 'Ab 13 Jahren',
                                                        icon: Users,
                                                    },
                                                    {
                                                        key: 'children',
                                                        label: 'Kinder',
                                                        sublabel: '2–12 Jahre',
                                                        icon: Users,
                                                    },
                                                    {
                                                        key: 'babies',
                                                        label: 'Kleinkinder',
                                                        sublabel: 'Unter 2 Jahren',
                                                        icon: Baby,
                                                    },

                                                ].map(({ key, label, sublabel, icon: Icon }) => {
                                                    // Disable "+" if:
                                                    // - for pets: pets ≥ 2
                                                    // - otherwise: totalGuests ≥ 6
                                                    const disableAdd = totalGuests >= 6;

                                                    return (
                                                        <div
                                                            key={key}
                                                            className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-200"
                                                        >
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
                                                                    disabled={
                                                                        (key === 'adults' && guests.adults <= 1) ||
                                                                        guests[key] === 0
                                                                    }
                                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                                                                >
                                                                    –
                                                                </button>
                                                                <span className="w-8 text-center">{guests[key]}</span>
                                                                <button
                                                                    onClick={() => updateGuests(key, true)}
                                                                    disabled={disableAdd}
                                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>



                                {/* Reserve Button */}
                                {(() => {
                                    const isPriceAvailable = !!pricing?.price && calculateNights() > 0;

                                    return isPriceAvailable ? (
                                        // Price is available
                                        <button
                                            onClick={handleReservation}  // ← Add this onClick
                                            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600
                         text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
                                        >
                                            Reservieren
                                        </button>
                                    ) : (
                                        // Price unavailable
                                        <>
                                            <button
                                                disabled
                                                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold
                            py-3 rounded-lg opacity-50 cursor-not-allowed transition-all transform"
                                            >
                                                Reservieren
                                            </button>
                                            <p className="text-center text-sm text-gray-600 mt-3">
                                                Du musst noch nichts bezahlen
                                            </p>
                                        </>
                                    );
                                })()}


                                {/* Price Breakdown */}
                                {pricing && calculateNights() > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="underline">
                                                €{(
                                                parseFloat(pricing.price?.replace(/[^0-9.]/g, '') || '0')
                                                / calculateNights()
                                            ).toFixed(2)} × {calculateNights()} Nächte
                                            </span>
                                            <span>
                                                     €{(
                                                parseFloat(pricing.price?.replace(/[^0-9.]/g, '') || '0')
                                            ).toFixed(2)}
                                                 </span>
                                        </div>

                                        {/* Towels breakdown */}
                                        {selectedExtras.towels && (
                                            <div className="flex justify-between text-sm">
                                                <span>Handtücher ({guests.adults + guests.children + guests.babies} Person(en))</span>
                                                <span>€{8 * (guests.adults + guests.children + guests.babies)}.00</span>
                                            </div>
                                        )}

                                        {/* Pets breakdown */}
                                        {selectedExtras.pets && guests.pets > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Haustier-Gebühr ({guests.pets} Haustier{guests.pets > 1 ? 'e' : ''})</span>
                                                <span>€{7 * guests.pets}.00</span>
                                            </div>
                                        )}

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
                                            <span>€{calculateTotalWithExtras().toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global CSS for Airbnb Calendar */}
        </div>
    );
};

export default HotelDetailss;
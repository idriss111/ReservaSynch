{/* Extras Selection */}
<div className="relative mb-6">


    <button
        onClick={() => setShowExtrasPicker(!showExtrasPicker)}
        className="w-full border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
    >
        <div>
            <div
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Extras
            </div>
            <div className="text-sm">
                {(() => {
                    const selectedCount =
                        (selectedExtras.towels ? 1 : 0) +
                        (guests.pets > 0 ? 1 : 0); // Count pets as an extra if > 0

                    if (selectedCount === 0) return 'Keine Extras';
                    if (selectedCount === 1) return '1 Extra gewählt';
                    return `${selectedCount} Extras gewählt`;
                })()}
            </div>
        </div>
        <ChevronDown
            className={`w-4 h-4 transition-transform ${
                showExtrasPicker ? 'rotate-180' : ''
            }`}
        />
    </button>

    {showExtrasPicker && (
        <div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
            {/* Towels Option */}
            <div
                className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H4V7z"/>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v10"/>
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium">Handtücher</div>
                        <div className="text-sm text-gray-500">
                            Miete möglich, € 8.00 p.P./ Aufenthalt
                        </div>
                        {selectedExtras.towels && (
                            <div className="text-xs text-green-600 font-medium">
                                {guests.adults + guests.children + guests.babies} Person(en)
                                × €8.00 =
                                €{8 * (guests.adults + guests.children + guests.babies)}.00
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                    <label
                        className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={selectedExtras.towels}
                            onChange={(e) => setSelectedExtras(prev => ({
                                ...prev,
                                towels: e.target.checked
                            }))}
                        />
                        <div
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                </div>
            </div>

            {/* Pets Option - now with +/- buttons instead of just showing when pets > 0 */}
            <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    <Dog className="w-5 h-5 text-gray-600"/>
                    <div>
                        <div className="font-medium">Haustiere</div>
                        <div className="text-sm text-gray-500">
                            € 7.00 pro Haustier/ Nacht (max. 2)
                        </div>
                        {guests.pets > 0 && selectedExtras.pets && (
                            <div className="text-xs text-green-600 font-medium">
                                {guests.pets} Haustier(e) × €7.00
                                × {calculateNights()} Nächte =
                                €{7 * guests.pets * calculateNights()}.00

                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => updateGuests('pets', false)}
                        disabled={guests.pets === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                    >
                        –
                    </button>
                    <span className="w-8 text-center">{guests.pets}</span>
                    <button
                        onClick={() => {
                            updateGuests('pets', true);
                            // Auto-enable pet fee when adding pets
                            if (guests.pets === 0) {
                                setSelectedExtras(prev => ({
                                    ...prev,
                                    pets: true
                                }));
                            }
                        }}
                        disabled={guests.pets >= 2}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Pet fee toggle - only show when pets > 0 */}
            {guests.pets > 0 && (
                <div
                    className="flex items-center justify-between py-2 pl-8 border-l-2 border-gray-100 ml-8">
                    <div className="text-sm text-gray-600">
                        Haustier-Gebühr hinzufügen
                    </div>
                    <label
                        className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={selectedExtras.pets}
                            onChange={(e) => setSelectedExtras(prev => ({
                                ...prev,
                                pets: e.target.checked
                            }))}
                        />
                        <div
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                </div>
            )}
        </div>
    )}
</div>
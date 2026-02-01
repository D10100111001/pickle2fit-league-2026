import React from 'react';
import { useState } from 'react';
import { CalendarClock, Filter } from 'lucide-react';
import { usePlayers, useTimeSlots } from '../providers';
import { Card } from '../common';
import { TimeSlotCard } from './TimeSlotCard';
import { TimeSlotProposalModal } from './TimeSlotProposalModal';

export const TimeSlotScheduler = ({ matches }) => {
  const { timeSlots, proposeTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimeSlots();
  const { getPlayerName } = usePlayers();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showPastSlots, setShowPastSlots] = useState(false);

  // Filter active time slots and separate by past/upcoming
  const now = new Date();
  const activeSlots = timeSlots.filter(slot => slot.status === 'active');
  const upcomingSlots = activeSlots.filter(slot => new Date(slot.dateTime) >= now);
  const pastSlots = activeSlots.filter(slot => new Date(slot.dateTime) < now);

  const slotsToDisplay = showPastSlots ? activeSlots : upcomingSlots;

  return (
    <>
      {showProposalModal && (
        <TimeSlotProposalModal
          onClose={() => setShowProposalModal(false)}
          onSubmit={proposeTimeSlot}
        />
      )}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <CalendarClock className="text-lime-400" size={28} />
              Schedule
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Propose play times and RSVP for matches
            </p>
          </div>
          <button
            onClick={() => setShowProposalModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-lime-500/20 transition-all duration-200 flex items-center gap-2"
          >
            <CalendarClock size={18} />
            Propose Time
          </button>
        </div>

        {/* Filter Toggle */}
        {pastSlots.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPastSlots(!showPastSlots)}
              className="text-sm text-slate-400 hover:text-lime-400 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              {showPastSlots ? 'Hide' : 'Show'} Past Slots ({pastSlots.length})
            </button>
          </div>
        )}

        {/* Time Slots List */}
        {slotsToDisplay.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarClock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">
              No {showPastSlots ? '' : 'Upcoming '}Time Slots
            </h3>
            <p className="text-slate-500 mb-6">
              Propose a play time to get started
            </p>
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200"
            >
              Propose First Time Slot
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {slotsToDisplay.map(slot => (
              <TimeSlotCard
                key={slot.id}
                timeSlot={slot}
                matches={matches}
                getPlayerName={getPlayerName}
                updateTimeSlot={updateTimeSlot}
                deleteTimeSlot={deleteTimeSlot}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

import React from 'react';
import { useState } from 'react';
import { Calendar, ChevronUp, ChevronDown, Edit3, Trash2 } from 'lucide-react';
import { useTimeSlots } from '../providers';
import { Card, Badge } from '../common';
import { RSVPModal } from '../modals';
import { TimeSlotEditModal } from './TimeSlotEditModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { RSVPSummary } from './RSVPSummary';
import { PlayableMatchesSection } from './PlayableMatchesSection';
import { MissingPlayersSection } from './MissingPlayersSection';
import { calculatePlayableMatches, calculateMissingPlayerImpact } from './timeslotHelpers';

export const TimeSlotCard = ({ timeSlot, matches, getPlayerName, updateTimeSlot, deleteTimeSlot }) => {
  const { getRSVPsForTimeSlot, user } = useTimeSlots();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const rsvps = getRSVPsForTimeSlot(timeSlot.id);
  const comingRsvps = rsvps.filter(r => r.status === 'coming');
  const attendingPlayerIds = comingRsvps.map(r => r.playerId);

  // Calculate playable matches
  const playableMatches = calculatePlayableMatches(matches, attendingPlayerIds);

  // Calculate missing player impact
  const missingPlayers = calculateMissingPlayerImpact(matches, attendingPlayerIds, getPlayerName);

  // Format date/time
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Only mark as "past" if it's from a previous day, not just if the time has passed today
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const slotDate = new Date(timeSlot.dateTime);
  const isPast = slotDate < todayStart;

  const canEdit = user && user.uid === timeSlot.proposedById;

  const handleDelete = async () => {
    try {
      await deleteTimeSlot(timeSlot.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting time slot:', err);
    }
  };

  return (
    <>
      {showRSVPModal && (
        <RSVPModal
          timeSlot={timeSlot}
          onClose={() => setShowRSVPModal(false)}
        />
      )}

      {showEditModal && (
        <TimeSlotEditModal
          timeSlot={timeSlot}
          onClose={() => setShowEditModal(false)}
          onSubmit={updateTimeSlot}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          timeSlot={timeSlot}
        />
      )}

      <Card className={`overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lime-400 font-bold text-lg mb-1">
                <Calendar size={20} />
                {formatDateTime(timeSlot.dateTime)}
              </div>
              {timeSlot.location && (
                <div className="text-slate-400 text-sm flex items-center gap-2">
                  📍 {timeSlot.location}
                </div>
              )}
              <div className="text-slate-500 text-xs mt-2">
                Proposed by {timeSlot.proposedBy}
              </div>
            </div>
            {isPast && (
              <Badge className="bg-slate-700/50 text-slate-400">Past</Badge>
            )}
          </div>

          {timeSlot.notes && (
            <div className="text-slate-300 text-sm bg-slate-900/50 rounded-lg p-3 border border-white/5">
              {timeSlot.notes}
            </div>
          )}

          {/* RSVP Summary */}
          <RSVPSummary
            rsvps={rsvps}
            comingRsvps={comingRsvps}
            getPlayerName={getPlayerName}
          />

          {/* Playable Matches */}
          <PlayableMatchesSection
            playableMatches={playableMatches}
            timeSlot={timeSlot}
            totalRsvps={comingRsvps.length}
          />

          {/* Missing Players */}
          {missingPlayers.length > 0 && (
            <MissingPlayersSection
              missingPlayers={missingPlayers}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRSVPModal(true)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200"
            >
              RSVP
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              Details
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium rounded-xl transition-colors flex items-center gap-2"
                  title="Edit time slot"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-medium rounded-xl transition-colors flex items-center gap-2"
                  title="Delete time slot"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

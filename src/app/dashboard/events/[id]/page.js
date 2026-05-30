import React from 'react';
import EventDetails from '../../../../components/features/events/EventDetails';

export default function EventDetailsPage({ params }) {
    return <EventDetails eventId={params.id} />;
}

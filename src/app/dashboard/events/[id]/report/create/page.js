import React from 'react';
import EventReportCreate from '../../../../../../components/features/events/EventReportCreate';

export default function CreateReportPage({ params }) {
    return <EventReportCreate eventId={params.id} />;
}

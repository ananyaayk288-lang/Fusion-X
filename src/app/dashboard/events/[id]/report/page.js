import React from 'react';
import EventReportView from '../../../../../components/features/events/EventReportView';

export default function ReportViewPage({ params }) {
    return <EventReportView eventId={params.id} />;
}

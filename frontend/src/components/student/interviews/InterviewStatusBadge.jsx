import React from 'react';
import Badge from '../../common/Badge';

export const InterviewStatusBadge = ({ status, size = 'sm' }) => {
  const norm = (status || '').toLowerCase();

  switch (norm) {
    case 'completed':
      return (
        <Badge variant="success" size={size} dot>
          Completed
        </Badge>
      );
    case 'scheduled':
    case 'confirmed':
      return (
        <Badge variant="info" size={size} pulseDot>
          Scheduled
        </Badge>
      );
    case 'in-progress':
    case 'in progress':
      return (
        <Badge variant="success" size={size} pulseDot>
          In Progress
        </Badge>
      );
    case 'pending':
    case 'requested':
      return (
        <Badge variant="warning" size={size}>
          Pending Review
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="danger" size={size}>
          Cancelled
        </Badge>
      );
    case 'rejected':
    case 'declined':
      return (
        <Badge variant="danger" size={size}>
          Declined
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          {status || 'Unknown'}
        </Badge>
      );
  }
};

export default InterviewStatusBadge;
